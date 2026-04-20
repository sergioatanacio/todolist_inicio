package planning

const minuteMillis int64 = 60 * 1000

type GreedyStrategy struct{}

func (GreedyStrategy) BuildPlan(input BuildPlanInput) BuildPlanResult {
	clipped := make([]TimeWindow, 0, len(input.Windows))
	for _, window := range input.Windows {
		start := window.StartMillis
		if input.NowMillis > start {
			start = input.NowMillis
		}
		if start < window.EndMillis {
			clipped = append(clipped, TimeWindow{
				StartMillis: start,
				EndMillis:   window.EndMillis,
			})
		}
	}

	result := BuildPlanResult{
		PlannedBlocks:    []ScheduledTaskBlock{},
		UnplannedTaskIDs: []string{},
	}
	if len(clipped) == 0 {
		for _, task := range input.Tasks {
			result.UnplannedTaskIDs = append(result.UnplannedTaskIDs, task.TaskID)
		}
		return result
	}

	windowIndex := 0
	cursor := clipped[0].StartMillis
	moveCursor := func() bool {
		for windowIndex < len(clipped) {
			current := clipped[windowIndex]
			if cursor < current.StartMillis {
				cursor = current.StartMillis
			}
			if cursor < current.EndMillis {
				return true
			}
			windowIndex++
			if windowIndex < len(clipped) {
				cursor = clipped[windowIndex].StartMillis
			}
		}
		return false
	}

	for _, task := range input.Tasks {
		remaining := int64(task.DurationMinutes) * minuteMillis
		if remaining <= 0 {
			continue
		}

		for remaining > 0 {
			if !moveCursor() {
				result.UnplannedTaskIDs = append(result.UnplannedTaskIDs, task.TaskID)
				break
			}

			current := clipped[windowIndex]
			available := current.EndMillis - cursor
			consumed := remaining
			if consumed > available {
				consumed = available
			}

			start := cursor
			end := cursor + consumed
			if end > start {
				result.PlannedBlocks = append(result.PlannedBlocks, ScheduledTaskBlock{
					TaskID:          task.TaskID,
					StartMillis:     start,
					EndMillis:       end,
					DurationMinutes: int((end - start) / minuteMillis),
				})
			}

			cursor = end
			remaining -= consumed
		}
	}

	return result
}
