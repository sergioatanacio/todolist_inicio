import type { AiUserCredentialVm } from '../../../types/AppUiModels'

type UserCredentialPanelProps = {
  credential: AiUserCredentialVm
  provider: string
  credentialRef: string
  secret: string
  onProviderChange: (value: string) => void
  onCredentialRefChange: (value: string) => void
  onSecretChange: (value: string) => void
  onRegister: () => void
  onRotate: () => void
  onRevoke: () => void
  onSaveSecret: () => void
  busy: boolean
}

export function UserCredentialPanel({
  credential,
  provider,
  credentialRef,
  secret,
  onProviderChange,
  onCredentialRefChange,
  onSecretChange,
  onRegister,
  onRotate,
  onRevoke,
  onSaveSecret,
  busy,
}: UserCredentialPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h2 className="text-base font-semibold">Credencial de usuario</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          placeholder="provider"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={credentialRef}
          onChange={(e) => onCredentialRefChange(e.target.value)}
          placeholder="credentialRef"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <input
        type="password"
        value={secret}
        onChange={(e) => onSecretChange(e.target.value)}
        placeholder="token API"
        className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onRegister} disabled={busy} className="rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Registrar</button>
        <button type="button" onClick={onRotate} disabled={busy} className="rounded border border-slate-300 px-3 py-2 text-xs">Rotar</button>
        <button type="button" onClick={onRevoke} disabled={busy} className="rounded border border-slate-300 px-3 py-2 text-xs">Revocar</button>
        <button type="button" onClick={onSaveSecret} disabled={busy} className="rounded border border-slate-300 px-3 py-2 text-xs">Guardar token</button>
      </div>
      {credential ? (
        <p className="mt-2 text-xs text-slate-600">
          Estado: {credential.state} | Ref: {credential.credentialRef}
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-600">Sin credencial registrada.</p>
      )}
    </section>
  )
}
