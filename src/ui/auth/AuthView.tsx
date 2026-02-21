import type { AuthState } from '../../dominio/maquinas/AuthMachine'

type AuthViewProps = {
  state: AuthState
  name: string
  email: string
  password: string
  onModeChange: (mode: 'login' | 'register') => void
  onSubmit: () => void
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onFieldFocus: () => void
}

export function AuthView({
  state,
  name,
  email,
  password,
  onModeChange,
  onSubmit,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onFieldFocus,
}: AuthViewProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#f1e7dc_45%,_#eadfd7_100%)] px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
              Todo + SQLite
            </p>
            <h1 className="mt-4 font-serif text-3xl text-slate-900 md:text-4xl">
              Tu lista vive localmente
            </h1>
            <p className="mt-3 max-w-md text-slate-600">
              Registro y acceso cifrado con hash. Datos guardados en SQLite
              dentro de IndexedDB.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-6 py-4 text-sm text-white shadow-lg">
            <p className="text-3xl font-semibold">
              {new Date().toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              })}
            </p>
            <p className="uppercase tracking-[0.3em] text-white/60">hoy</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 rounded-3xl border border-slate-200 bg-white p-8">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onModeChange('login')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                state.mode === 'login'
                  ? 'bg-amber-200 text-slate-900'
                  : 'border border-slate-200 text-slate-500'
              }`}
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              onClick={() => onModeChange('register')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                state.mode === 'register'
                  ? 'bg-amber-200 text-slate-900'
                  : 'border border-slate-200 text-slate-500'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {state.mode === 'register' && (
            <div className="grid gap-3">
              <label className="text-sm font-semibold text-slate-600">
                Nombre
              </label>
              <input
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                onFocus={onFieldFocus}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div className="grid gap-3">
            <label className="text-sm font-semibold text-slate-600">
              Correo
            </label>
            <input
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              onFocus={onFieldFocus}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
              placeholder="correo@ejemplo.com"
              type="email"
            />
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-semibold text-slate-600">
              Contrasena
            </label>
            <input
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              onFocus={onFieldFocus}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
              placeholder="Minimo 6 caracteres"
              type="password"
            />
          </div>

          {state.status === 'error' && state.error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </p>
          )}

          <button
            type="button"
            onClick={onSubmit}
            className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            disabled={state.status === 'submitting'}
          >
            {state.status === 'submitting'
              ? 'Validando...'
              : state.mode === 'login'
                ? 'Entrar'
                : 'Crear cuenta'}
          </button>
        </div>
      </div>
    </div>
  )
}
