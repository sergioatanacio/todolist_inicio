import { useState } from 'react'
import type { CalendarViewMode } from '../types/CalendarViewModels'

export const useCalendarViewMode = (initial: CalendarViewMode = 'month') => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initial)
  return { viewMode, setViewMode }
}
