package httpserver

import (
	"encoding/json"
	"net/http"

	"todolist/backend/internal/application/task/createtask"
	"todolist/backend/internal/httpserver/handlers"
	"todolist/backend/internal/infrastructure/clock"
	"todolist/backend/internal/infrastructure/ids"
	"todolist/backend/internal/infrastructure/persistence/memory"
	"todolist/backend/internal/infrastructure/transaction"
)

type healthResponse struct {
	Service string `json:"service"`
	Status  string `json:"status"`
}

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	taskRepository := memory.NewTaskRepository()
	createTaskUseCase := createtask.NewUseCase(
		taskRepository,
		transaction.NoopUnitOfWork{},
		ids.TimeIDGenerator{},
		clock.SystemClock{},
	)
	tasksHandler := handlers.NewTasksHandler(createTaskUseCase)

	mux.HandleFunc("/", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"message": "todo list backend",
			"architecture": []string{
				"clean-architecture",
				"ports-and-adapters",
				"aggregates",
				"result-pattern",
				"state-machines",
				"strategy-pattern",
			},
		})
	})

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(healthResponse{
			Service: "backend",
			Status:  "ok",
		})
	})

	mux.Handle("/api/tasks", tasksHandler)

	return mux
}
