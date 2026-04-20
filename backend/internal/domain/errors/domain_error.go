package errors

type Code string

const (
	CodeValidationError   Code = "VALIDATION_ERROR"
	CodeNotFound          Code = "NOT_FOUND"
	CodeDuplicate         Code = "DUPLICATE"
	CodeUnauthorized      Code = "UNAUTHORIZED"
	CodeForbidden         Code = "FORBIDDEN"
	CodeInvalidState      Code = "INVALID_STATE"
	CodeInvalidTransition Code = "INVALID_TRANSITION"
	CodeConflict          Code = "CONFLICT"
)

type DomainError struct {
	Code    Code
	Message string
	Details map[string]any
}

func (e *DomainError) Error() string {
	return e.Message
}

func New(code Code, message string, details map[string]any) error {
	return &DomainError{
		Code:    code,
		Message: message,
		Details: details,
	}
}
