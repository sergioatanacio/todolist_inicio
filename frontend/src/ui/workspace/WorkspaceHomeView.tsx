type WorkspaceHomeViewProps = {
  userName: string
  userEmail: string
  workspaceName: string
  creatingWorkspace: boolean
  workspaceError: string | null
  projectName: string
  projectDescription: string
  creatingProject: boolean
  projectError: string | null
  disponibilidadName: string
  disponibilidadDescription: string
  disponibilidadStartDate: string
  disponibilidadEndDate: string
  creatingDisponibilidad: boolean
  disponibilidadError: string | null
  segmentName: string
  segmentDescription: string
  segmentStartTime: string
  segmentEndTime: string
  creatingSegment: boolean
  segmentError: string | null
  todoListName: string
  todoListDescription: string
  selectedDisponibilidadId: string
  creatingTodoList: boolean
  todoListError: string | null
  activeWorkspaceProjects: Array<{
    id: string
    name: string
    description: string
  }>
  activeWorkspaceDisponibilidades: Array<{
    id: string
    name: string
    description: string
    startDate: string
    endDate: string
    segments: Array<{
      id: string
      name: string
      description: string
      startTime: string
      endTime: string
    }>
  }>
  activeProjectTodoLists: Array<{
    id: string
    disponibilidadId: string
    name: string
    description: string
  }>
  createdWorkspaces: Array<{
    id: string
    name: string
    createdAt: number
  }>
  activeWorkspaceId: string | null
  activeProjectId: string | null
  onWorkspaceNameChange: (value: string) => void
  onProjectNameChange: (value: string) => void
  onProjectDescriptionChange: (value: string) => void
  onDisponibilidadStartDateChange: (value: string) => void
  onDisponibilidadEndDateChange: (value: string) => void
  onDisponibilidadNameChange: (value: string) => void
  onDisponibilidadDescriptionChange: (value: string) => void
  onSegmentNameChange: (value: string) => void
  onSegmentDescriptionChange: (value: string) => void
  onSegmentStartTimeChange: (value: string) => void
  onSegmentEndTimeChange: (value: string) => void
  onTodoListNameChange: (value: string) => void
  onTodoListDescriptionChange: (value: string) => void
  onSelectedDisponibilidadIdChange: (value: string) => void
  onCreateWorkspace: () => void
  onCreateProject: () => void
  onCreateDisponibilidad: () => void
  onCreateSegment: () => void
  onCreateTodoList: () => void
  onSelectProject: (projectId: string) => void
  onEnterWorkspace: (workspaceId: string) => void
  onLogout: () => void
}

