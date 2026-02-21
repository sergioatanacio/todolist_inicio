import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import initSqlJs, { type Database } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { TodoAggregate } from './dominio/entidades/TodoAggregate'
import { UserAggregate } from './dominio/entidades/UserAggregate'
import {
  type AuthState,
  transition,
} from './dominio/maquinas/AuthMachine'
import { AuthService } from './dominio/servicios/AuthService'
import { SqliteUserRepository } from './infra/SqliteUserRepository'
import { SqliteTodoRepository } from './infra/SqliteTodoRepository'

type Filter = 'all' | 'active' | 'done'

const STORE_DB = 'todo_sqlite'
const STORE_NAME = 'files'
const DB_FILE = 'index.db'
const SESSION_KEY = 'todo_user_id'

const openIdb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(STORE_DB, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const idbGet = async (key: string) => {
  const db = await openIdb()
  return new Promise<ArrayBuffer | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(key)
    request.onsuccess = () => resolve((request.result as ArrayBuffer) ?? null)
    request.onerror = () => reject(request.error)
  })
}

const idbSet = async (key: string, value: ArrayBuffer) => {
  const db = await openIdb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(value, key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

const initDatabase = async () => {
  const SQL = await initSqlJs({
    locateFile: () => wasmUrl,
  })
  const stored = await idbGet(DB_FILE)
  const db = stored ? new SQL.Database(new Uint8Array(stored)) : new SQL.Database()
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      done INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)
  await idbSet(DB_FILE, db.export().buffer)
  return db
}

const persistDatabase = async (db: Database) => {
  const data = db.export()
  await idbSet(DB_FILE, data.buffer)
}

const createAuthState = (): AuthState => ({
  status: 'idle',
  mode: 'login',
  error: null,
})

function App() {
  const dbRef = useRef<Database | null>(null)
  const authServiceRef = useRef(new AuthService())
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
      dbRef.current = db
      const userRepo = new SqliteUserRepository(db, persistDatabase)
      const todoRepo = new SqliteTodoRepository(db, persistDatabase)
      const storedUser = localStorage.getItem(SESSION_KEY)
      if (storedUser) {
        const found = userRepo.findById(Number(storedUser))
        if (found) {
          const nextUser = UserAggregate.rehydrate(found)
          setUser(nextUser)
          setTodos(todoRepo.findByUserId(nextUser.id))
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
    const db = dbRef.current
    if (!db) return
    dispatchAuth({ type: 'SUBMIT' })
    if (!authName.trim() || !authEmail.trim() || !authPassword.trim()) {
      dispatchAuth({ type: 'FAIL', error: 'Completa todos los campos.' })
      return
    }
    const service = authServiceRef.current
    const repo = new SqliteUserRepository(db, persistDatabase)
    const result = await service.register(
      {
        name: authName.trim(),
        email: authEmail.trim().toLowerCase(),
        password: authPassword.trim(),
      },
      repo,
    )
    if (!result.ok) {
      dispatchAuth({ type: 'FAIL', error: result.error })
      return
    }
    setUser(result.user)
    const todoRepo = new SqliteTodoRepository(db, persistDatabase)
    setTodos(todoRepo.findByUserId(result.user.id))
    localStorage.setItem(SESSION_KEY, String(result.user.id))
    dispatchAuth({ type: 'SUCCESS' })
  }

  const handleLogin = async () => {
    const db = dbRef.current
    if (!db) return
    dispatchAuth({ type: 'SUBMIT' })
    if (!authEmail.trim() || !authPassword.trim()) {
      dispatchAuth({ type: 'FAIL', error: 'Ingresa tu correo y contraseña.' })
      return
    }
    const service = authServiceRef.current
    const repo = new SqliteUserRepository(db, persistDatabase)
    const result = await service.login(
      {
        email: authEmail.trim().toLowerCase(),
        password: authPassword.trim(),
      },
      repo,
    )
    if (!result.ok) {
      dispatchAuth({ type: 'FAIL', error: result.error })
      return
    }
    setUser(result.user)
    const todoRepo = new SqliteTodoRepository(db, persistDatabase)
    setTodos(todoRepo.findByUserId(result.user.id))
    localStorage.setItem(SESSION_KEY, String(result.user.id))
    dispatchAuth({ type: 'SUCCESS' })
  }

  const addTodo = async () => {
    const db = dbRef.current
    if (!db || !user) return
    const value = text.trim()
    if (!value) return
    let todo: TodoAggregate
    try {
      todo = TodoAggregate.create(user.id, value)
    } catch (error) {
      setText('')
      return
    }
    const todoRepo = new SqliteTodoRepository(db, persistDatabase)
    await todoRepo.add(todo)
    setTodos((current) => [todo, ...current])
    setText('')
  }

  const toggleTodo = async (id: string) => {
    const db = dbRef.current
    if (!db || !user) return
    const next = todos.map((todo) => (todo.id === id ? todo.toggle() : todo))
    const updated = next.find((todo) => todo.id === id)
    if (!updated) return
    const todoRepo = new SqliteTodoRepository(db, persistDatabase)
    await todoRepo.update(updated)
    setTodos(next)
  }

  const removeTodo = async (id: string) => {
    const db = dbRef.current
    if (!db || !user) return
    const todoRepo = new SqliteTodoRepository(db, persistDatabase)
    await todoRepo.remove(id, user.id)
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  const clearCompleted = async () => {
    const db = dbRef.current
    if (!db || !user) return
    const todoRepo = new SqliteTodoRepository(db, persistDatabase)
    await todoRepo.clearCompleted(user.id)
    setTodos((current) => current.filter((todo) => !todo.done))
  }

  const handleLogout = () => {
    setUser(null)
    setTodos([])
    localStorage.removeItem(SESSION_KEY)
    dispatchAuth({ type: 'LOGOUT' })
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#f1e7dc_45%,_#eadfd7_100%)] px-6 py-12 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-2xl">
          <p className="text-lg font-semibold">Cargando base de datos…</p>
          <p className="mt-2 text-slate-500">
            Inicializando SQLite en tu navegador.
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#f1e7dc_45%,_#eadfd7_100%)] px-6 py-12 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                Todo + SQLite
              </p>
              <h1 className="mt-4 font-serif text-3xl text-slate-900 md:text-4xl">
                Tu lista vive localmente
              </h1>
              <p className="mt-3 max-w-md text-slate-600">
                Registro y acceso cifrado con hash. Datos guardados en SQLite
                dentro de IndexedDB.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900 px-6 py-4 text-sm text-white shadow-lg">
              <p className="text-3xl font-semibold">
                {new Date().toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
              <p className="uppercase tracking-[0.3em] text-white/60">
                hoy
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 rounded-3xl border border-slate-200 bg-white p-8">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => dispatchAuth({ type: 'SET_MODE', mode: 'login' })}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  authState.mode === 'login'
                    ? 'bg-amber-200 text-slate-900'
                    : 'border border-slate-200 text-slate-500'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatchAuth({ type: 'SET_MODE', mode: 'register' })
                }
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  authState.mode === 'register'
                    ? 'bg-amber-200 text-slate-900'
                    : 'border border-slate-200 text-slate-500'
                }`}
              >
                Crear cuenta
              </button>
            </div>

            {authState.mode === 'register' && (
              <div className="grid gap-3">
                <label className="text-sm font-semibold text-slate-600">
                  Nombre
                </label>
                <input
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  onFocus={() => dispatchAuth({ type: 'EDIT' })}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  placeholder="Tu nombre"
                />
              </div>
            )}

            <div className="grid gap-3">
              <label className="text-sm font-semibold text-slate-600">
                Correo
              </label>
              <input
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                onFocus={() => dispatchAuth({ type: 'EDIT' })}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="correo@ejemplo.com"
                type="email"
              />
            </div>

            <div className="grid gap-3">
              <label className="text-sm font-semibold text-slate-600">
                Contraseña
              </label>
              <input
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                onFocus={() => dispatchAuth({ type: 'EDIT' })}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="Mínimo 6 caracteres"
                type="password"
              />
            </div>

            {authState.status === 'error' && authState.error && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {authState.error}
              </p>
            )}

            <button
              type="button"
              onClick={authState.mode === 'login' ? handleLogin : handleRegister}
              className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              disabled={authState.status === 'submitting'}
            >
              {authState.status === 'submitting'
                ? 'Validando...'
                : authState.mode === 'login'
                  ? 'Entrar'
                  : 'Crear cuenta'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#f1e7dc_45%,_#eadfd7_100%)] px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
              Hola, {user.name}
            </p>
            <h1 className="mt-4 font-serif text-3xl text-slate-900 md:text-4xl">
              Tu lista, sin fricción.
            </h1>
            <p className="mt-3 max-w-md text-slate-600">
              Todo queda en SQLite dentro de IndexedDB. Cierra sesión cuando
              quieras.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-6 py-4 text-sm text-white shadow-lg">
            <p className="text-3xl font-semibold">{remaining}</p>
            <p className="uppercase tracking-[0.3em] text-white/60">
              pendientes
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>{user.email}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <button
            type="button"
            onClick={handleLogout}
            className="font-semibold text-slate-700"
          >
            Cerrar sesión
          </button>
        </div>

        <form
          className="mt-10 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            addTodo()
          }}
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Escribe una tarea clara y pequeña"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            aria-label="Nueva tarea"
          />
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Agregar
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === 'all'
                ? 'bg-amber-200 text-slate-900'
                : 'border border-slate-200 text-slate-500'
            }`}
            onClick={() => setFilter('all')}
          >
            Todo
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === 'active'
                ? 'bg-amber-200 text-slate-900'
                : 'border border-slate-200 text-slate-500'
            }`}
            onClick={() => setFilter('active')}
          >
            Activas
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === 'done'
                ? 'bg-amber-200 text-slate-900'
                : 'border border-slate-200 text-slate-500'
            }`}
            onClick={() => setFilter('done')}
          >
            Hechas
          </button>
          <button
            type="button"
            onClick={clearCompleted}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-amber-200"
          >
            Limpiar hechas
          </button>
        </div>

        <div className="mt-8 grid gap-4">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-slate-500">
              <p className="text-lg font-semibold text-slate-700">
                No hay tareas aquí todavía.
              </p>
              <p className="mt-2">Agrega una nueva para empezar.</p>
            </div>
          ) : (
            filtered.map((todo) => (
              <div
                key={todo.id}
                className={`grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[auto_1fr_auto] md:items-center ${
                  todo.done ? 'opacity-60' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className={`h-10 w-10 rounded-2xl border transition ${
                    todo.done
                      ? 'border-transparent bg-slate-900'
                      : 'border-slate-300 bg-white'
                  }`}
                  aria-pressed={todo.done}
                  aria-label={
                    todo.done ? 'Marcar como pendiente' : 'Marcar como hecha'
                  }
                >
                  <span
                    className={`mx-auto block h-4 w-4 rounded-md border-2 transition ${
                      todo.done
                        ? 'border-transparent bg-amber-200'
                        : 'border-slate-400'
                    }`}
                  />
                </button>

                <div>
                  <p className="font-semibold text-slate-900">{todo.text}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(todo.createdAt).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeTodo(todo.id)}
                  className="rounded-full border border-transparent px-3 py-1 text-sm font-semibold text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                >
                  Borrar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App
