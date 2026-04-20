package handlers

import (
	"encoding/json"
	"net/http"

	"todolist/backend/internal/application/task/createtask"
	domainerrors "todolist/backend/internal/domain/errors"
)

type TasksHandler struct {
	createTaskUseCase *createtask.UseCase
}

func NewTasksHandler(createTaskUseCase *createtask.UseCase) *TasksHandler {
	return &TasksHandler{createTaskUseCase: createTaskUseCase}
}

func (h *TasksHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		h.handleCreateTask(w, r)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (h *TasksHandler) handleCreateTask(w http.ResponseWriter, r *http.Request) {
	var command createtask.Command
	if err := json.NewDecoder(r.Body).Decode(&command); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error": "payload invalido",
		})
		return
	}

	result := h.createTaskUseCase.Execute(r.Context(), command)
	aggregate, err := result.Unwrap()
	if err != nil {
		writeDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, aggregate.ToPrimitives())
}

func writeDomainError(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	body := map[string]any{
		"error": err.Error(),
	}

	if domainErr, ok := err.(*domainerrors.DomainError); ok {
		switch domainErr.Code {
		case domainerrors.CodeValidationError, domainerrors.CodeInvalidState, domainerrors.CodeInvalidTransition:
			status = http.StatusBadRequest
		case domainerrors.CodeUnauthorized:
			status = http.StatusUnauthorized
		case domainerrors.CodeForbidden:
			status = http.StatusForbidden
		case domainerrors.CodeNotFound:
			status = http.StatusNotFound
		case domainerrors.CodeDuplicate, domainerrors.CodeConflict:
			status = http.StatusConflict
		}
		body["code"] = domainErr.Code
		if domainErr.Details != nil {
			body["details"] = domainErr.Details
		}
	}

	writeJSON(w, status, body)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
