package task

import "todolist/backend/internal/domain/statemachine"

type CommentState string
type CommentEventType string

const (
	CommentStateActive  CommentState = "ACTIVE"
	CommentStateDeleted CommentState = "DELETED"
)

const (
	CommentEventEdit   CommentEventType = "EDIT"
	CommentEventReply  CommentEventType = "REPLY"
	CommentEventDelete CommentEventType = "DELETE"
)

var commentTransitions = statemachine.TransitionMap[CommentState, CommentEventType]{
	CommentStateActive: {
		CommentEventEdit:   CommentStateActive,
		CommentEventReply:  CommentStateActive,
		CommentEventDelete: CommentStateDeleted,
	},
	CommentStateDeleted: {},
}

func CommentStateFromDeletedAt(deletedAt *int64) CommentState {
	if deletedAt == nil {
		return CommentStateActive
	}
	return CommentStateDeleted
}

func TransitionCommentState(current CommentState, eventType CommentEventType) (CommentState, error) {
	return statemachine.Transition(current, eventType, commentTransitions)
}

func CanTransitionCommentState(current CommentState, eventType CommentEventType) bool {
	return statemachine.CanTransition(current, eventType, commentTransitions)
}
