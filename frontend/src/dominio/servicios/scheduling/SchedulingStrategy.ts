import type { SchedulingInput, SchedulingResult } from './SchedulingTypes'

export interface SchedulingStrategy {
  buildPlan(input: SchedulingInput): SchedulingResult
}
