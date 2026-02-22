export type CalendarViewMode = 'month' | 'list'

export type CalendarDayCellVm = {
  key: string
  isoDate: string
  dayNumber: number
  inCurrentMonth: boolean
  taskCount: number
  previewTitles: string[]
  previewOverflow: number
}

export type CalendarMonthVm = {
  title: string
  cells: CalendarDayCellVm[]
}

export type AvailabilityDayVm = {
  isoDate: string
  totalMinutes: number
  blocks: Array<{
    taskId: string
    todoListId: string
    scheduledStart: number
    scheduledEnd: number
    durationMinutes: number
  }>
}
