package createtask

import (
	"context"

	"todolist/backend/internal/domain/ports"
	"todolist/backend/internal/domain/task"
	"todolist/backend/internal/shared/result"
)

type UseCase struct {
	taskRepository ports.TaskRepository
	unitOfWork     ports.UnitOfWork
	idGenerator    ports.IDGenerator
	clock          ports.Clock
}

func NewUseCase(
	taskRepository ports.TaskRepository,
	unitOfWork ports.UnitOfWork,
	idGenerator ports.IDGenerator,
	clock ports.Clock,
) *UseCase {
	return &UseCase{
		taskRepository: taskRepository,
		unitOfWork:     unitOfWork,
		idGenerator:    idGenerator,
		clock:          clock,
	}
}

func (u *UseCase) Execute(ctx context.Context, command Command) result.Result[*task.Aggregate] {
	input, err := Validate(command)
	if err != nil {
		return result.Fail[*task.Aggregate](err)
	}

	var created *task.Aggregate
	err = u.unitOfWork.RunInTransaction(ctx, func(tx context.Context) error {
		existing, err := u.taskRepository.FindByTodoListID(tx, input.TodoListID)
		if err != nil {
			return err
		}

		taskID, err := u.idGenerator.New("task")
		if err != nil {
			return err
		}

		aggregateResult := task.New(task.CreateInput{
			ID:              taskID,
			ProjectID:       input.ProjectID,
			TodoListID:      input.TodoListID,
			Title:           input.Title,
			Description:     input.Description,
			CreatedByUserID: input.ActorUserID,
			DurationMinutes: input.DurationMinutes,
			OrderInList:     len(existing) + 1,
			CreatedAt:       u.clock.NowMillis(),
		})
		aggregate, err := aggregateResult.Unwrap()
		if err != nil {
			return err
		}

		if err := u.taskRepository.Save(tx, aggregate); err != nil {
			return err
		}

		created = aggregate
		return nil
	})
	if err != nil {
		return result.Fail[*task.Aggregate](err)
	}

	return result.Ok(created)
}
