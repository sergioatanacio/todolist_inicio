import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Todo = {
  id: string
  text: string
  done: boolean
  createdAt: number
}

type Filter = 'all' | 'active' | 'done'

const STORAGE_KEY = 'todo_list_v1'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as Todo[]
      if (Array.isArray(parsed)) {
        setTodos(parsed)
      }
    } catch {
      // Ignore malformed storage
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const filtered = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.done)
    if (filter === 'done') return todos.filter((todo) => todo.done)
    return todos
  }, [todos, filter])

  const remaining = useMemo(
    () => todos.filter((todo) => !todo.done).length,
    [todos],
  )

  const addTodo = () => {
    const value = text.trim()
    if (!value) return
    const next: Todo = {
      id: crypto.randomUUID(),
      text: value,
      done: false,
      createdAt: Date.now(),
    }
    setTodos((current) => [next, ...current])
    setText('')
  }

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    )
  }

  const removeTodo = (id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  const clearCompleted = () => {
    setTodos((current) => current.filter((todo) => !todo.done))
  }

  return (
    <main className="app">
      <section className="panel">
        <header className="panel__header">
          <div>
            <p className="eyebrow">Focus de hoy</p>
            <h1>Tu lista, sin fricción.</h1>
            <p className="subtitle">
              Captura lo importante y marca progreso real. Todo queda guardado
              automáticamente.
            </p>
          </div>
          <div className="stat">
            <span className="stat__number">{remaining}</span>
            <span className="stat__label">pendientes</span>
          </div>
        </header>

        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault()
            addTodo()
          }}
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Escribe una tarea clara y pequeña"
            aria-label="Nueva tarea"
          />
          <button type="submit">Agregar</button>
        </form>

        <div className="filters">
          <button
            type="button"
            className={filter === 'all' ? 'is-active' : ''}
            onClick={() => setFilter('all')}
          >
            Todo
          </button>
          <button
            type="button"
            className={filter === 'active' ? 'is-active' : ''}
            onClick={() => setFilter('active')}
          >
            Activas
          </button>
          <button
            type="button"
            className={filter === 'done' ? 'is-active' : ''}
            onClick={() => setFilter('done')}
          >
            Hechas
          </button>
          <button type="button" onClick={clearCompleted}>
            Limpiar hechas
          </button>
        </div>

        <ul className="list">
          {filtered.length === 0 ? (
            <li className="empty">
              <p>No hay tareas aquí todavía.</p>
              <span>Agrega una nueva para empezar.</span>
            </li>
          ) : (
            filtered.map((todo) => (
              <li key={todo.id} className={todo.done ? 'done' : ''}>
                <button
                  type="button"
                  className="toggle"
                  onClick={() => toggleTodo(todo.id)}
                  aria-pressed={todo.done}
                  aria-label={
                    todo.done ? 'Marcar como pendiente' : 'Marcar como hecha'
                  }
                >
                  <span />
                </button>
                <div className="text">
                  <p>{todo.text}</p>
                  <small>
                    {new Date(todo.createdAt).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </small>
                </div>
                <button
                  type="button"
                  className="remove"
                  onClick={() => removeTodo(todo.id)}
                >
                  Borrar
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  )
}

export default App
