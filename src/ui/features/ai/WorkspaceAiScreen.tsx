import type { AiAgentVm, AiUserCredentialVm } from '../../types/AppUiModels'
import { AgentPanel } from './components/AgentPanel'
import { UserCredentialPanel } from './components/UserCredentialPanel'

type WorkspaceAiScreenProps = {
  agents: AiAgentVm[]
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
  credential: AiUserCredentialVm
  provider: string
  model: string
  allowedIntentsCsv: string
  requireApprovalForWrites: boolean
  credentialProvider: string
  credentialRef: string
  credentialSecret: string
  onProviderChange: (value: string) => void
  onModelChange: (value: string) => void
  onAllowedIntentsCsvChange: (value: string) => void
  onRequireApprovalChange: (value: boolean) => void
  onCredentialProviderChange: (value: string) => void
  onCredentialRefChange: (value: string) => void
  onCredentialSecretChange: (value: string) => void
  onCreateAgent: () => void
  onPauseAgent: (agentId: string) => void
  onActivateAgent: (agentId: string) => void
  onRevokeAgent: (agentId: string) => void
  onRegisterCredential: () => void
  onRotateCredential: () => void
  onRevokeCredential: () => void
  onSaveSecret: () => void
  busy: boolean
  error: string | null
}

export function WorkspaceAiScreen(props: WorkspaceAiScreenProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AgentPanel
        agents={props.agents}
        selectedAgentId={props.selectedAgentId}
        onSelectAgent={props.onSelectAgent}
        provider={props.provider}
        model={props.model}
        allowedIntentsCsv={props.allowedIntentsCsv}
        requireApprovalForWrites={props.requireApprovalForWrites}
        onProviderChange={props.onProviderChange}
        onModelChange={props.onModelChange}
        onAllowedIntentsCsvChange={props.onAllowedIntentsCsvChange}
        onRequireApprovalChange={props.onRequireApprovalChange}
        onCreateAgent={props.onCreateAgent}
        onPauseAgent={props.onPauseAgent}
        onActivateAgent={props.onActivateAgent}
        onRevokeAgent={props.onRevokeAgent}
        busy={props.busy}
      />
      <UserCredentialPanel
        credential={props.credential}
        provider={props.credentialProvider}
        credentialRef={props.credentialRef}
        secret={props.credentialSecret}
        onProviderChange={props.onCredentialProviderChange}
        onCredentialRefChange={props.onCredentialRefChange}
        onSecretChange={props.onCredentialSecretChange}
        onRegister={props.onRegisterCredential}
        onRotate={props.onRotateCredential}
        onRevoke={props.onRevokeCredential}
        onSaveSecret={props.onSaveSecret}
        busy={props.busy}
      />
      {props.error ? (
        <p className="text-sm text-rose-600 md:col-span-2">{props.error}</p>
      ) : null}
    </div>
  )
}
