import type { AvailabilityPlanVm } from '../../types/AppUiModels'
import { AvailabilityCalendarPage } from '../calendar/pages/AvailabilityCalendarPage'

type AvailabilityCalendarScreenProps = {
  plan: AvailabilityPlanVm | null
  onOpenKanban: (listId: string) => void
}

export function AvailabilityCalendarScreen({
  plan,
  onOpenKanban,
}: AvailabilityCalendarScreenProps) {
  return <AvailabilityCalendarPage plan={plan} onOpenKanban={onOpenKanban} />
}
