package task

import (
	"strings"

	domainerrors "todolist/backend/internal/domain/errors"
	"todolist/backend/internal/domain/events"
	"todolist/backend/internal/shared/result"
)

const defaultTaskDurationMinutes = 30

type StatusChange struct {
	FromStatus      Status `json:"fromStatus"`
	ToStatus        Status `json:"toStatus"`
	ChangedByUserID int64  `json:"changedByUserId"`
	ChangedAt       int64  `json:"changedAt"`
}

type Comment struct {
	ID              string  `json:"id"`
	AuthorUserID    int64   `json:"authorUserId"`
	Body            string  `json:"body"`
	ParentCommentID *string `json:"parentCommentId"`
	CreatedAt       int64   `json:"createdAt"`
	UpdatedAt       *int64  `json:"updatedAt"`
	DeletedAt       *int64  `json:"deletedAt"`
}

type Primitives struct {
	ID                        string               `json:"id"`
	ProjectID                 string               `json:"projectId"`
	TodoListID                string               `json:"todoListId"`
	OrderInList               int                  `json:"orderInList"`
	Title                     string               `json:"title"`
	Description               string               `json:"description"`
	DurationMinutes           int                  `json:"durationMinutes"`
	Status                    string               `json:"status"`
	AssigneeUserID            *int64               `json:"assigneeUserId"`
	CreatedByUserID           int64                `json:"createdByUserId"`
	LastStatusChangedByUserID int64                `json:"lastStatusChangedByUserId"`
	ScheduledStart            *int64               `json:"scheduledStart"`
	ScheduledEnd              *int64               `json:"scheduledEnd"`
	Comments                  []Comment            `json:"comments"`
	StatusHistory             []StatusChange       `json:"statusHistory"`
	DomainEvents              []events.DomainEvent `json:"domainEvents"`
	CreatedAt                 int64                `json:"createdAt"`
}

type CreateInput struct {
	ID              string
	ProjectID       string
	TodoListID      string
	Title           string
	Description     string
	CreatedByUserID int64
	DurationMinutes int
	OrderInList     int
	CreatedAt       int64
}

type Aggregate struct {
	id                        string
	projectID                 string
	todoListID                string
	orderInList               Order
	title                     Title
	description               Description
	duration                  Duration
	status                    Status
	assigneeUserID            *int64
	createdByUserID           int64
	lastStatusChangedByUserID int64
	scheduledStart            *int64
	scheduledEnd              *int64
	comments                  []Comment
	statusHistory             []StatusChange
	domainEvents              []events.DomainEvent
	createdAt                 int64
}

func New(input CreateInput) result.Result[*Aggregate] {
	if strings.TrimSpace(input.ID) == "" {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeValidationError,
			"El id de la tarea es requerido",
			nil,
		))
	}
	if input.DurationMinutes == 0 {
		input.DurationMinutes = defaultTaskDurationMinutes
	}
	if input.OrderInList == 0 {
		input.OrderInList = 1
	}

	title, err := NewTitle(input.Title)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	description, err := NewDescription(input.Description)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	duration, err := NewDuration(input.DurationMinutes)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	order, err := NewOrder(input.OrderInList)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	if err := ensureActor(input.CreatedByUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}

	task := &Aggregate{
		id:                        input.ID,
		projectID:                 strings.TrimSpace(input.ProjectID),
		todoListID:                strings.TrimSpace(input.TodoListID),
		orderInList:               order,
		title:                     title,
		description:               description,
		duration:                  duration,
		status:                    StatusPending,
		createdByUserID:           input.CreatedByUserID,
		lastStatusChangedByUserID: input.CreatedByUserID,
		comments:                  []Comment{},
		statusHistory:             []StatusChange{},
		domainEvents: []events.DomainEvent{
			NewCreatedEvent(CreatedPayload{
				TaskID:          input.ID,
				ProjectID:       strings.TrimSpace(input.ProjectID),
				TodoListID:      strings.TrimSpace(input.TodoListID),
				CreatedByUserID: input.CreatedByUserID,
			}),
		},
		createdAt: input.CreatedAt,
	}
	return result.Ok(task)
}

