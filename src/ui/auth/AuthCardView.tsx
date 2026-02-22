type AuthMode = 'login' | 'register'

type AuthCardViewProps = {
  mode: AuthMode
  name: string
  email: string
  password: string
  submitting: boolean
  error: string | null
  onModeChange: (mode: AuthMode) => void
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
  onBack: () => void
}

export function AuthCardView({
  mode,
  name,
  email,
  password,
  submitting,
  error,
  onModeChange,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onBack,
}: AuthCardViewProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#f8fafc_0%,_#dbeafe_40%,_#e2e8f0_100%)] px-4 py-10">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl md:p-8">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Volver
        </button>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          {mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
        </h1>

        <div className="mt-5 grid grid-cols-2 rounded-2xl border border-slate-200 p-1 text-sm">
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className={`rounded-xl px-3 py-2 font-semibold ${
              mode === 'login' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => onModeChange('register')}
            className={`rounded-xl px-3 py-2 font-semibold ${
              mode === 'register' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Registro
          </button>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          {mode === 'register' ? (
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Nombre"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-indigo-100 transition focus:border-indigo-300 focus:ring-4"
            />
          ) : null}

          <input
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="Correo"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-indigo-100 transition focus:border-indigo-300 focus:ring-4"
          />

          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Contrasena"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-indigo-100 transition focus:border-indigo-300 focus:ring-4"
          />

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? 'Procesando...'
              : mode === 'login'
                ? 'Entrar'
                : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
