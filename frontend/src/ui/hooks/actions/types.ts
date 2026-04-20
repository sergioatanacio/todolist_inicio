import type { MutableRefObject } from 'react'
import type { AppServices } from '../../../aplicacion/AppBootstrap'
import type { createAppDataLoaders } from '../app/createAppDataLoaders'
import type { useUiDataState } from '../state/useUiDataState'
import type { SessionUser } from '../state/useSessionState'
import type { UiForms, UiFormSetters } from '../state/useUiForms'
import type { AppControllerContextIds, UiErrors } from '../../types/AppUiModels'

export type UiErrorKey = keyof UiErrors

export type ServicesRef = MutableRefObject<AppServices | null>
export type AppLoaders = ReturnType<typeof createAppDataLoaders>
export type AppDataState = ReturnType<typeof useUiDataState>['data']
export type AppDataSetters = ReturnType<typeof useUiDataState>['setters']
export type AppDataClearers = ReturnType<typeof useUiDataState>['clearers']

export type SetBusy = (value: boolean) => void
export type SetError = (key: UiErrorKey, message: string | null) => void
export type SetSession = (user: SessionUser) => void
export type ClearSession = () => void

export type BaseActionDeps = {
  servicesRef: ServicesRef
  userId: number | null
  context: AppControllerContextIds
  forms: UiForms
  setForms: UiFormSetters
  loaders: AppLoaders
  data: AppDataState
  setters: AppDataSetters
  setBusy: SetBusy
  setError: SetError
}