func Rehydrate(data Primitives) result.Result[*Aggregate] {
	if !IsValidStatus(data.Status) {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeValidationError,
			"Estado de tarea invalido",
			nil,
		))
	}

	title, err := NewTitle(data.Title)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	description, err := DescriptionFromOptional(data.Description)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	duration, err := NewDuration(data.DurationMinutes)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	order, err := NewOrder(data.OrderInList)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}

	commentIDs := map[string]struct{}{}
	for _, comment := range data.Comments {
		if _, exists := commentIDs[comment.ID]; exists {
			return result.Fail[*Aggregate](domainerrors.New(
				domainerrors.CodeDuplicate,
				"Comentario duplicado en tarea",
				nil,
			))
		}
		commentIDs[comment.ID] = struct{}{}

		if _, err := normalizeCommentBody(comment.Body); err != nil {
			return result.Fail[*Aggregate](err)
		}
	}
	for _, comment := range data.Comments {
		if comment.ParentCommentID == nil {
			continue
		}
		parent, found := findComment(data.Comments, *comment.ParentCommentID)
		if !found {
			return result.Fail[*Aggregate](domainerrors.New(
				domainerrors.CodeNotFound,
				"Comentario responde a un padre inexistente",
				nil,
			))
		}
		if _, err := TransitionCommentState(CommentStateFromDeletedAt(parent.DeletedAt), CommentEventReply); err != nil {
			return result.Fail[*Aggregate](domainerrors.New(
				domainerrors.CodeInvalidState,
				"Comentario responde a un padre eliminado",
				nil,
			))
		}
	}
	if data.ScheduledStart != nil && data.ScheduledEnd != nil && *data.ScheduledEnd <= *data.ScheduledStart {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeValidationError,
			"La programacion de la tarea es invalida",
			nil,
		))
	}

	for _, change := range data.StatusHistory {
		if !IsValidStatus(string(change.FromStatus)) || !IsValidStatus(string(change.ToStatus)) {
			return result.Fail[*Aggregate](domainerrors.New(
				domainerrors.CodeValidationError,
				"Historial de estados invalido",
				nil,
			))
		}
		if change.FromStatus == change.ToStatus {
			return result.Fail[*Aggregate](domainerrors.New(
				domainerrors.CodeValidationError,
				"Historial de estados contiene una transicion invalida",
				nil,
			))
		}
		eventType, ok := EventForTargetStatus(change.FromStatus, change.ToStatus)
		if !ok || !CanTransition(change.FromStatus, eventType) {
			return result.Fail[*Aggregate](domainerrors.New(
				domainerrors.CodeValidationError,
				"Historial de estados contiene una transicion no permitida",
				nil,
			))
		}
	}

	aggregate := &Aggregate{
		id:                        data.ID,
		projectID:                 data.ProjectID,
		todoListID:                data.TodoListID,
		orderInList:               order,
		title:                     title,
		description:               description,
		duration:                  duration,
		status:                    Status(data.Status),
		assigneeUserID:            cloneInt64Ptr(data.AssigneeUserID),
		createdByUserID:           data.CreatedByUserID,
		lastStatusChangedByUserID: data.LastStatusChangedByUserID,
		scheduledStart:            cloneInt64Ptr(data.ScheduledStart),
		scheduledEnd:              cloneInt64Ptr(data.ScheduledEnd),
		comments:                  cloneComments(data.Comments),
		statusHistory:             cloneStatusHistory(data.StatusHistory),
		domainEvents:              cloneEvents(data.DomainEvents),
		createdAt:                 data.CreatedAt,
	}
	return result.Ok(aggregate)
}

func (a *Aggregate) Rename(rawTitle string) result.Result[*Aggregate] {
	title, err := NewTitle(rawTitle)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	clone := a.clone()
	clone.title = title
	return result.Ok(clone)
}

func (a *Aggregate) UpdateDescription(rawDescription string) result.Result[*Aggregate] {
	description, err := NewDescription(rawDescription)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	clone := a.clone()
	clone.description = description
	return result.Ok(clone)
}

func (a *Aggregate) SetOrderInList(actorUserID int64, rawOrder int) result.Result[*Aggregate] {
	if err := ensureActor(actorUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}
	order, err := NewOrder(rawOrder)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	clone := a.clone()
	clone.orderInList = order
	return result.Ok(clone)
}

