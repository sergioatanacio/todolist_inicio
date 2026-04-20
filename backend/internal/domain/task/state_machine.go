package task

import "todolist/backend/internal/domain/statemachine"

type EventType string

const (
	EventStart    EventType = "START"
	EventPause    EventType = "PAUSE"
	EventComplete EventType = "COMPLETE"
	EventAbandon  EventType = "ABANDON"
)

var transitions = statemachine.TransitionMap[Status, EventType]{
	StatusPending: {
		EventStart:    StatusInProgress,
		EventComplete: StatusDone,
		EventAbandon:  StatusAbandoned,
	},
	StatusInProgress: {
		EventPause:    StatusPending,
		EventComplete: StatusDone,
		EventAbandon:  StatusAbandoned,
	},
	StatusDone: {
		EventStart:   StatusInProgress,
		EventAbandon: StatusAbandoned,
	},
	StatusAbandoned: {
		EventStart: StatusInProgress,
		EventPause: StatusPending,
	},
}

var eventByTargetStatus = map[Status]map[Status]EventType{
	StatusPending: {
		StatusInProgress: EventStart,
		StatusDone:       EventComplete,
		StatusAbandoned:  EventAbandon,
	},
	StatusInProgress: {
		StatusPending:   EventPause,
		StatusDone:      EventComplete,
		StatusAbandoned: EventAbandon,
	},
	StatusDone: {
		StatusInProgress: EventStart,
		StatusAbandoned:  EventAbandon,
	},
	StatusAbandoned: {
		StatusInProgress: EventStart,
		StatusPending:    EventPause,
	},
}

func TransitionStatus(current Status, eventType EventType) (Status, error) {
	return statemachine.Transition(current, eventType, transitions)
}

func CanTransition(current Status, eventType EventType) bool {
	return statemachine.CanTransition(current, eventType, transitions)
}

func EventForTargetStatus(current Status, target Status) (EventType, bool) {
	eventType, ok := eventByTargetStatus[current][target]
	return eventType, ok
}

func AllowedNextStatuses(current Status) []Status {
	events := transitions[current]
	result := make([]Status, 0, len(events))
	for _, next := range events {
		result = append(result, next)
	}
	return result
}
