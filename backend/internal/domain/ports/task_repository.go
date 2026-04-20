package ports

import (
	"context"

	"todolist/backend/internal/domain/task"
)

type TaskRepository interface {
	FindByID(ctx context.Context, id string) (*task.Aggregate, error)
	FindByTodoListID(ctx context.Context, todoListID string) ([]*task.Aggregate, error)
	FindByProjectID(ctx context.Context, projectID string) ([]*task.Aggregate, error)
	Save(ctx context.Context, aggregate *task.Aggregate) error
}