func (a *Aggregate) ChangeDuration(actorUserID int64, rawMinutes int) result.Result[*Aggregate] {
	if err := ensureActor(actorUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}
	duration, err := NewDuration(rawMinutes)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	clone := a.clone()
	clone.duration = duration
	return result.Ok(clone)
}

func (a *Aggregate) Assign(actorUserID, assigneeUserID int64) result.Result[*Aggregate] {
	if err := ensureActor(actorUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}
	clone := a.clone()
	clone.assigneeUserID = &assigneeUserID
	return result.Ok(clone)
}

func (a *Aggregate) Unassign(actorUserID int64) result.Result[*Aggregate] {
	if err := ensureActor(actorUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}
	clone := a.clone()
	clone.assigneeUserID = nil
	return result.Ok(clone)
}

func (a *Aggregate) ChangeStatus(actorUserID int64, toStatus Status, changedAt int64) result.Result[*Aggregate] {
	if err := ensureActor(actorUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}
	if a.status == toStatus {
		return result.Ok(a)
	}
	eventType, ok := EventForTargetStatus(a.status, toStatus)
	if !ok {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeInvalidTransition,
			"Transicion de estado no permitida",
			nil,
		))
	}
	nextStatus, err := TransitionStatus(a.status, eventType)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}

	clone := a.clone()
	clone.status = nextStatus
	clone.lastStatusChangedByUserID = actorUserID
	clone.statusHistory = append(clone.statusHistory, StatusChange{
		FromStatus:      a.status,
		ToStatus:        nextStatus,
		ChangedByUserID: actorUserID,
		ChangedAt:       changedAt,
	})
	clone.domainEvents = append(clone.domainEvents, NewStatusChangedEvent(StatusChangedPayload{
		TaskID:          a.id,
		FromStatus:      a.status,
		ToStatus:        nextStatus,
		ChangedByUserID: actorUserID,
	}))
	return result.Ok(clone)
}

func (a *Aggregate) ToggleDone(actorUserID int64, changedAt int64) result.Result[*Aggregate] {
	if a.status == StatusDone {
		return a.ChangeStatus(actorUserID, StatusInProgress, changedAt)
	}
	return a.ChangeStatus(actorUserID, StatusDone, changedAt)
}

func (a *Aggregate) CanTransitionTo(nextStatus Status) bool {
	if a.status == nextStatus {
		return false
	}
	eventType, ok := EventForTargetStatus(a.status, nextStatus)
	if !ok {
		return false
	}
	return CanTransition(a.status, eventType)
}

func (a *Aggregate) AllowedNextStatuses() []Status {
	return AllowedNextStatuses(a.status)
}

func (a *Aggregate) Schedule(actorUserID, scheduledStart, scheduledEnd int64) result.Result[*Aggregate] {
	if err := ensureActor(actorUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}
	if scheduledEnd <= scheduledStart {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeValidationError,
			"El rango de planificacion de la tarea es invalido",
			nil,
		))
	}
	clone := a.clone()
	clone.scheduledStart = &scheduledStart
	clone.scheduledEnd = &scheduledEnd
	clone.domainEvents = append(clone.domainEvents, NewScheduledEvent(ScheduledPayload{
		TaskID:         a.id,
		ScheduledStart: scheduledStart,
		ScheduledEnd:   scheduledEnd,
		ActorUserID:    actorUserID,
	}))
	return result.Ok(clone)
}

func (a *Aggregate) ClearSchedule(actorUserID int64) result.Result[*Aggregate] {
	if err := ensureActor(actorUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}
	clone := a.clone()
	clone.scheduledStart = nil
	clone.scheduledEnd = nil
	return result.Ok(clone)
}

