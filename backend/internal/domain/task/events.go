package task

import "todolist/backend/internal/domain/events"

type CreatedPayload struct {
	TaskID          string `json:"taskId"`
	ProjectID       string `json:"projectId"`
	TodoListID      string `json:"todoListId"`
	CreatedByUserID int64  `json:"createdByUserId"`
}

type StatusChangedPayload struct {
	TaskID          string `json:"taskId"`
	FromStatus      Status `json:"fromStatus"`
	ToStatus        Status `json:"toStatus"`
	ChangedByUserID int64  `json:"changedByUserId"`
}

type ScheduledPayload struct {
	TaskID         string `json:"taskId"`
	ScheduledStart int64  `json:"scheduledStart"`
	ScheduledEnd   int64  `json:"scheduledEnd"`
	ActorUserID    int64  `json:"actorUserId"`
}

type CommentAddedPayload struct {
	TaskID          string  `json:"taskId"`
	CommentID       string  `json:"commentId"`
	AuthorUserID    int64   `json:"authorUserId"`
	ParentCommentID *string `json:"parentCommentId"`
}

type CommentEditedPayload struct {
	TaskID      string `json:"taskId"`
	CommentID   string `json:"commentId"`
	ActorUserID int64  `json:"actorUserId"`
}

type CommentDeletedPayload struct {
	TaskID      string `json:"taskId"`
	CommentID   string `json:"commentId"`
	ActorUserID int64  `json:"actorUserId"`
	Force       bool   `json:"force"`
}

func NewCreatedEvent(payload CreatedPayload) events.DomainEvent {
	return events.New("task.created", payload)
}

func NewStatusChangedEvent(payload StatusChangedPayload) events.DomainEvent {
	return events.New("task.status_changed", payload)
}

func NewScheduledEvent(payload ScheduledPayload) events.DomainEvent {
	return events.New("task.scheduled", payload)
}

func NewCommentAddedEvent(payload CommentAddedPayload) events.DomainEvent {
	return events.New("task.comment_added", payload)
}

func NewCommentEditedEvent(payload CommentEditedPayload) events.DomainEvent {
	return events.New("task.comment_edited", payload)
}

func NewCommentDeletedEvent(payload CommentDeletedPayload) events.DomainEvent {
	return events.New("task.comment_deleted", payload)
}
