import type { AvailabilityDomainEvent } from './AvailabilityEvents'
import type { ProjectDomainEvent } from './ProjectEvents'
import type { TaskDomainEvent } from './TaskEvents'
import type { WorkspaceConversationDomainEvent } from './WorkspaceConversationEvents'
import type { WorkspaceDomainEvent } from './WorkspaceEvents'

export type AnyDomainEvent =
  | WorkspaceDomainEvent
  | ProjectDomainEvent
  | TaskDomainEvent
  | AvailabilityDomainEvent
  | WorkspaceConversationDomainEvent
