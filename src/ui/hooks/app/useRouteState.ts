import { useEffect, useMemo, useState } from 'react'
import {
  type AppRoute,
  parseRoute,
} from '../../router/AppRoute'

export const useRouteState = () => {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute())
  const [authMode, setAuthMode] = useState<'login' | 'register'>(() => {
    const current = parseRoute()
    return current.kind === 'auth' ? current.mode : 'login'
  })

  useEffect(() => {
    const onPop = () => {
      const next = parseRoute()
      setRoute(next)
      if (next.kind === 'auth') setAuthMode(next.mode)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const context = useMemo(() => {
    const workspaceId =
      route.kind === 'workspace' ||
      route.kind === 'project' ||
      route.kind === 'availability' ||
      route.kind === 'availabilityCalendar' ||
      route.kind === 'kanban'
        ? route.workspaceId
        : null

    const projectId =
      route.kind === 'project' ||
      route.kind === 'availability' ||
      route.kind === 'availabilityCalendar' ||
      route.kind === 'kanban'
        ? route.projectId
        : null

    const disponibilidadId =
      route.kind === 'availability' || route.kind === 'availabilityCalendar'
        ? route.disponibilidadId
        : null

    const listId = route.kind === 'kanban' ? route.listId : null

    return { workspaceId, projectId, disponibilidadId, listId }
  }, [route])

  return { route, authMode, setAuthMode, context }
}
