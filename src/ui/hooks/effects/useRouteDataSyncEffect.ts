import { useEffect } from 'react'
import type { AppRoute } from '../../router/AppRoute'
import type {
  AppDataClearers,
  AppDataSetters,
  AppLoaders,
  ServicesRef,
} from '../actions/types'
import type { AppControllerContextIds } from '../../types/AppUiModels'

type RouteDataSyncEffectDeps = {
  servicesRef: ServicesRef
  userId: number | null
  context: AppControllerContextIds
  route: AppRoute
  loaders: AppLoaders
  setters: AppDataSetters
  clearers: AppDataClearers
}

export const useRouteDataSyncEffect = ({
  servicesRef,
  userId,
  context,
  route,
  loaders,
  setters,
  clearers,
}: RouteDataSyncEffectDeps) => {
  useEffect(() => {
    const services = servicesRef.current
    if (!services || userId === null) return

    loaders.loadWorkspaces(services, userId)

    if (context.workspaceId) {
      loaders.loadWorkspaceContext(services, context.workspaceId, userId)
    } else {
      clearers.clearProjects()
    }

    if (context.projectId) {
      loaders.loadProjectContext(services, context.projectId)
    } else {
      clearers.clearProjectContext()
    }

    if (context.listId) {
      loaders.loadKanban(services, context.listId)
    } else {
      clearers.clearKanban()
    }

    if (route.kind === 'project' && route.tab === 'calendar') {
      setters.setProjectCalendar(
        services.taskPlanning.buildProjectCalendarDetailed(route.projectId, Date.now()),
      )
    } else {
      clearers.clearProjectCalendar()
    }

    if (route.kind === 'availabilityCalendar') {
      setters.setAvailabilityPlan(
        services.taskPlanning.buildDisponibilidadCalendar(route.disponibilidadId),
      )
    } else {
      clearers.clearAvailabilityPlan()
    }

    if (route.kind === 'workspaceAi' && context.workspaceId) {
      loaders.loadAiWorkspaceContext(services, context.workspaceId, userId)
    } else if (
      route.kind === 'project' &&
      route.tab === 'ai' &&
      context.workspaceId &&
      context.projectId
    ) {
      loaders.loadAiProjectContext(
        services,
        context.workspaceId,
        context.projectId,
        userId,
      )
    } else {
      clearers.clearAiContext()
    }
  }, [clearers, context, loaders, route, setters, userId])
}
