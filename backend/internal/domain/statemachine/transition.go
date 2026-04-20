package statemachine

import (
	"fmt"

	domainerrors "todolist/backend/internal/domain/errors"
)

type TransitionMap[S ~string, E ~string] map[S]map[E]S

func BuildInvalidTransitionMessage[S ~string, E ~string](currentState S, eventType E) string {
	return fmt.Sprintf(
		"Transicion invalida para maquina de estados: state=%s, event=%s",
		currentState,
		eventType,
	)
}

func CanTransition[S ~string, E ~string](currentState S, eventType E, transitions TransitionMap[S, E]) bool {
	events, ok := transitions[currentState]
	if !ok {
		return false
	}
	_, ok = events[eventType]
	return ok
}

func Transition[S ~string, E ~string](currentState S, eventType E, transitions TransitionMap[S, E]) (S, error) {
	events, ok := transitions[currentState]
	if !ok {
		var zero S
		return zero, domainerrors.New(
			domainerrors.CodeInvalidTransition,
			BuildInvalidTransitionMessage(currentState, eventType),
			map[string]any{
				"currentState": currentState,
				"eventType":    eventType,
			},
		)
	}

	nextState, ok := events[eventType]
	if !ok {
		var zero S
		return zero, domainerrors.New(
			domainerrors.CodeInvalidTransition,
			BuildInvalidTransitionMessage(currentState, eventType),
			map[string]any{
				"currentState": currentState,
				"eventType":    eventType,
			},
		)
	}

	return nextState, nil
}
