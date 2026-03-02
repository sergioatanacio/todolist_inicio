import { SegmentInputNormalizer } from '../../../dominio/servicios/SegmentInputNormalizer'
import { runUiAction } from './runUiAction'
import type { BaseActionDeps } from './types'

type DisponibilidadActionDeps = Pick<
  BaseActionDeps,
  'servicesRef' | 'userId' | 'context' | 'forms' | 'setForms' | 'loaders' | 'setBusy' | 'setError'
>

export const useDisponibilidadActions = ({
  servicesRef,
  userId,
  context,
  forms,
  setForms,
  loaders,
  setBusy,
  setError,
}: DisponibilidadActionDeps) => {
  const createDisponibilidad = async () => {
    const services = servicesRef.current
    if (!services || userId === null || !context.projectId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'disponibilidad',
      fallbackMessage: 'No se pudo crear disponibilidad.',
      task: async () => {
        await services.disponibilidad.create({
          projectId: context.projectId!,
          actorUserId: userId,
          name: forms.dispName,
          description: forms.dispDescription,
          startDate: forms.dispStart,
          endDate: forms.dispEnd,
        })
        setForms.setDispName('')
        setForms.setDispDescription('')
        setForms.setDispStart('')
        setForms.setDispEnd('')
        loaders.loadProjectContext(services, context.projectId!)
      },
    })
  }

  const updateDisponibilidad = async (
    disponibilidadId: string,
    data: {
      name: string
      description: string
      startDate: string
      endDate: string
    },
  ) => {
    const services = servicesRef.current
    if (!services || userId === null || !context.projectId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'disponibilidad',
      fallbackMessage: 'No se pudo editar disponibilidad.',
      task: async () => {
        await services.disponibilidad.update({
          projectId: context.projectId!,
          disponibilidadId,
          actorUserId: userId,
          ...data,
        })
        loaders.loadProjectContext(services, context.projectId!)
      },
    })
  }

  const addSegment = async () => {
    const services = servicesRef.current
    const targetDisponibilidadId = context.disponibilidadId ?? forms.selectedDispId
    if (!services || userId === null || !context.projectId || !targetDisponibilidadId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'segment',
      fallbackMessage: 'No se pudo agregar segmento.',
      task: async () => {
        await services.disponibilidad.addSegment({
          projectId: context.projectId!,
          disponibilidadId: targetDisponibilidadId,
          actorUserId: userId,
          name: forms.segName,
          description: forms.segDescription,
          startTime: forms.segStart,
          endTime: forms.segEnd,
          specificDates: SegmentInputNormalizer.toDatesCsv(forms.segDates),
          exclusionDates: SegmentInputNormalizer.toDatesCsv(forms.segExclusions),
          daysOfWeek: SegmentInputNormalizer.toNumberCsv(forms.segDaysWeek),
          daysOfMonth: SegmentInputNormalizer.toNumberCsv(forms.segDaysMonth),
        })
        setForms.setSegName('')
        setForms.setSegDescription('')
        setForms.setSegStart('')
        setForms.setSegEnd('')
        setForms.setSegDates('')
        setForms.setSegDaysWeek('')
        setForms.setSegDaysMonth('')
        setForms.setSegExclusions('')
        loaders.loadProjectContext(services, context.projectId!)
      },
    })
  }

  const updateSegment = async (
    segmentId: string,
    data: {
      name: string
      description: string
      startTime: string
      endTime: string
      specificDates: string
      exclusionDates: string
      daysOfWeek: string
      daysOfMonth: string
    },
  ) => {
    const services = servicesRef.current
    const targetDisponibilidadId = context.disponibilidadId ?? forms.selectedDispId
    if (!services || userId === null || !context.projectId || !targetDisponibilidadId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'segment',
      fallbackMessage: 'No se pudo editar segmento.',
      task: async () => {
        await services.disponibilidad.updateSegment({
          projectId: context.projectId!,
          disponibilidadId: targetDisponibilidadId,
          segmentId,
          actorUserId: userId,
          name: data.name,
          description: data.description,
          startTime: data.startTime,
          endTime: data.endTime,
          specificDates: SegmentInputNormalizer.toDatesCsv(data.specificDates),
          exclusionDates: SegmentInputNormalizer.toDatesCsv(data.exclusionDates),
          daysOfWeek: SegmentInputNormalizer.toNumberCsv(data.daysOfWeek),
          daysOfMonth: SegmentInputNormalizer.toNumberCsv(data.daysOfMonth),
        })
        loaders.loadProjectContext(services, context.projectId!)
      },
    })
  }

  const deleteSegment = async (segmentId: string) => {
    const services = servicesRef.current
    const targetDisponibilidadId = context.disponibilidadId ?? forms.selectedDispId
    if (!services || userId === null || !context.projectId || !targetDisponibilidadId) return

    await runUiAction({
      setBusy,
      setError,
      errorKey: 'segment',
      fallbackMessage: 'No se pudo eliminar segmento.',
      task: async () => {
        await services.disponibilidad.deleteSegment({
          projectId: context.projectId!,
          disponibilidadId: targetDisponibilidadId,
          segmentId,
          actorUserId: userId,
        })
        loaders.loadProjectContext(services, context.projectId!)
      },
    })
  }

  return {
    createDisponibilidad,
    updateDisponibilidad,
    addSegment,
    updateSegment,
    deleteSegment,
  }
}
