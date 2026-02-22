import type { DisponibilidadAggregate } from '../entidades/DisponibilidadAggregate'

export interface DisponibilidadRepository {
  findById(id: string): DisponibilidadAggregate | null
  findByProjectId(projectId: string): DisponibilidadAggregate[]
  save(disponibilidad: DisponibilidadAggregate): void
}
