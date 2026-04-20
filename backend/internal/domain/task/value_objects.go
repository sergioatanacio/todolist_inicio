package task

import (
	"strings"

	domainerrors "todolist/backend/internal/domain/errors"
)

type Title struct {
	value string
}

func NewTitle(raw string) (Title, error) {
	normalized := strings.TrimSpace(raw)
	if normalized == "" {
		return Title{}, domainerrors.New(
			domainerrors.CodeValidationError,
			"La tarea no puede estar vacia",
			nil,
		)
	}
	if len(normalized) > 160 {
		return Title{}, domainerrors.New(
			domainerrors.CodeValidationError,
			"La tarea excede 160 caracteres",
			nil,
		)
	}
	return Title{value: normalized}, nil
}

func (t Title) Value() string {
	return t.value
}

type Description struct {
	value string
}

func NewDescription(raw string) (Description, error) {
	normalized := strings.TrimSpace(raw)
	if normalized == "" {
		return Description{}, domainerrors.New(
			domainerrors.CodeValidationError,
			"La descripcion de la tarea no puede estar vacia",
			nil,
		)
	}
	if len(normalized) > 500 {
		return Description{}, domainerrors.New(
			domainerrors.CodeValidationError,
			"La descripcion de la tarea excede 500 caracteres",
			nil,
		)
	}
	return Description{value: normalized}, nil
}

func DescriptionFromOptional(raw string) (Description, error) {
	normalized := strings.TrimSpace(raw)
	if normalized == "" {
		return NewDescription("Sin descripcion")
	}
	return NewDescription(normalized)
}

func (d Description) Value() string {
	return d.value
}

type Duration struct {
	minutes int
}

func NewDuration(rawMinutes int) (Duration, error) {
	if rawMinutes <= 0 {
		return Duration{}, domainerrors.New(
			domainerrors.CodeValidationError,
			"La duracion de la tarea debe ser mayor a cero",
			nil,
		)
	}
	if rawMinutes > 7*24*60 {
		return Duration{}, domainerrors.New(
			domainerrors.CodeValidationError,
			"La duracion de la tarea excede el limite permitido",
			nil,
		)
	}
	return Duration{minutes: rawMinutes}, nil
}

func (d Duration) Value() int {
	return d.minutes
}

type Order struct {
	value int
}

func NewOrder(raw int) (Order, error) {
	if raw <= 0 {
		return Order{}, domainerrors.New(
			domainerrors.CodeValidationError,
			"El orden de tarea debe ser un entero positivo",
			nil,
		)
	}
	return Order{value: raw}, nil
}

func (o Order) Value() int {
	return o.value
}
