export type AuthMode = 'login' | 'register'

export type AppRoute =
  | { kind: 'landing' }
  | { kind: 'auth'; mode: AuthMode }
  | { kind: 'workspaces' }
  | { kind: 'workspace'; workspaceId: string }
  | { kind: 'workspaceAi'; workspaceId: string }
  | {
      kind: 'project'
      workspaceId: string
      projectId: string
      tab: 'overview' | 'disponibilidades' | 'lists' | 'calendar' | 'ai'
    }
  | {
      kind: 'availability'
      workspaceId: string
      projectId: string
      disponibilidadId: string
    }
  | {
      kind: 'availabilityCalendar'
      workspaceId: string
      projectId: string
      disponibilidadId: string
    }
  | { kind: 'kanban'; workspaceId: string; projectId: string; listId: string }

export const navigate = (path: string, replace = false) => {
  if (replace) window.history.replaceState(null, '', path)
  else window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export const parseRoute = (): AppRoute => {
  const url = new URL(window.location.href)
  const p = url.pathname
  if (p === '/') return { kind: 'landing' }
  if (p === '/auth') {
    return {
      kind: 'auth',
      mode: url.searchParams.get('mode') === 'register' ? 'register' : 'login',
    }
  }
  if (p === '/app/workspaces') return { kind: 'workspaces' }

  const workspace = p.match(/^\/app\/workspaces\/([^/]+)$/)
  if (workspace) {
    return { kind: 'workspace', workspaceId: decodeURIComponent(workspace[1]) }
  }

  const workspaceAi = p.match(/^\/app\/workspaces\/([^/]+)\/ai$/)
  if (workspaceAi) {
    return { kind: 'workspaceAi', workspaceId: decodeURIComponent(workspaceAi[1]) }
  }

  const project = p.match(
    /^\/app\/workspaces\/([^/]+)\/projects\/([^/]+)\/(overview|disponibilidades|lists|calendar|ai)$/,
  )
  if (project) {
    return {
      kind: 'project',
      workspaceId: decodeURIComponent(project[1]),
      projectId: decodeURIComponent(project[2]),
      tab: project[3] as 'overview' | 'disponibilidades' | 'lists' | 'calendar' | 'ai',
    }
  }

  const availability = p.match(
    /^\/app\/workspaces\/([^/]+)\/projects\/([^/]+)\/disponibilidades\/([^/]+)$/,
  )
  if (availability) {
    return {
      kind: 'availability',
      workspaceId: decodeURIComponent(availability[1]),
      projectId: decodeURIComponent(availability[2]),
      disponibilidadId: decodeURIComponent(availability[3]),
    }
  }

  const availabilityCalendar = p.match(
    /^\/app\/workspaces\/([^/]+)\/projects\/([^/]+)\/disponibilidades\/([^/]+)\/calendar$/,
  )
  if (availabilityCalendar) {
    return {
      kind: 'availabilityCalendar',
      workspaceId: decodeURIComponent(availabilityCalendar[1]),
      projectId: decodeURIComponent(availabilityCalendar[2]),
      disponibilidadId: decodeURIComponent(availabilityCalendar[3]),
    }
  }

  const kanban = p.match(
    /^\/app\/workspaces\/([^/]+)\/projects\/([^/]+)\/lists\/([^/]+)\/kanban$/,
  )
  if (kanban) {
    return {
      kind: 'kanban',
      workspaceId: decodeURIComponent(kanban[1]),
      projectId: decodeURIComponent(kanban[2]),
      listId: decodeURIComponent(kanban[3]),
    }
  }

  return { kind: 'landing' }
}

export const isPrivateRoute = (route: AppRoute) =>
  route.kind !== 'landing' && route.kind !== 'auth'
