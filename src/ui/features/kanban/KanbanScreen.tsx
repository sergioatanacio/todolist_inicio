import { useState } from 'react'
import type { TaskStatus, TaskVm } from '../../types/AppUiModels'

const TASK_STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE', 'ABANDONED']

type KanbanScreenProps = {
  taskTitle: string
  taskDuration: string
  onTaskTitleChange: (value: string) => void
  onTaskDurationChange: (value: string) => void
  onCreateTask: () => void
  onUpdateTask: (
    taskId: string,
    data: { title: string; durationMinutes: number },
  ) => void
  busy: boolean
  error: string | null
  kanban: Record<TaskStatus, TaskVm[]>
  onChangeStatus: (taskId: string, toStatus: TaskStatus) => void
}

export function KanbanScreen({
  taskTitle,
  taskDuration,
  onTaskTitleChange,
  onTaskDurationChange,
  onCreateTask,
  onUpdateTask,
  busy,
  error,
  kanban,
  onChangeStatus,
}: KanbanScreenProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingDuration, setEditingDuration] = useState('30')

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Kanban</h1>
      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_140px_auto]">
        <input value={taskTitle} onChange={(e) => onTaskTitleChange(e.target.value)} placeholder="Titulo tarea" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input type="number" min={1} value={taskDuration} onChange={(e) => onTaskDurationChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <button type="button" onClick={onCreateTask} disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear tarea</button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {TASK_STATUSES.map((status) => (
          <div key={status} className="rounded border border-slate-300 bg-slate-50 p-2">
            <p className="text-sm font-semibold">{status}</p>
            <div className="mt-2 space-y-2">
              {kanban[status].map((task) => (
                <div key={task.id} className="rounded border border-slate-300 bg-white p-2">
                  {editingTaskId === task.id ? (
                    <div className="space-y-2">
                      <input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <input
                        type="number"
                        min={1}
                        value={editingDuration}
                        onChange={(event) => setEditingDuration(event.target.value)}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateTask(task.id, {
                              title: editingTitle,
                              durationMinutes: Number(editingDuration),
                            })
                            setEditingTaskId(null)
                          }}
                          disabled={busy}
                          className="rounded border border-slate-300 px-1 py-0.5 text-[10px]"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaskId(null)
                            setEditingTitle('')
                            setEditingDuration('30')
                          }}
                          className="rounded border border-slate-300 px-1 py-0.5 text-[10px]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-semibold">{task.title}</p>
                      <p className="text-[11px]">{task.durationMinutes} min</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {TASK_STATUSES.filter((next) => next !== task.status).map((next) => (
                          <button key={next} type="button" onClick={() => onChangeStatus(task.id, next)} className="rounded border border-slate-300 px-1 py-0.5 text-[10px]">{next}</button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaskId(task.id)
                            setEditingTitle(task.title)
                            setEditingDuration(String(task.durationMinutes))
                          }}
                          className="rounded border border-slate-300 px-1 py-0.5 text-[10px]"
                        >
                          Editar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
