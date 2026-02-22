export const TASK_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'DONE',
  'ABANDONED',
] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export const isTaskStatus = (value: string): value is TaskStatus =>
  (TASK_STATUSES as readonly string[]).includes(value)
