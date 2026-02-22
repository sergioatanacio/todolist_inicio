import { useMemo } from 'react'
import type { TodoListVm } from '../../../types/AppUiModels'
import { mapProjectCalendarToMonth } from '../mappers/projectCalendarMapper'
import { useCalendarViewMode } from '../hooks/useCalendarViewMode'
import { useSelectedDay } from '../hooks/useSelectedDay'
import { CalendarToolbar } from '../components/CalendarToolbar'
import { ProjectMonthGrid } from '../components/ProjectMonthGrid'
import { ProjectListView } from '../components/ProjectListView'
import { ProjectDayDetailPanel } from '../components/ProjectDayDetailPanel'

type ProjectCalendarPageProps = {
  calendar: Record<string, number>
  lists: TodoListVm[]
  onOpenKanban: (listId: string) => void
}

export function ProjectCalendarPage({
  calendar,
  lists,
  onOpenKanban,
}: ProjectCalendarPageProps) {
  const { viewMode, setViewMode } = useCalendarViewMode('month')
  const { selectedDay, setSelectedDay } = useSelectedDay(null)
  const monthVm = useMemo(() => mapProjectCalendarToMonth(calendar), [calendar])

  const selectedDayCount = selectedDay ? (calendar[selectedDay] ?? 0) : 0

  return (
    <section className="space-y-3">
      <CalendarToolbar
        title={`Calendario del proyecto · ${monthVm.title}`}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
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
            calendar={calendar}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        )}
        <ProjectDayDetailPanel
          selectedDay={selectedDay}
          taskCount={selectedDayCount}
          lists={lists}
          onOpenKanban={onOpenKanban}
        />
      </div>
    </section>
  )
}
