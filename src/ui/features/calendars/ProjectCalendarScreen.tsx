import type { TodoListVm } from '../../types/AppUiModels'
import { ProjectCalendarPage } from '../calendar/pages/ProjectCalendarPage'

type ProjectCalendarScreenProps = {
  calendar: Record<string, number>
  lists: TodoListVm[]
  onOpenKanban: (listId: string) => void
}

export function ProjectCalendarScreen({
  calendar,
  lists,
  onOpenKanban,
}: ProjectCalendarScreenProps) {
  return <ProjectCalendarPage calendar={calendar} lists={lists} onOpenKanban={onOpenKanban} />
}
