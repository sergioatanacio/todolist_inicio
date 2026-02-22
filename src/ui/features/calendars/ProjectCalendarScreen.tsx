import type { ProjectCalendarVm } from '../../types/AppUiModels'
import { ProjectCalendarPage } from '../calendar/pages/ProjectCalendarPage'

type ProjectCalendarScreenProps = {
  calendar: ProjectCalendarVm
  onOpenKanban: (listId: string) => void
}

export function ProjectCalendarScreen({
  calendar,
  onOpenKanban,
}: ProjectCalendarScreenProps) {
  return <ProjectCalendarPage calendar={calendar} onOpenKanban={onOpenKanban} />
}
