import type { CalendarDayCellVm, CalendarMonthVm } from '../types/CalendarViewModels'
import { monthTitle, startOfCalendarGrid, toIsoDate } from '../utils/dateUtils'

export const mapProjectCalendarToMonth = (
  calendar: Record<string, number>,
  previewTitlesByDay: Record<string, string[]> = {},
  referenceDate = new Date(),
): CalendarMonthVm => {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const start = startOfCalendarGrid(year, month)
  const cells: CalendarDayCellVm[] = []

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(start)
    current.setDate(start.getDate() + index)
    const isoDate = toIsoDate(current)
    cells.push({
      key: isoDate,
      isoDate,
      dayNumber: current.getDate(),
      inCurrentMonth: current.getMonth() === month,
      taskCount: calendar[isoDate] ?? 0,
      previewTitles: (previewTitlesByDay[isoDate] ?? []).slice(0, 2),
      previewOverflow: Math.max((previewTitlesByDay[isoDate] ?? []).length - 2, 0),
    })
  }

  return {
    title: monthTitle(year, month),
    cells,
  }
}
