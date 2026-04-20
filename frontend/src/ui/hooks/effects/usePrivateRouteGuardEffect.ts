import { useEffect } from 'react'
import { isPrivateRoute, navigate, type AppRoute } from '../../router/AppRoute'

type PrivateRouteGuardDeps = {
  ready: boolean
  route: AppRoute
  userId: number | null
}

export const usePrivateRouteGuardEffect = ({ ready, route, userId }: PrivateRouteGuardDeps) => {
  useEffect(() => {
    if (!ready || userId !== null) return
    if (isPrivateRoute(route)) navigate('/', true)
  }, [ready, route, userId])
}
