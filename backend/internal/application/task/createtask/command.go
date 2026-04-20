package createtask

import "todolist/backend/internal/application/common"

type Command struct {
	ProjectID       string `json:"projectId"`
	TodoListID      string `json:"todoListId"`
	ActorUserID     int64  `json:"actorUserId"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	DurationMinutes int    `json:"durationMinutes"`
}

func Validate(command Command) (Command, error) {
	projectID, err := common.NormalizeRequiredString(command.ProjectID, "projectId")
	if err != nil {
		return Command{}, err
	}
	todoListID, err := common.NormalizeRequiredString(command.TodoListID, "todoListId")
	if err != nil {
		return Command{}, err
	}
	actorUserID, err := common.EnsurePositiveInt64(command.ActorUserID, "actorUserId")
	if err != nil {
		return Command{}, err
	}
	title, err := common.NormalizeRequiredString(command.Title, "title")
	if err != nil {
		return Command{}, err
	}
	description, err := common.NormalizeRequiredString(command.Description, "description")
	if err != nil {
		return Command{}, err
	}

	return Command{
		ProjectID:       projectID,
		TodoListID:      todoListID,
		ActorUserID:     actorUserID,
		Title:           title,
		Description:     description,
		DurationMinutes: command.DurationMinutes,
	}, nil
}
