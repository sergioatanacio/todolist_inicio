import { useEffect, useMemo, useState } from 'react'
import type { ProjectCalendarVm } from '../../../types/AppUiModels'
import { CalendarToolbar } from '../components/CalendarToolbar'
import { ProjectDayDetailPanel } from '../components/ProjectDayDetailPanel'
import { ProjectListView } from '../components/ProjectListView'
import { ProjectMonthGrid } from '../components/ProjectMonthGrid'
import { useCalendarViewMode } from '../hooks/useCalendarViewMode'
import { useSelectedDay } from '../hooks/useSelectedDay'
import { mapProjectCalendarToMonth } from '../mappers/projectCalendarMapper'
import { addMonths, startOfMonth, toIsoDateUtc } from '../utils/dateUtils'

type ProjectCalendarPageProps = {
  calendar: ProjectCalendarVm
  onOpenKanban: (listId: string) => void
}

const dayFromBlock = (timestamp: number) => toIsoDateUtc(timestamp)

export function ProjectCalendarPage({
  calendar,
  onOpenKanban,
}: ProjectCalendarPageProps) {
  const { viewMode, setViewMode } = useCalendarViewMode('month')
  const { selectedDay, setSelectedDay } = useSelectedDay(null)
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))

  const previewTitlesByDay = useMemo(() => {
    const grouped: Record<string, string[]> = {}
    for (const block of calendar.plannedBlocks) {
      const day = dayFromBlock(block.scheduledStart)
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(block.taskTitle)
    }
    return grouped
  }, [calendar.plannedBlocks])

  const monthVm = useMemo(
    () => mapProjectCalendarToMonth(calendar.tasksPerDay, previewTitlesByDay, visibleMonth),
    [calendar.tasksPerDay, previewTitlesByDay, visibleMonth],
  )

  useEffect(() => {
    if (selectedDay) return
    const firstWithBlocks = monthVm.cells.find(
      (cell) => cell.inCurrentMonth && cell.taskCount > 0,
    )
    if (firstWithBlocks) setSelectedDay(firstWithBlocks.isoDate)
  }, [monthVm.cells, selectedDay, setSelectedDay])

  const selectedDayCount = selectedDay ? (calendar.tasksPerDay[selectedDay] ?? 0) : 0
  const selectedDayBlocks = useMemo(
    () =>
      selectedDay
        ? calendar.plannedBlocks
            .filter((block) => dayFromBlock(block.scheduledStart) === selectedDay)
            .sort((a, b) => a.scheduledStart - b.scheduledStart)
        : [],
    [calendar.plannedBlocks, selectedDay],
  )

  return (
    <section className="space-y-3">
      <CalendarToolbar
        title={`Calendario del proyecto · ${monthVm.title}`}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        rightSlot={
          <div className="ml-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth(startOfMonth(new Date()))}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
            >
              Siguiente
            </button>
          </div>
        }
      />

      <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
        {viewMode === 'month' ? (
          <ProjectMonthGrid
            cells={monthVm.cells}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        ) : (
          <ProjectListView
            calendar={calendar.tasksPerDay}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        )}
        <ProjectDayDetailPanel
          selectedDay={selectedDay}
          blockCount={selectedDayCount}
          selectedDayBlocks={selectedDayBlocks}
          onOpenKanban={onOpenKanban}
        />
      </div>
    </section>
  )
}