func (a *Aggregate) AddComment(actorUserID int64, commentID string, rawBody string, createdAt int64, parentCommentID *string) result.Result[*Aggregate] {
	if err := ensureActor(actorUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}
	body, err := normalizeCommentBody(rawBody)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}
	if parentCommentID != nil {
		parent, found := findComment(a.comments, *parentCommentID)
		if !found {
			return result.Fail[*Aggregate](domainerrors.New(
				domainerrors.CodeNotFound,
				"No existe el comentario padre",
				nil,
			))
		}
		if _, err := TransitionCommentState(CommentStateFromDeletedAt(parent.DeletedAt), CommentEventReply); err != nil {
			return result.Fail[*Aggregate](domainerrors.New(
				domainerrors.CodeInvalidState,
				"No se puede responder a un comentario eliminado",
				nil,
			))
		}
	}
	if strings.TrimSpace(commentID) == "" {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeValidationError,
			"El id del comentario es requerido",
			nil,
		))
	}

	clone := a.clone()
	clone.comments = append(clone.comments, Comment{
		ID:              commentID,
		AuthorUserID:    actorUserID,
		Body:            body,
		ParentCommentID: cloneStringPtr(parentCommentID),
		CreatedAt:       createdAt,
	})
	clone.domainEvents = append(clone.domainEvents, NewCommentAddedEvent(CommentAddedPayload{
		TaskID:          a.id,
		CommentID:       commentID,
		AuthorUserID:    actorUserID,
		ParentCommentID: cloneStringPtr(parentCommentID),
	}))
	return result.Ok(clone)
}

func (a *Aggregate) EditComment(actorUserID int64, commentID string, rawBody string, editedAt int64) result.Result[*Aggregate] {
	if err := ensureActor(actorUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}
	body, err := normalizeCommentBody(rawBody)
	if err != nil {
		return result.Fail[*Aggregate](err)
	}

	clone := a.clone()
	index := findCommentIndex(clone.comments, commentID)
	if index < 0 {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeNotFound,
			"Comentario no encontrado",
			nil,
		))
	}
	current := clone.comments[index]
	if _, err := TransitionCommentState(CommentStateFromDeletedAt(current.DeletedAt), CommentEventEdit); err != nil {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeInvalidState,
			"No se puede editar un comentario eliminado",
			nil,
		))
	}
	if current.AuthorUserID != actorUserID {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeForbidden,
			"Solo el autor puede editar el comentario",
			nil,
		))
	}

	clone.comments[index].Body = body
	clone.comments[index].UpdatedAt = &editedAt
	clone.domainEvents = append(clone.domainEvents, NewCommentEditedEvent(CommentEditedPayload{
		TaskID:      a.id,
		CommentID:   commentID,
		ActorUserID: actorUserID,
	}))
	return result.Ok(clone)
}

func (a *Aggregate) DeleteComment(actorUserID int64, commentID string, deletedAt int64, force bool) result.Result[*Aggregate] {
	if err := ensureActor(actorUserID); err != nil {
		return result.Fail[*Aggregate](err)
	}

	clone := a.clone()
	index := findCommentIndex(clone.comments, commentID)
	if index < 0 {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeNotFound,
			"Comentario no encontrado",
			nil,
		))
	}
	current := clone.comments[index]
	if _, err := TransitionCommentState(CommentStateFromDeletedAt(current.DeletedAt), CommentEventDelete); err != nil {
		return result.Ok(a)
	}
	if !force && current.AuthorUserID != actorUserID {
		return result.Fail[*Aggregate](domainerrors.New(
			domainerrors.CodeForbidden,
			"Solo el autor puede eliminar el comentario",
			nil,
		))
	}

	clone.comments[index].DeletedAt = &deletedAt
	clone.domainEvents = append(clone.domainEvents, NewCommentDeletedEvent(CommentDeletedPayload{
		TaskID:      a.id,
		CommentID:   commentID,
		ActorUserID: actorUserID,
		Force:       force,
	}))
	return result.Ok(clone)
}

func (a *Aggregate) ToPrimitives() Primitives {
	return Primitives{
		ID:                        a.id,
		ProjectID:                 a.projectID,
		TodoListID:                a.todoListID,
		OrderInList:               a.orderInList.Value(),
		Title:                     a.title.Value(),
		Description:               a.description.Value(),
		DurationMinutes:           a.duration.Value(),
		Status:                    string(a.status),
		AssigneeUserID:            cloneInt64Ptr(a.assigneeUserID),
		CreatedByUserID:           a.createdByUserID,
		LastStatusChangedByUserID: a.lastStatusChangedByUserID,
		ScheduledStart:            cloneInt64Ptr(a.scheduledStart),
		ScheduledEnd:              cloneInt64Ptr(a.scheduledEnd),
		Comments:                  cloneComments(a.comments),
		StatusHistory:             cloneStatusHistory(a.statusHistory),
		DomainEvents:              cloneEvents(a.domainEvents),
		CreatedAt:                 a.createdAt,
	}
}

