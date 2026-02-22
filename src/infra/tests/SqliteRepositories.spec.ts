import initSqlJs from 'sql.js'
import { DisponibilidadAggregate } from '../../dominio/entidades/DisponibilidadAggregate'
import { ProjectAggregate } from '../../dominio/entidades/ProjectAggregate'
import { TaskAggregate } from '../../dominio/entidades/TaskAggregate'
import { TodoAggregate } from '../../dominio/entidades/TodoAggregate'
import { TodoListAggregate } from '../../dominio/entidades/TodoListAggregate'
import { SqliteDisponibilidadRepository } from '../SqliteDisponibilidadRepository'
import { SqliteProjectRepository } from '../SqliteProjectRepository'
import { SqliteTaskRepository } from '../SqliteTaskRepository'
import { SqliteTodoListRepository } from '../SqliteTodoListRepository'
import { SqliteTodoRepository } from '../SqliteTodoRepository'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const createDb = async () => {
  const SQL = await initSqlJs()
  const db = new SQL.Database()
  db.exec(`
    CREATE TABLE todos (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      done INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE disponibilidades (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      workspace_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE todo_lists (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      disponibilidad_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE tasks_domain (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      todo_list_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)
  return db
}

export const sqliteRepositoriesSpec = async () => {
  const db = await createDb()
  const persist = async () => {}

  const todoRepo = new SqliteTodoRepository(db, persist)
  const projectRepo = new SqliteProjectRepository(db, persist)
  const disponibilidadRepo = new SqliteDisponibilidadRepository(db, persist)
  const todoListRepo = new SqliteTodoListRepository(db, persist)
  const taskRepo = new SqliteTaskRepository(db, persist)

  const todo = TodoAggregate.create(1, 'Todo de prueba', 45)
  await todoRepo.add(todo)
  const loadedTodo = todoRepo.findByUserId(1)[0]
  assert(loadedTodo.durationMinutes === 45, 'Todo duration_minutes no persistio')

  const project = ProjectAggregate.create('w-1', 1, 'Proyecto QA', 'Descripcion')
  projectRepo.save(project)
  const disponibilidad = DisponibilidadAggregate.create({
    projectId: project.id,
    name: 'Disponibilidad QA',
    description: 'Desc',
    startDate: '2026-02-20',
    endDate: '2026-02-20',
    segments: [
      {
        name: 'Segmento QA',
        startTime: '09:00',
        endTime: '11:00',
        specificDates: ['2026-02-20'],
      },
    ],
  })
  disponibilidadRepo.save(disponibilidad)
  assert(
    disponibilidadRepo.findByProjectId(project.id).length === 1,
    'Disponibilidad no persistio',
  )

  const list = TodoListAggregate.create(
    project.id,
    disponibilidad.id,
    1,
    'Lista QA',
    'Desc',
  )
  todoListRepo.save(list)

  const task = TaskAggregate.create({
    projectId: project.id,
    todoListId: list.id,
    title: 'Tarea QA',
    createdByUserId: 1,
    durationMinutes: 30,
    orderInList: 1,
  })
  taskRepo.save(task)
  const loadedTask = taskRepo.findById(task.id)
  assert(loadedTask !== null, 'Task no persistio')
  assert(loadedTask?.todoListId === list.id, 'Task todo_list_id inconsistente')
}
