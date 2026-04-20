import type { AiAgentDomainEvent } from './AiAgentEvents'
import type { AiConversationDomainEvent } from './AiConversationEvents'
import type { AiUserCredentialDomainEvent } from './AiUserCredentialEvents'
import type { AvailabilityDomainEvent } from './AvailabilityEvents'
import type { ProjectDomainEvent } from './ProjectEvents'
import type { TaskDomainEvent } from './TaskEvents'
import type { WorkspaceConversationDomainEvent } from './WorkspaceConversationEvents'
import type { WorkspaceDomainEvent } from './WorkspaceEvents'

export type AnyDomainEvent =
  | AiAgentDomainEvent
  | AiConversationDomainEvent
  | AiUserCredentialDomainEvent
  | WorkspaceDomainEvent
  | ProjectDomainEvent
  | TaskDomainEvent
  | AvailabilityDomainEvent
  | WorkspaceConversationDomainEvent