export function WorkspaceHomeView({
  userName,
  userEmail,
  workspaceName,
  creatingWorkspace,
  workspaceError,
  projectName,
  projectDescription,
  creatingProject,
  projectError,
  disponibilidadName,
  disponibilidadDescription,
  disponibilidadStartDate,
  disponibilidadEndDate,
  creatingDisponibilidad,
  disponibilidadError,
  segmentName,
  segmentDescription,
  segmentStartTime,
  segmentEndTime,
  creatingSegment,
  segmentError,
  todoListName,
  todoListDescription,
  selectedDisponibilidadId,
  creatingTodoList,
  todoListError,
  activeWorkspaceProjects,
  activeWorkspaceDisponibilidades,
  activeProjectTodoLists,
  createdWorkspaces,
  activeWorkspaceId,
  activeProjectId,
  onWorkspaceNameChange,
  onProjectNameChange,
  onProjectDescriptionChange,
  onDisponibilidadStartDateChange,
  onDisponibilidadEndDateChange,
  onDisponibilidadNameChange,
  onDisponibilidadDescriptionChange,
  onSegmentNameChange,
  onSegmentDescriptionChange,
  onSegmentStartTimeChange,
  onSegmentEndTimeChange,
  onTodoListNameChange,
  onTodoListDescriptionChange,
  onSelectedDisponibilidadIdChange,
  onCreateWorkspace,
  onCreateProject,
  onCreateDisponibilidad,
  onCreateSegment,
  onCreateTodoList,
  onSelectProject,
  onEnterWorkspace,
  onLogout,
}: WorkspaceHomeViewProps) {
  const activeWorkspace =
    createdWorkspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
    null

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8fafc_0%,_#eef2ff_45%,_#dbeafe_100%)] px-4 py-6 text-slate-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-700">
            Sesion
          </p>
          <h2 className="mt-2 text-xl font-semibold">{userName}</h2>
          <p className="mt-1 text-sm text-slate-600">{userEmail}</p>

          <button
            type="button"
            onClick={onLogout}
            className="mt-5 w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cerrar sesion
          </button>
        </aside>

        <main className="grid gap-6">
          <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
              Workspace
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Panel de trabajo</h1>
            <p className="mt-2 text-sm text-slate-600">
              Crea workspaces y luego administra proyectos, disponibilidades y
              listas de tareas.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={workspaceName}
                onChange={(event) => onWorkspaceNameChange(event.target.value)}
                placeholder="Nombre del workspace"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-indigo-100 transition focus:border-indigo-300 focus:ring-4"
              />
              <button
                type="button"
                disabled={creatingWorkspace}
                onClick={onCreateWorkspace}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingWorkspace ? 'Creando...' : 'Crear Workspace'}
              </button>
            </div>

            {workspaceError ? (
              <p className="mt-3 text-sm text-rose-600">{workspaceError}</p>
            ) : null}

            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                Workspaces creados en sesion
              </h3>
              {createdWorkspaces.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  Aun no has creado workspaces en esta sesion.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {createdWorkspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {workspace.name}
                      </p>
                      <p className="text-xs text-slate-500">ID: {workspace.id}</p>
                      <button
                        type="button"
                        onClick={() => onEnterWorkspace(workspace.id)}
                        className={`mt-2 rounded-xl px-3 py-1 text-xs font-semibold ${
                          activeWorkspaceId === workspace.id
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        {activeWorkspaceId === workspace.id ? 'Activo' : 'Ingresar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Workspace activo</h3>
              {activeWorkspace ? (
                <div className="mt-2 space-y-2 text-sm text-slate-600">
                  <p>
                    Has ingresado a: <strong>{activeWorkspace.name}</strong>
                  </p>
                  <p>Desde aqui veras proyectos y disponibilidades.</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  Selecciona un workspace con el boton Ingresar.
                </p>
              )}
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Disponibilidades</h3>
              {!activeProjectId ? (
                <p className="mt-2 text-sm text-slate-600">
                  Selecciona un proyecto. Las disponibilidades pertenecen al proyecto.
                </p>
              ) : (
                <div className="mt-2 space-y-3">
                  <input
                    value={disponibilidadName}
                    onChange={(event) =>
                      onDisponibilidadNameChange(event.target.value)
                    }
                    placeholder="Nombre de disponibilidad"
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                  />
                  <textarea
                    value={disponibilidadDescription}
                    onChange={(event) =>
                      onDisponibilidadDescriptionChange(event.target.value)
                    }
                    placeholder="Descripcion de disponibilidad (opcional)"
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                    rows={2}
                  />
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={disponibilidadStartDate}
                      type="date"
                      onChange={(event) =>
                        onDisponibilidadStartDateChange(event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                    />
                    <input
                      value={disponibilidadEndDate}
                      type="date"
                      onChange={(event) =>
                        onDisponibilidadEndDateChange(event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={creatingDisponibilidad}
                    onClick={onCreateDisponibilidad}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {creatingDisponibilidad ? 'Creando...' : 'Crear disponibilidad'}
                  </button>
                  {disponibilidadError ? (
                    <p className="text-sm text-rose-600">{disponibilidadError}</p>
                  ) : null}
                  <div className="space-y-2">
                    {activeWorkspaceDisponibilidades.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No hay disponibilidades en este proyecto.
                      </p>
                    ) : (
                      activeWorkspaceDisponibilidades.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-slate-600">
                            {item.description || 'Sin descripcion'}
                          </p>
                          <p className="text-xs text-slate-600">
                            {item.startDate} a {item.endDate}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Segmentos: {item.segments.length}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Proyectos</h3>
              {!activeWorkspace ? (
                <p className="mt-2 text-sm text-slate-600">
                  Aun no hay workspace activo seleccionado.
                </p>
              ) : (
                <div className="mt-2 space-y-3">
                  <input
                    value={projectName}
                    onChange={(event) => onProjectNameChange(event.target.value)}
                    placeholder="Nombre del proyecto"
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                  />
                  <textarea
                    value={projectDescription}
                    onChange={(event) =>
                      onProjectDescriptionChange(event.target.value)
                    }
                    placeholder="Descripcion del proyecto"
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                  />
                  <button
                    type="button"
                    disabled={creatingProject}
                    onClick={onCreateProject}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {creatingProject ? 'Creando...' : 'Crear proyecto'}
                  </button>
                  {projectError ? (
                    <p className="text-sm text-rose-600">{projectError}</p>
                  ) : null}
                  <div className="space-y-2">
                    {activeWorkspaceProjects.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No hay proyectos en este workspace.
                      </p>
                    ) : (
                      activeWorkspaceProjects.map((project) => (
                        <div
                          key={project.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <p className="text-sm font-semibold">{project.name}</p>
                          <p className="text-xs text-slate-600">
                            {project.description || 'Sin descripcion'}
                          </p>
                          <button
                            type="button"
                            onClick={() => onSelectProject(project.id)}
                            className={`mt-2 rounded-xl px-3 py-1 text-xs font-semibold ${
                              activeProjectId === project.id
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {activeProjectId === project.id ? 'Activo' : 'Abrir'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg md:col-span-2">
              <h3 className="text-lg font-semibold">Segmentos de tiempo</h3>
              {!selectedDisponibilidadId ? (
                <p className="mt-2 text-sm text-slate-600">
                  Selecciona una disponibilidad para crear segmentos.
                </p>
              ) : (
                <div className="mt-2 grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <input
                      value={segmentName}
                      onChange={(event) => onSegmentNameChange(event.target.value)}
                      placeholder="Nombre del segmento"
                      className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                    />
                    <textarea
                      value={segmentDescription}
                      onChange={(event) =>
                        onSegmentDescriptionChange(event.target.value)
                      }
                      placeholder="Descripcion del segmento (opcional)"
                      className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                      rows={2}
                    />
                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        value={segmentStartTime}
                        type="time"
                        onChange={(event) =>
                          onSegmentStartTimeChange(event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        value={segmentEndTime}
                        type="time"
                        onChange={(event) => onSegmentEndTimeChange(event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={creatingSegment}
                      onClick={onCreateSegment}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {creatingSegment ? 'Creando...' : 'Crear segmento'}
                    </button>
                    {segmentError ? (
                      <p className="text-sm text-rose-600">{segmentError}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    {(activeWorkspaceDisponibilidades.find(
                      (item) => item.id === selectedDisponibilidadId,
                    )?.segments ?? []).length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Esta disponibilidad aun no tiene segmentos.
                      </p>
                    ) : (
                      (activeWorkspaceDisponibilidades.find(
                        (item) => item.id === selectedDisponibilidadId,
                      )?.segments ?? []).map((segment) => (
                        <div
                          key={segment.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <p className="text-sm font-semibold">{segment.name}</p>
                          <p className="text-xs text-slate-600">
                            {segment.description || 'Sin descripcion'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {segment.startTime} - {segment.endTime}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg md:col-span-2">
              <h3 className="text-lg font-semibold">Listas de tareas por proyecto</h3>
              {!activeProjectId ? (
                <p className="mt-2 text-sm text-slate-600">
                  Selecciona un proyecto para crear listas de tareas.
                </p>
              ) : (
                <div className="mt-2 grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <input
                      value={todoListName}
                      onChange={(event) => onTodoListNameChange(event.target.value)}
                      placeholder="Nombre de la lista"
                      className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                    />
                    <textarea
                      value={todoListDescription}
                      onChange={(event) =>
                        onTodoListDescriptionChange(event.target.value)
                      }
                      placeholder="Descripcion de la lista"
                      className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                      rows={3}
                    />
                    <select
                      value={selectedDisponibilidadId}
                      onChange={(event) =>
                        onSelectedDisponibilidadIdChange(event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Selecciona disponibilidad</option>
                      {activeWorkspaceDisponibilidades.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.startDate} a {item.endDate})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={creatingTodoList}
                      onClick={onCreateTodoList}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {creatingTodoList ? 'Creando...' : 'Crear lista de tareas'}
                    </button>
                    {todoListError ? (
                      <p className="text-sm text-rose-600">{todoListError}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    {activeProjectTodoLists.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Este proyecto aun no tiene listas de tareas.
                      </p>
                    ) : (
                      activeProjectTodoLists.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-slate-600">
                            {item.description || 'Sin descripcion'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Disponibilidad: {item.disponibilidadId}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </article>
          </section>
        </main>
      </div>
    </div>
  )
}
