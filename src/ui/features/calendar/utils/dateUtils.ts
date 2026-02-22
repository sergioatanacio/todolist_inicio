const pad = (value: number): string => String(value).padStart(2, '0')

export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const parseIsoDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export const monthTitle = (year: number, month: number): string =>
  new Date(year, month, 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })

export const startOfCalendarGrid = (year: number, month: number): Date => {
  const firstDay = new Date(year, month, 1)
  const dayOfWeek = firstDay.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() + diff)
  return start
}
