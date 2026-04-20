import type { SetBusy, SetError, UiErrorKey } from './types'

type RunUiActionInput<T> = {
  setBusy: SetBusy
  setError: SetError
  errorKey: UiErrorKey
  fallbackMessage: string
  task: () => Promise<T>
}

export async function runUiAction<T>(input: RunUiActionInput<T>): Promise<T | null> {
  input.setBusy(true)
  input.setError(input.errorKey, null)
  try {
    return await input.task()
  } catch (error) {
    input.setError(
      input.errorKey,
      error instanceof Error ? error.message : input.fallbackMessage,
    )
    return null
  } finally {
    input.setBusy(false)
  }
}
