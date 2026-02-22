import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'

type ListDisponibilidadesByWorkspaceInput = {
  projectId: string
}

export class ListDisponibilidadesByWorkspaceUseCase {
  constructor(private readonly disponibilidadRepository: DisponibilidadRepository) {}

  execute(input: ListDisponibilidadesByWorkspaceInput) {
    return this.disponibilidadRepository.findByProjectId(input.projectId)
  }
}
