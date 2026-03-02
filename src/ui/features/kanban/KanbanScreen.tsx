import { useEffect, useMemo, useState } from 'react'
import type {
  KanbanTimelineScheduledItemVm,
  KanbanTimelineVm,
  TaskStatus,
  TaskVm,
} from '../../types/AppUiModels'

const TASK_STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE', 'ABANDONED']
const TIMELINE_ROW_HEIGHT = 24

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
  timeline: KanbanTimelineVm | null
  onChangeStatus: (taskId: string, toStatus: TaskStatus) => void
}

type SegmentBlock = {
  rowStart: number
  rowSpan: number
  segmentLabel: string
}

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hour = String(date.getUTCHours()).padStart(2, '0')
  const minute = String(date.getUTCMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const buildSegmentBlocks = (timeline: KanbanTimelineVm): SegmentBlock[] => {
  const blocks: SegmentBlock[] = []
  let current: SegmentBlock | null = null

  for (let index = 0; index < timeline.rows.length; index += 1) {
    const row = timeline.rows[index]
    if (!row.segmentLabel) {
      if (current) {
        blocks.push(current)
        current = null
      }
      continue
    }

    if (!current) {
      current = { rowStart: index, rowSpan: 1, segmentLabel: row.segmentLabel }
      continue
    }

    if (current.segmentLabel === row.segmentLabel) {
      current.rowSpan += 1
    } else {
      blocks.push(current)
      current = { rowStart: index, rowSpan: 1, segmentLabel: row.segmentLabel }
    }
  }

  if (current) blocks.push(current)
  return blocks
}

function TaskMenu({
  task,
  onChangeStatus,
  onEdit,
  isOpen,
  onOpenChange,
}: {
  task: TaskVm
  onChangeStatus: (taskId: string, toStatus: TaskStatus) => void
  onEdit: (task: TaskVm) => void
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}) {
  const [openInternal, setOpenInternal] = useState(false)
  const controlled = typeof isOpen === 'boolean'
  const open = controlled ? isOpen : openInternal

  useEffect(() => {
    if (!controlled) onOpenChange?.(open)
  }, [controlled, onOpenChange, open])

  const setOpen = (next: boolean | ((current: boolean) => boolean)) => {
    const current = open
    const nextValue = typeof next === 'function' ? next(current) : next
    if (controlled) {
      onOpenChange?.(nextValue)
      return
    }
    setOpenInternal(nextValue)
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs"
        onClick={() => setOpen((value) => !value)}
      >
        ...
      </button>
      {open ? (
        <div className="absolute right-0 top-6 z-40 min-w-[130px] rounded border border-slate-300 bg-white p-1 shadow">
          {TASK_STATUSES.filter((next) => next !== task.status).map((next) => (
            <button
              key={next}
              type="button"
              className="mb-1 block w-full rounded px-2 py-1 text-left text-[11px] hover:bg-slate-100"
              onClick={() => {
                onChangeStatus(task.id, next)
                setOpen(false)
              }}
            >
              Mover a {next}
            </button>
          ))}
          <button
            type="button"
            className="block w-full rounded px-2 py-1 text-left text-[11px] hover:bg-slate-100"
            onClick={() => {
              onEdit(task)
              setOpen(false)
            }}
          >
            Editar
          </button>
        </div>
      ) : null}
    </div>
  )
}

function TimelineTaskCard({
  item,
  rowHeight,
  task,
  busy,
  editingTaskId,
  editingTitle,
  editingDuration,
  onEditingTitleChange,
  onEditingDurationChange,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onChangeStatus,
  isMenuOpen,
  onMenuOpenChange,
}: {
  item: KanbanTimelineScheduledItemVm
  rowHeight: number
  task: TaskVm | null
  busy: boolean
  editingTaskId: string | null
  editingTitle: string
  editingDuration: string
  onEditingTitleChange: (value: string) => void
  onEditingDurationChange: (value: string) => void
  onSaveEdit: (taskId: string) => void
  onCancelEdit: () => void
  onStartEdit: (task: TaskVm) => void
  onChangeStatus: (taskId: string, toStatus: TaskStatus) => void
  isMenuOpen: boolean
  onMenuOpenChange: (isOpen: boolean) => void
}) {
  const top = item.rowStart * rowHeight + 4
  const height = Math.max(item.rowSpan * rowHeight - 8, 48)
  const taskView: TaskVm =
    task ??
    ({
      id: item.taskId,
      title: item.title,
      status: item.status,
      durationMinutes: item.durationMinutes,
    } satisfies TaskVm)

  return (
    <div
      className={`absolute left-2 right-2 rounded border border-blue-400 bg-slate-100 p-2 ${
        isMenuOpen ? 'z-50' : 'z-20'
      }`}
      style={{ top, height }}
    >
      {editingTaskId === taskView.id ? (
        <div className="space-y-2">
          <input
            value={editingTitle}
            onChange={(event) => onEditingTitleChange(event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <input
            type="number"
            min={1}
            value={editingDuration}
            onChange={(event) => onEditingDurationChange(event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onSaveEdit(taskView.id)}
              disabled={busy}
              className="rounded border border-slate-300 px-1 py-0.5 text-[10px]"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded border border-slate-300 px-1 py-0.5 text-[10px]"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold">{taskView.title}</p>
            <TaskMenu
              task={taskView}
              onChangeStatus={onChangeStatus}
              onEdit={onStartEdit}
              isOpen={isMenuOpen}
              onOpenChange={onMenuOpenChange}
            />
          </div>
          <p className="text-[11px]">
            {taskView.durationMinutes} min | {item.segmentName ?? '-'}
          </p>
          <p className="text-[10px] text-slate-600">
            {formatDateTime(item.startsAt)} - {formatDateTime(item.endsAt)}
          </p>
        </>
      )}
    </div>
  )
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
  timeline,
  onChangeStatus,
}: KanbanScreenProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingDuration, setEditingDuration] = useState('30')
  const [menuOpenTaskId, setMenuOpenTaskId] = useState<string | null>(null)

  const taskById = useMemo(() => {
    const all = Object.values(kanban).flat()
    return new Map(all.map((task) => [task.id, task]))
  }, [kanban])

  const segmentBlocks = useMemo(() => {
    if (!timeline) return []
    return buildSegmentBlocks(timeline)
  }, [timeline])
  const segmentCutRows = useMemo(() => {
    if (!timeline) return []
    const cuts = new Set<number>()
    for (const block of segmentBlocks) {
      cuts.add(block.rowStart)
      cuts.add(block.rowStart + block.rowSpan)
    }
    return [...cuts]
      .filter((row) => row >= 0 && row <= timeline.rows.length)
      .sort((a, b) => a - b)
  }, [segmentBlocks, timeline])

  const onStartEdit = (task: TaskVm) => {
    setEditingTaskId(task.id)
    setEditingTitle(task.title)
    setEditingDuration(String(task.durationMinutes))
  }

  const onCancelEdit = () => {
    setEditingTaskId(null)
    setEditingTitle('')
    setEditingDuration('30')
  }

  const onSaveEdit = (taskId: string) => {
    onUpdateTask(taskId, {
      title: editingTitle,
      durationMinutes: Number(editingDuration),
    })
    onCancelEdit()
  }

  const hasTimeline = Boolean(timeline && timeline.rows.length > 0)
  const rowCount = timeline?.rows.length ?? 0
  const timelineHeight = Math.max(rowCount * TIMELINE_ROW_HEIGHT, 640)

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Kanban</h1>
      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_140px_auto]">
        <input
          value={taskTitle}
          onChange={(event) => onTaskTitleChange(event.target.value)}
          placeholder="Titulo tarea"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={1}
          value={taskDuration}
          onChange={(event) => onTaskDurationChange(event.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onCreateTask}
          disabled={busy}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Crear tarea
        </button>
      </div>

      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}

      {hasTimeline && timeline ? (
        <div className="mt-3 overflow-hidden rounded border border-slate-300">
          <div>
            <div className="grid grid-cols-[220px_1fr_1fr_1fr_1fr] border-b border-slate-300 bg-slate-50">
              <div className="border-r border-slate-300 px-3 py-2 text-4xl font-bold leading-none">Segmentos</div>
              <div className="border-r border-slate-300 px-3 py-2 text-4xl font-bold leading-none">PENDIENTE</div>
              <div className="border-r border-slate-300 px-3 py-2 text-4xl font-bold leading-none">PROGRESO</div>
              <div className="border-r border-slate-300 px-3 py-2 text-4xl font-bold leading-none">TERMINADO</div>
              <div className="px-3 py-2 text-4xl font-bold leading-none">ABANDONADO</div>
            </div>

            <div className="relative" style={{ height: timelineHeight }}>
              <div className="absolute inset-0 z-30 pointer-events-none">
                {segmentCutRows.map((cutRow) => (
                  <div
                    key={`cut-${cutRow}`}
                    className="absolute left-0 right-0 border-t border-dashed border-blue-400"
                    style={{ top: `${cutRow * TIMELINE_ROW_HEIGHT}px` }}
                  />
                ))}
              </div>

              <div className="absolute inset-0 grid grid-cols-[220px_1fr_1fr_1fr_1fr]">
                <div className="relative border-r border-slate-300">
                  {segmentBlocks.map((block, index) => (
                    <div
                      key={`${block.segmentLabel}-${index}`}
                      className="absolute left-2 right-2 z-10 overflow-hidden rounded border border-blue-300 bg-slate-100 p-2"
                      style={{
                        top: block.rowStart * TIMELINE_ROW_HEIGHT + 4,
                        height: Math.max(block.rowSpan * TIMELINE_ROW_HEIGHT - 8, 24),
                      }}
                    >
                      <p className="text-xs font-semibold">{block.segmentLabel.split('|')[0]?.trim()}</p>
                      <p className="text-[11px] text-slate-700">{block.segmentLabel.split('|')[1]?.trim()}</p>
                    </div>
                  ))}
                </div>

                <div className="relative border-r border-slate-300">
                  {timeline.pendingItems.map((item) => (
                    <TimelineTaskCard
                      key={`${item.taskId}-${item.rowStart}`}
                      item={item}
                      rowHeight={TIMELINE_ROW_HEIGHT}
                      task={taskById.get(item.taskId) ?? null}
                      busy={busy}
                      editingTaskId={editingTaskId}
                      editingTitle={editingTitle}
                      editingDuration={editingDuration}
                      onEditingTitleChange={setEditingTitle}
                      onEditingDurationChange={setEditingDuration}
                      onSaveEdit={onSaveEdit}
                      onCancelEdit={onCancelEdit}
                      onStartEdit={onStartEdit}
                      onChangeStatus={onChangeStatus}
                      isMenuOpen={menuOpenTaskId === item.taskId}
                      onMenuOpenChange={(isOpen) =>
                        setMenuOpenTaskId(isOpen ? item.taskId : null)
                      }
                    />
                  ))}
                </div>

                <div className="relative border-r border-slate-300">
                  {timeline.progressItems.map((item) => (
                    <TimelineTaskCard
                      key={`${item.taskId}-${item.rowStart}`}
                      item={item}
                      rowHeight={TIMELINE_ROW_HEIGHT}
                      task={taskById.get(item.taskId) ?? null}
                      busy={busy}
                      editingTaskId={editingTaskId}
                      editingTitle={editingTitle}
                      editingDuration={editingDuration}
                      onEditingTitleChange={setEditingTitle}
                      onEditingDurationChange={setEditingDuration}
                      onSaveEdit={onSaveEdit}
                      onCancelEdit={onCancelEdit}
                      onStartEdit={onStartEdit}
                      onChangeStatus={onChangeStatus}
                      isMenuOpen={menuOpenTaskId === item.taskId}
                      onMenuOpenChange={(isOpen) =>
                        setMenuOpenTaskId(isOpen ? item.taskId : null)
                      }
                    />
                  ))}
                </div>

                <div className="relative border-r border-slate-300 p-2">
                  <div className="space-y-2">
                    {kanban.DONE.map((task) => (
                      <div key={task.id} className="rounded border border-slate-300 bg-slate-100 p-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold">{task.title}</p>
                          <TaskMenu task={task} onChangeStatus={onChangeStatus} onEdit={onStartEdit} />
                        </div>
                        <p className="text-[11px]">{task.durationMinutes} min</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative p-2">
                  <div className="space-y-2">
                    {kanban.ABANDONED.map((task) => (
                      <div key={task.id} className="rounded border border-slate-300 bg-slate-100 p-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold">{task.title}</p>
                          <TaskMenu task={task} onChangeStatus={onChangeStatus} onEdit={onStartEdit} />
                        </div>
                        <p className="text-[11px]">{task.durationMinutes} min</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {TASK_STATUSES.map((status) => (
            <div key={status} className="rounded border border-slate-300 bg-slate-50 p-2">
              <p className="text-sm font-semibold">{status}</p>
              <div className="mt-2 space-y-2">
                {kanban[status].map((task) => (
                  <div key={task.id} className="rounded border border-slate-300 bg-white p-2">
                    <p className="text-xs font-semibold">{task.title}</p>
                    <p className="text-[11px]">{task.durationMinutes} min</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