func (a *Aggregate) DomainEvents() []events.DomainEvent {
	return cloneEvents(a.domainEvents)
}

func (a *Aggregate) ID() string {
	return a.id
}

func (a *Aggregate) ProjectID() string {
	return a.projectID
}

func (a *Aggregate) TodoListID() string {
	return a.todoListID
}

func (a *Aggregate) Title() string {
	return a.title.Value()
}

func (a *Aggregate) Description() string {
	return a.description.Value()
}

func (a *Aggregate) OrderInList() int {
	return a.orderInList.Value()
}

func (a *Aggregate) DurationMinutes() int {
	return a.duration.Value()
}

func (a *Aggregate) Status() Status {
	return a.status
}

func (a *Aggregate) CreatedAt() int64 {
	return a.createdAt
}

func (a *Aggregate) clone() *Aggregate {
	return &Aggregate{
		id:                        a.id,
		projectID:                 a.projectID,
		todoListID:                a.todoListID,
		orderInList:               a.orderInList,
		title:                     a.title,
		description:               a.description,
		duration:                  a.duration,
		status:                    a.status,
		assigneeUserID:            cloneInt64Ptr(a.assigneeUserID),
		createdByUserID:           a.createdByUserID,
		lastStatusChangedByUserID: a.lastStatusChangedByUserID,
		scheduledStart:            cloneInt64Ptr(a.scheduledStart),
		scheduledEnd:              cloneInt64Ptr(a.scheduledEnd),
		comments:                  cloneComments(a.comments),
		statusHistory:             cloneStatusHistory(a.statusHistory),
		domainEvents:              cloneEvents(a.domainEvents),
		createdAt:                 a.createdAt,
	}
}

func ensureActor(actorUserID int64) error {
	if actorUserID <= 0 {
		return domainerrors.New(
			domainerrors.CodeUnauthorized,
			"Actor invalido",
			nil,
		)
	}
	return nil
}

func normalizeCommentBody(raw string) (string, error) {
	normalized := strings.TrimSpace(raw)
	if normalized == "" {
		return "", domainerrors.New(
			domainerrors.CodeValidationError,
			"El comentario no puede estar vacio",
			nil,
		)
	}
	if len(normalized) > 3000 {
		return "", domainerrors.New(
			domainerrors.CodeValidationError,
			"El comentario excede el limite permitido",
			nil,
		)
	}
	return normalized, nil
}

func cloneInt64Ptr(value *int64) *int64 {
	if value == nil {
		return nil
	}
	copy := *value
	return &copy
}

func cloneStringPtr(value *string) *string {
	if value == nil {
		return nil
	}
	copy := *value
	return &copy
}

func cloneComments(values []Comment) []Comment {
	result := make([]Comment, 0, len(values))
	for _, item := range values {
		result = append(result, Comment{
			ID:              item.ID,
			AuthorUserID:    item.AuthorUserID,
			Body:            item.Body,
			ParentCommentID: cloneStringPtr(item.ParentCommentID),
			CreatedAt:       item.CreatedAt,
			UpdatedAt:       cloneInt64Ptr(item.UpdatedAt),
			DeletedAt:       cloneInt64Ptr(item.DeletedAt),
		})
	}
	return result
}

func cloneStatusHistory(values []StatusChange) []StatusChange {
	result := make([]StatusChange, 0, len(values))
	result = append(result, values...)
	return result
}

func cloneEvents(values []events.DomainEvent) []events.DomainEvent {
	result := make([]events.DomainEvent, 0, len(values))
	result = append(result, values...)
	return result
}

func findComment(comments []Comment, id string) (Comment, bool) {
	for _, comment := range comments {
		if comment.ID == id {
			return comment, true
		}
	}
	return Comment{}, false
}

func findCommentIndex(comments []Comment, id string) int {
	for index, comment := range comments {
		if comment.ID == id {
			return index
		}
	}
	return -1
}
