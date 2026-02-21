import type { TodoAggregate } from '../../dominio/entidades/TodoAggregate'

type Filter = 'all' | 'active' | 'done'

type TodoViewProps = {
  userName: string
  userEmail: string
  remaining: number
  filter: Filter
  text: string
  todos: TodoAggregate[]
  onLogout: () => void
  onTextChange: (value: string) => void
  onSubmit: () => void
  onFilterChange: (value: Filter) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onClearCompleted: () => void
}

export function TodoView({
  userName,
  userEmail,
  remaining,
  filter,
  text,
  todos,
  onLogout,
  onTextChange,
  onSubmit,
  onFilterChange,
  onToggle,
  onRemove,
  onClearCompleted,
}: TodoViewProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#f1e7dc_45%,_#eadfd7_100%)] px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
              Hola, {userName}
            </p>
            <h1 className="mt-4 font-serif text-3xl text-slate-900 md:text-4xl">
              Tu lista, sin friccion.
            </h1>
            <p className="mt-3 max-w-md text-slate-600">
              Todo queda en SQLite dentro de IndexedDB. Cierra sesion cuando
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
          <span>{userEmail}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <button
            type="button"
            onClick={onLogout}
            className="font-semibold text-slate-700"
          >
            Cerrar sesion
          </button>
        </div>

        <form
          className="mt-10 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <input
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Escribe una tarea clara y pequena"
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
            onClick={() => onFilterChange('all')}
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
            onClick={() => onFilterChange('active')}
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
            onClick={() => onFilterChange('done')}
          >
            Hechas
          </button>
          <button
            type="button"
            onClick={onClearCompleted}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-amber-200"
          >
            Limpiar hechas
          </button>
        </div>

        <div className="mt-8 grid gap-4">
          {todos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-slate-500">
              <p className="text-lg font-semibold text-slate-700">
                No hay tareas aqui todavia.
              </p>
              <p className="mt-2">Agrega una nueva para empezar.</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[auto_1fr_auto] md:items-center ${
                  todo.done ? 'opacity-60' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggle(todo.id)}
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
                  onClick={() => onRemove(todo.id)}
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
