export type AuthStatus =
  | 'idle'
  | 'editing'
  | 'submitting'
  | 'error'
  | 'authenticated'

export type AuthMode = 'login' | 'register'

export type AuthState = {
  status: AuthStatus
  mode: AuthMode
  error: string | null
}

export type AuthEvent =
  | { type: 'EDIT' }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'FAIL'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_MODE'; mode: AuthMode }

const machine: Record<AuthStatus, Partial<Record<AuthEvent['type'], AuthStatus>>> =
  {
    idle: { EDIT: 'editing', SUBMIT: 'submitting' },
    editing: { SUBMIT: 'submitting' },
    submitting: { SUCCESS: 'authenticated', FAIL: 'error' },
    error: { EDIT: 'editing', SUBMIT: 'submitting' },
    authenticated: { LOGOUT: 'idle' },
  }

export const transition = (state: AuthState, event: AuthEvent): AuthState => {
  if (event.type === 'SET_MODE') {
    return { ...state, mode: event.mode }
  }

  const nextStatus = machine[state.status]?.[event.type]
  if (!nextStatus) return state

  if (event.type === 'FAIL') {
    return { status: nextStatus, mode: state.mode, error: event.error }
  }

  if (nextStatus === 'authenticated' || nextStatus === 'idle') {
    return { status: nextStatus, mode: state.mode, error: null }
  }

  return { status: nextStatus, mode: state.mode, error: null }
}
