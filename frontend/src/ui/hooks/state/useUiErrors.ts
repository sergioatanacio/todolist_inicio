import { useState } from 'react'
import type { UiErrors } from '../../types/AppUiModels'

const initialErrors: UiErrors = {
  auth: null,
  workspace: null,
  project: null,
  disponibilidad: null,
  segment: null,
  list: null,
  task: null,
  aiWorkspace: null,
  aiProject: null,
}

export const useUiErrors = () => {
  const [errors, setErrors] = useState<UiErrors>(initialErrors)

  const setError = (key: keyof UiErrors, message: string | null) => {
    setErrors((current) => ({ ...current, [key]: message }))
  }

  return {
    errors,
    setError,
    resetErrors: () => setErrors(initialErrors),
  }
}
