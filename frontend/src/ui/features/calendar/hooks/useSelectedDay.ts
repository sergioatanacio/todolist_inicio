import { useState } from 'react'

export const useSelectedDay = (initial: string | null = null) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(initial)
  return { selectedDay, setSelectedDay }
}
