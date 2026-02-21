import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { TodoAggregate } from './dominio/entidades/TodoAggregate'
import { UserAggregate } from './dominio/entidades/UserAggregate'
import { type AuthState, transition } from './dominio/maquinas/AuthMachine'
import { initDatabase, persistDatabase } from './infra/SqliteDatabase'
import {
  type AppServices,
  createAppServices,
  restoreSession,
} from './aplicacion/AppBootstrap'
import { LoadingView } from './ui/common/LoadingView'
import { AuthView } from './ui/auth/AuthView'
import { TodoView } from './ui/todos/TodoView'

type Filter = 'all' | 'active' | 'done'

const SESSION_KEY = 'todo_user_id'

const createAuthState = (): AuthState => ({
  status: 'idle',
  mode: 'login',
  error: null,
})

function App() {
  const appServicesRef = useRef<AppServices | null>(null)
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<UserAggregate | null>(null)
  const [todos, setTodos] = useState<TodoAggregate[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [text, setText] = useState('')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authState, dispatchAuth] = useReducer(
    (state: AuthState, event: Parameters<typeof transition>[1]) =>
      transition(state, event),
    undefined,
    createAuthState,
  )

  useEffect(() => {
    let mounted = true
    const bootstrap = async () => {
      const db = await initDatabase()
      if (!mounted) return
      appServicesRef.current = createAppServices(db, persistDatabase)
      const storedUser = localStorage.getItem(SESSION_KEY)
      if (storedUser && appServicesRef.current) {
        const restored = restoreSession(
          appServicesRef.current,
          Number(storedUser),
        )
        if (restored) {
          setUser(restored.user)
          setTodos(restored.todos)
          dispatchAuth({ type: 'SUCCESS' })
        } else {
          localStorage.removeItem(SESSION_KEY)
        }
      }
      setReady(true)
    }
    bootstrap()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.done)
    if (filter === 'done') return todos.filter((todo) => todo.done)
    return todos
  }, [todos, filter])

  const remaining = useMemo(
    () => todos.filter((todo) => !todo.done).length,
    [todos],
  )

  const handleRegister = async () => {
    if (!appServicesRef.current) return
    dispatchAuth({ type: 'SUBMIT' })
    if (!authName.trim() || !authEmail.trim() || !authPassword.trim()) {
      dispatchAuth({ type: 'FAIL', error: 'Completa todos los campos.' })
      return
    }
    const result = await appServicesRef.current.auth.register({
      name: authName.trim(),
      email: authEmail.trim().toLowerCase(),
      password: authPassword.trim(),
    })
    if (!result.ok) {
      dispatchAuth({ type: 'FAIL', error: result.error })
      return
    }
    setUser(result.user)
    setTodos(appServicesRef.current.todos.listByUser(result.user.id))
    localStorage.setItem(SESSION_KEY, String(result.user.id))
    dispatchAuth({ type: 'SUCCESS' })
  }

  const handleLogin = async () => {
    if (!appServicesRef.current) return
    dispatchAuth({ type: 'SUBMIT' })
    if (!authEmail.trim() || !authPassword.trim()) {
      dispatchAuth({ type: 'FAIL', error: 'Ingresa tu correo y contrasena.' })
      return
    }
    const result = await appServicesRef.current.auth.login({
      email: authEmail.trim().toLowerCase(),
      password: authPassword.trim(),
    })
    if (!result.ok) {
      dispatchAuth({ type: 'FAIL', error: result.error })
      return
    }
    setUser(result.user)
    setTodos(appServicesRef.current.todos.listByUser(result.user.id))
    localStorage.setItem(SESSION_KEY, String(result.user.id))
    dispatchAuth({ type: 'SUCCESS' })
  }

  const addTodo = async () => {
    if (!user || !appServicesRef.current) return
    const value = text.trim()
    if (!value) return
    let todo: TodoAggregate
    try {
      todo = await appServicesRef.current.todos.add(user.id, value)
    } catch (error) {
      setText('')
      return
    }
    setTodos((current) => [todo, ...current])
    setText('')
  }

  const toggleTodo = async (id: string) => {
    if (!user || !appServicesRef.current) return
    const next = todos.map((todo) => (todo.id === id ? todo.toggle() : todo))
    const updated = next.find((todo) => todo.id === id)
    if (!updated) return
    await appServicesRef.current.todos.toggle(updated)
    setTodos(next)
  }

  const removeTodo = async (id: string) => {
    if (!user || !appServicesRef.current) return
    await appServicesRef.current.todos.remove(id, user.id)
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  const clearCompleted = async () => {
    if (!user || !appServicesRef.current) return
    await appServicesRef.current.todos.clearCompleted(user.id)
    setTodos((current) => current.filter((todo) => !todo.done))
  }

  const handleLogout = () => {
    setUser(null)
    setTodos([])
    localStorage.removeItem(SESSION_KEY)
    dispatchAuth({ type: 'LOGOUT' })
  }

  if (!ready) {
    return <LoadingView />
  }

  if (!user) {
    return (
      <AuthView
        state={authState}
        name={authName}
        email={authEmail}
        password={authPassword}
        onModeChange={(mode) => dispatchAuth({ type: 'SET_MODE', mode })}
        onSubmit={authState.mode === 'login' ? handleLogin : handleRegister}
        onNameChange={setAuthName}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onFieldFocus={() => dispatchAuth({ type: 'EDIT' })}
      />
    )
  }

  return (
    <TodoView
      userName={user.name}
      userEmail={user.email}
      remaining={remaining}
      filter={filter}
      text={text}
      todos={filtered}
      onLogout={handleLogout}
      onTextChange={setText}
      onSubmit={addTodo}
      onFilterChange={setFilter}
      onToggle={toggleTodo}
      onRemove={removeTodo}
      onClearCompleted={clearCompleted}
    />
  )
}

export default App
