export const WORKSPACE_PERMISSIONS = [
  'workspace.members.manage',
  'workspace.roles.manage',
  'workspace.ownership.transfer',
  'workspace.chat.all_members',
  'workspace.chat.project_members_only',
] as const

export const PROJECT_PERMISSIONS = [
  'project.create',
  'project.view',
  'project.access.manage',
  'project.todolists.create',
  'project.availability.create',
  'project.todolists.members.assign',
] as const

export const TASK_PERMISSIONS = [
  'task.create',
  'task.update',
  'task.assign',
  'task.status.update',
  'task.status.toggle_done',
  'task.comment.add',
  'task.comment.moderate',
] as const

export const ALL_PERMISSIONS = [
  ...WORKSPACE_PERMISSIONS,
  ...PROJECT_PERMISSIONS,
  ...TASK_PERMISSIONS,
] as const

export type Permission = (typeof ALL_PERMISSIONS)[number]

export const isPermission = (value: string): value is Permission =>
  (ALL_PERMISSIONS as readonly string[]).includes(value)
