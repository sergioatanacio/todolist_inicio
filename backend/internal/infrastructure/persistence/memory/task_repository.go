package memory

import (
	"context"
	"sync"

	"todolist/backend/internal/domain/task"
)

type TaskRepository struct {
	mu    sync.RWMutex
	items map[string]task.Primitives
}

func NewTaskRepository() *TaskRepository {
	return &TaskRepository{
		items: map[string]task.Primitives{},
	}
}

func (r *TaskRepository) FindByID(_ context.Context, id string) (*task.Aggregate, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	data, ok := r.items[id]
	if !ok {
		return nil, nil
	}
	return task.Rehydrate(data).Unwrap()
}

func (r *TaskRepository) FindByTodoListID(_ context.Context, todoListID string) ([]*task.Aggregate, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	result := []*task.Aggregate{}
	for _, item := range r.items {
		if item.TodoListID != todoListID {
			continue
		}
		aggregate, err := task.Rehydrate(item).Unwrap()
		if err != nil {
			return nil, err
		}
		result = append(result, aggregate)
	}
	return result, nil
}

func (r *TaskRepository) FindByProjectID(_ context.Context, projectID string) ([]*task.Aggregate, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	result := []*task.Aggregate{}
	for _, item := range r.items {
		if item.ProjectID != projectID {
			continue
		}
		aggregate, err := task.Rehydrate(item).Unwrap()
		if err != nil {
			return nil, err
		}
		result = append(result, aggregate)
	}
	return result, nil
}

func (r *TaskRepository) Save(_ context.Context, aggregate *task.Aggregate) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.items[aggregate.ID()] = aggregate.ToPrimitives()
	return nil
}
