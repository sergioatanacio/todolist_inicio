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
      done INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)
  await idbSet(DB_FILE, db.export().buffer)
  return db
}

export const persistDatabase = async (db: Database) => {
  const data = db.export()
  await idbSet(DB_FILE, data.buffer)
}
