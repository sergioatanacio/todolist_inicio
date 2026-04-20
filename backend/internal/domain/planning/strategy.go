package planning

type TimeWindow struct {
	StartMillis int64 `json:"startMillis"`
	EndMillis   int64 `json:"endMillis"`
}

type TaskDemand struct {
	TaskID          string `json:"taskId"`
	DurationMinutes int    `json:"durationMinutes"`
}

type ScheduledTaskBlock struct {
	TaskID          string `json:"taskId"`
	StartMillis     int64  `json:"startMillis"`
	EndMillis       int64  `json:"endMillis"`
	DurationMinutes int    `json:"durationMinutes"`
}

type BuildPlanInput struct {
	Windows   []TimeWindow `json:"windows"`
	Tasks     []TaskDemand `json:"tasks"`
	NowMillis int64        `json:"nowMillis"`
}

type BuildPlanResult struct {
	PlannedBlocks    []ScheduledTaskBlock `json:"plannedBlocks"`
	UnplannedTaskIDs []string             `json:"unplannedTaskIds"`
}

type Strategy interface {
	BuildPlan(input BuildPlanInput) BuildPlanResult
}
