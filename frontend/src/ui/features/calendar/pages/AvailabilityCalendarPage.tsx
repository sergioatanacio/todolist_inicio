import { useEffect, useMemo } from 'react'
import type { AvailabilityPlanVm } from '../../../types/AppUiModels'
import { mapAvailabilityPlanByDay } from '../mappers/availabilityCalendarMapper'
import { useCalendarViewMode } from '../hooks/useCalendarViewMode'
import { useSelectedDay } from '../hooks/useSelectedDay'
import { CalendarToolbar } from '../components/CalendarToolbar'
import { AvailabilityListView } from '../components/AvailabilityListView'
import { AvailabilityDayDetailPanel } from '../components/AvailabilityDayDetailPanel'

type AvailabilityCalendarPageProps = {
  plan: AvailabilityPlanVm | null
  onOpenKanban: (listId: string) => void
}

export function AvailabilityCalendarPage({
  plan,
  onOpenKanban,
}: AvailabilityCalendarPageProps) {
  const { viewMode, setViewMode } = useCalendarViewMode('list')
  const days = useMemo(() => mapAvailabilityPlanByDay(plan), [plan])
  const defaultDay = days[0]?.isoDate ?? null
  const { selectedDay, setSelectedDay } = useSelectedDay(defaultDay)

  useEffect(() => {
    if (!selectedDay && defaultDay) setSelectedDay(defaultDay)
  }, [defaultDay, selectedDay, setSelectedDay])

  const selected = selectedDay
    ? days.find((day) => day.isoDate === selectedDay) ?? null
    : null

  return (
    <section className="space-y-3">
      <CalendarToolbar
        title="Calendario de disponibilidad"
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
      />
      <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
        <AvailabilityListView
          days={days}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
        <AvailabilityDayDetailPanel selectedDay={selected} onOpenKanban={onOpenKanban} />
      </div>
      <div className="rounded-xl border border-slate-300 bg-white p-3 text-sm">
        <p>Bloques planificados: {plan?.plannedBlocks.length ?? 0}</p>
        <p>No planificadas: {plan?.unplannedTaskIds.length ?? 0}</p>
      </div>
    </section>
  )
}
