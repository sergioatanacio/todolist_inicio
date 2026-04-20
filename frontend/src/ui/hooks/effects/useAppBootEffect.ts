import { useEffect } from 'react'
import { createAppServices } from '../../../aplicacion/AppBootstrap'
import { initDatabase, persistDatabase } from '../../../infra/SqliteDatabase'
import { navigate, parseRoute } from '../../router/AppRoute'
import type { AppLoaders, ServicesRef, SetSession } from '../actions/types'

const SESSION_KEY = 'todo_user_id'

type AppBootEffectDeps = {
  servicesRef: ServicesRef
  setReady: (value: boolean) => void
  setSession: SetSession
  loaders: AppLoaders
}

export const useAppBootEffect = ({
  servicesRef,
  setReady,
  setSession,
  loaders,
}: AppBootEffectDeps) => {
  useEffect(() => {
    let mounted = true

    const boot = async () => {
      const db = await initDatabase()
      if (!mounted) return

      const services = createAppServices(db, persistDatabase)
      servicesRef.current = services

      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        const session = services.auth.restoreSession(Number(stored))
        if (session) {
          setSession({ id: session.id, name: session.name, email: session.email })
          const workspaces = loaders.loadWorkspaces(services, session.id)
          const currentRoute = parseRoute()
          if (currentRoute.kind === 'landing' || currentRoute.kind === 'auth') {
            navigate(
              workspaces[0] ? `/app/workspaces/${workspaces[0].id}` : '/app/workspaces',
              true,
            )
          }
        } else {
          localStorage.removeItem(SESSION_KEY)
        }
      }

      setReady(true)
    }

    void boot()
    return () => {
      mounted = false
    }
  }, [])
}
