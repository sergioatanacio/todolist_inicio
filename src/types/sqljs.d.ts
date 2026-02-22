declare module 'sql.js' {
  export type BindParams = readonly unknown[] | unknown[]

  export interface Statement {
    bind(params?: BindParams): void
    step(): boolean
    getAsObject(params?: BindParams): Record<string, unknown>
    run(params?: BindParams): void
    free(): void
  }

  export interface Database {
    exec(sql: string): unknown
    prepare(sql: string): Statement
    export(): Uint8Array
  }

  type SqlJsStatic = {
    Database: new (data?: Uint8Array) => Database
  }

  type InitOptions = {
    locateFile?: (file: string) => string
  }

  export default function initSqlJs(options?: InitOptions): Promise<SqlJsStatic>
}
