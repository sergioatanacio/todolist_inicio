import { runUiAction } from './runUiAction'
import type { AppLoaders, ServicesRef, SetBusy, SetError, SetSession } from './types'
import type { UiForms } from '../state/useUiForms'

const SESSION_KEY = 'todo_user_id'

type AuthActionDeps = {
  servicesRef: ServicesRef
  forms: UiForms
  authMode: 'login' | 'register'
  setSession: SetSession
  loaders: AppLoaders
  navigate: (path: string, replace?: boolean) => void
  clearSession: () => void
  setBusy: SetBusy
  setError: SetError
}

export const useAuthActions = ({
  servicesRef,
  forms,
  authMode,
  setSession,
  loaders,
  navigate,
  clearSession,
  setBusy,
  setError,
}: AuthActionDeps) => {
  const submitAuth = async () => {
    const services = servicesRef.current
    if (!services) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'auth',
      fallbackMessage: 'No se pudo autenticar.',
      task: async () => {
        if (
          !forms.email.trim() ||
          !forms.password.trim() ||
          (authMode === 'register' && !forms.name.trim())
        ) {
          setError('auth', 'Completa los campos requeridos.')
          return
        }

        const result =
          authMode === 'register'
            ? await services.auth.register({
                name: forms.name.trim(),
                email: forms.email.trim().toLowerCase(),
                password: forms.password.trim(),
              })
            : await services.auth.login({
                email: forms.email.trim().toLowerCase(),
                password: forms.password.trim(),
              })

        if (!result.ok) {
          setError('auth', 'error' in result ? result.error : 'No se pudo autenticar.')
          return
        }

        setSession({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        })
        localStorage.setItem(SESSION_KEY, String(result.user.id))

        const workspaces = loaders.loadWorkspaces(services, result.user.id)
        navigate(workspaces[0] ? `/app/workspaces/${workspaces[0].id}` : '/app/workspaces')
      },
    })
  }

  const logout = () => {
    clearSession()
    localStorage.removeItem(SESSION_KEY)
    navigate('/', true)
  }

  return { submitAuth, logout }
}
