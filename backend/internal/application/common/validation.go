package common

import (
	"strings"

	domainerrors "todolist/backend/internal/domain/errors"
)

func NormalizeRequiredString(value string, field string) (string, error) {
	normalized := strings.TrimSpace(value)
	if normalized == "" {
		return "", domainerrors.New(
			domainerrors.CodeValidationError,
			field+" es requerido",
			map[string]any{"field": field},
		)
	}
	return normalized, nil
}

func EnsurePositiveInt64(value int64, field string) (int64, error) {
	if value <= 0 {
		return 0, domainerrors.New(
			domainerrors.CodeValidationError,
			field+" debe ser un entero positivo",
			map[string]any{"field": field},
		)
	}
	return value, nil
}
