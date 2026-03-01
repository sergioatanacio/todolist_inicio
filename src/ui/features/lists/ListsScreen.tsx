import { useState } from 'react'
import type { DisponibilidadVm, TodoListVm } from '../../types/AppUiModels'

type ListsScreenProps = {
  listName: string
  selectedDispId: string
  onListNameChange: (value: string) => void
  onSelectedDispIdChange: (value: string) => void
  onCreateList: () => void
  onUpdateList: (todoListId: string, data: { name: string; description: string }) => void
  busy: boolean
  error: string | null
  disponibilidades: DisponibilidadVm[]
  lists: TodoListVm[]
  onOpenKanban: (listId: string) => void
}

export function ListsScreen({
  listName,
  selectedDispId,
  onListNameChange,
  onSelectedDispIdChange,
  onCreateList,
  onUpdateList,
  busy,
  error,
  disponibilidades,
  lists,
  onOpenKanban,
}: ListsScreenProps) {
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Listas</h1>
      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <input value={listName} onChange={(e) => onListNameChange(e.target.value)} placeholder="Nombre lista" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <select value={selectedDispId} onChange={(e) => onSelectedDispIdChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm">
          <option value="">Selecciona disponibilidad</option>
          {disponibilidades.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button type="button" onClick={onCreateList} disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear lista</button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 space-y-2">
        {lists.map((list) => (
          <div key={list.id} className="rounded border border-slate-300 p-2 text-sm">
            {editingListId === list.id ? (
              <div className="space-y-2">
                <input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                />
                <input
                  value={editingDescription}
                  onChange={(event) => setEditingDescription(event.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateList(list.id, {
                        name: editingName,
                        description: editingDescription,
                      })
                      setEditingListId(null)
                    }}
                    disabled={busy}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingListId(null)}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>{list.name}</p>
                <div className="mt-1 flex gap-2">
                  <button type="button" onClick={() => onOpenKanban(list.id)} className="rounded border border-slate-300 px-2 py-1 text-xs">Abrir kanban</button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingListId(list.id)
                      setEditingName(list.name)
                      setEditingDescription(list.description)
                    }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    Editar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
