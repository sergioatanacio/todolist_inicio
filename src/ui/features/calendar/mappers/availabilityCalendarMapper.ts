import type { AvailabilityPlanVm } from '../../../types/AppUiModels'
import type { AvailabilityDayVm } from '../types/CalendarViewModels'
import { toIsoDate } from '../utils/dateUtils'

export const mapAvailabilityPlanByDay = (
  plan: AvailabilityPlanVm | null,
): AvailabilityDayVm[] => {
  if (!plan) return []

  const daysMap = new Map<string, AvailabilityDayVm>()
  for (const block of plan.plannedBlocks) {
    const isoDate = toIsoDate(new Date(block.scheduledStart))
    const current =
      daysMap.get(isoDate) ??
      ({
        isoDate,
        totalMinutes: 0,
        blocks: [],
      } satisfies AvailabilityDayVm)

    current.blocks.push(block)
    current.totalMinutes += block.durationMinutes
    daysMap.set(isoDate, current)
  }

  return Array.from(daysMap.values()).sort((a, b) => a.isoDate.localeCompare(b.isoDate))
}
