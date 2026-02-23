import initSqlJs, { type Database } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

const STORE_DB = 'todo_sqlite'
const STORE_NAME = 'files'
const DB_FILE = 'index.db'

const openIdb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(STORE_DB, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const idbGet = async (key: string) => {
  const db = await openIdb()
  return new Promise<ArrayBuffer | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(key)
    request.onsuccess = () => resolve((request.result as ArrayBuffer) ?? null)
    request.onerror = () => reject(request.error)
  })
}

const idbSet = async (key: string, value: ArrayBuffer) => {
  const db = await openIdb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(value, key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const initDatabase = async () => {
  const SQL = await initSqlJs({
    locateFile: () => wasmUrl,
  })
  const stored = await idbGet(DB_FILE)
  const db = stored ? new SQL.Database(new Uint8Array(stored)) : new SQL.Database()
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      done INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      owner_user_id INTEGER NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS disponibilidades (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS todo_lists (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      disponibilidad_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks_domain (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      todo_list_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ai_agents (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      created_by_user_id INTEGER NOT NULL,
      state TEXT NOT NULL,
      policy_json TEXT NOT NULL DEFAULT '{}',
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      state TEXT NOT NULL,
      messages_json TEXT NOT NULL DEFAULT '[]',
      commands_json TEXT NOT NULL DEFAULT '[]',
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ai_user_credentials (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      state TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(workspace_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS ai_secrets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      credential_ref TEXT NOT NULL,
      secret_value TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(workspace_id, user_id, provider)
    );
    CREATE TABLE IF NOT EXISTS idempotency_keys (
      key TEXT PRIMARY KEY,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL
    );
  `)
  // Compatibilidad con bases previas donde disponibilidades tenia workspace_id.
  try {
    db.exec('ALTER TABLE disponibilidades ADD COLUMN project_id TEXT')
  } catch {
    // Ignorar si ya existe.
  }
  try {
    db.exec('ALTER TABLE todos ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 30')
  } catch {
    // Ignorar si ya existe.
  }
  try {
    db.exec("ALTER TABLE ai_agents ADD COLUMN policy_json TEXT NOT NULL DEFAULT '{}'")
  } catch {
    // Ignorar si ya existe.
  }
  try {
    db.exec("ALTER TABLE ai_conversations ADD COLUMN messages_json TEXT NOT NULL DEFAULT '[]'")
  } catch {
    // Ignorar si ya existe.
  }
  try {
    db.exec("ALTER TABLE ai_conversations ADD COLUMN commands_json TEXT NOT NULL DEFAULT '[]'")
  } catch {
    // Ignorar si ya existe.
  }
  await idbSet(DB_FILE, db.export().buffer)
  return db
}

export const persistDatabase = async (db: Database) => {
  const data = db.export()
  await idbSet(DB_FILE, data.buffer)
}
