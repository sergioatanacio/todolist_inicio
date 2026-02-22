import type { DomainEventBus } from '../dominio/puertos/DomainEventBus'
import type { AiAgentRepository } from '../dominio/puertos/AiAgentRepository'
import type { AiConversationRepository } from '../dominio/puertos/AiConversationRepository'
import type { IdempotencyRepository } from '../dominio/puertos/IdempotencyRepository'
import type { ProjectRepository } from '../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../dominio/puertos/WorkspaceRepository'
import { DomainEventPublisher } from '../dominio/servicios/DomainEventPublisher'
import type { DisponibilidadAppService } from './DisponibilidadAppService'
import type { ProjectAppService } from './ProjectAppService'
import type { TaskPlanningAppService } from './TaskPlanningAppService'
import type { TodoListAppService } from './TodoListAppService'
import type { AddAiUserMessageCommand } from './commands/ai/AddAiUserMessageCommand'
import type { ApproveAiCommandCommand } from './commands/ai/ApproveAiCommandCommand'
import type { AttachAiCredentialRefCommand } from './commands/ai/AttachAiCredentialRefCommand'
import type { CloseAiConversationCommand } from './commands/ai/CloseAiConversationCommand'
import type { CreateAiAgentCommand } from './commands/ai/CreateAiAgentCommand'
import type { ExecuteAiCommandCommand } from './commands/ai/ExecuteAiCommandCommand'
import type { ListTasksDueTomorrowQuery } from './commands/ai/ListTasksDueTomorrowQuery'
import type { ProposeAiCommandCommand } from './commands/ai/ProposeAiCommandCommand'
import type { RejectAiCommandCommand } from './commands/ai/RejectAiCommandCommand'
import type { SetAiAgentStateCommand } from './commands/ai/SetAiAgentStateCommand'
import type { StartAiConversationCommand } from './commands/ai/StartAiConversationCommand'
import type { UpdateAiAgentPolicyCommand } from './commands/ai/UpdateAiAgentPolicyCommand'
import { AddAiUserMessageUseCase } from './use_cases/ai/AddAiUserMessageUseCase'
import { ApproveAiCommandUseCase } from './use_cases/ai/ApproveAiCommandUseCase'
import { AttachAiCredentialRefUseCase } from './use_cases/ai/AttachAiCredentialRefUseCase'
import { CloseAiConversationUseCase } from './use_cases/ai/CloseAiConversationUseCase'
import { CreateAiAgentUseCase } from './use_cases/ai/CreateAiAgentUseCase'
import { ExecuteAiCommandUseCase } from './use_cases/ai/ExecuteAiCommandUseCase'
import { ListTasksDueTomorrowUseCase } from './use_cases/ai/ListTasksDueTomorrowUseCase'
import { ProposeAiCommandUseCase } from './use_cases/ai/ProposeAiCommandUseCase'
import { RejectAiCommandUseCase } from './use_cases/ai/RejectAiCommandUseCase'
import { SetAiAgentStateUseCase } from './use_cases/ai/SetAiAgentStateUseCase'
import { StartAiConversationUseCase } from './use_cases/ai/StartAiConversationUseCase'
import { UpdateAiAgentPolicyUseCase } from './use_cases/ai/UpdateAiAgentPolicyUseCase'

export class AiAssistantAppService {
  private readonly createAiAgentUseCase: CreateAiAgentUseCase
  private readonly attachAiCredentialRefUseCase: AttachAiCredentialRefUseCase
  private readonly updateAiAgentPolicyUseCase: UpdateAiAgentPolicyUseCase
  private readonly setAiAgentStateUseCase: SetAiAgentStateUseCase
  private readonly startAiConversationUseCase: StartAiConversationUseCase
  private readonly addAiUserMessageUseCase: AddAiUserMessageUseCase
  private readonly proposeAiCommandUseCase: ProposeAiCommandUseCase
  private readonly approveAiCommandUseCase: ApproveAiCommandUseCase
  private readonly rejectAiCommandUseCase: RejectAiCommandUseCase
  private readonly executeAiCommandUseCase: ExecuteAiCommandUseCase
  private readonly closeAiConversationUseCase: CloseAiConversationUseCase
  private readonly listTasksDueTomorrowUseCase: ListTasksDueTomorrowUseCase

  constructor(
    aiAgentRepository: AiAgentRepository,
    aiConversationRepository: AiConversationRepository,
    idempotencyRepository: IdempotencyRepository,
    workspaceRepository: WorkspaceRepository,
    projectRepository: ProjectRepository,
    unitOfWork: UnitOfWork,
    eventBus: DomainEventBus,
    projectAppService: ProjectAppService,
    todoListAppService: TodoListAppService,
    disponibilidadAppService: DisponibilidadAppService,
    taskPlanningAppService: TaskPlanningAppService,
  ) {
    const eventPublisher = new DomainEventPublisher(eventBus)
    this.createAiAgentUseCase = new CreateAiAgentUseCase(
      aiAgentRepository,
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.attachAiCredentialRefUseCase = new AttachAiCredentialRefUseCase(
      aiAgentRepository,
      unitOfWork,
      eventPublisher,
    )
    this.updateAiAgentPolicyUseCase = new UpdateAiAgentPolicyUseCase(
      aiAgentRepository,
      unitOfWork,
      eventPublisher,
    )
    this.setAiAgentStateUseCase = new SetAiAgentStateUseCase(
      aiAgentRepository,
      unitOfWork,
      eventPublisher,
    )
    this.startAiConversationUseCase = new StartAiConversationUseCase(
      aiConversationRepository,
      aiAgentRepository,
      workspaceRepository,
      projectRepository,
      unitOfWork,
      eventPublisher,
    )
    this.addAiUserMessageUseCase = new AddAiUserMessageUseCase(
      aiConversationRepository,
      unitOfWork,
      eventPublisher,
    )
    this.proposeAiCommandUseCase = new ProposeAiCommandUseCase(
      aiConversationRepository,
      aiAgentRepository,
      unitOfWork,
      eventPublisher,
    )
    this.approveAiCommandUseCase = new ApproveAiCommandUseCase(
      aiConversationRepository,
      unitOfWork,
      eventPublisher,
    )
    this.rejectAiCommandUseCase = new RejectAiCommandUseCase(
      aiConversationRepository,
      unitOfWork,
      eventPublisher,
    )
    this.executeAiCommandUseCase = new ExecuteAiCommandUseCase(
      aiConversationRepository,
      aiAgentRepository,
      workspaceRepository,
      projectRepository,
      idempotencyRepository,
      projectAppService,
      todoListAppService,
      disponibilidadAppService,
      taskPlanningAppService,
      unitOfWork,
      eventPublisher,
    )
    this.closeAiConversationUseCase = new CloseAiConversationUseCase(
      aiConversationRepository,
      unitOfWork,
      eventPublisher,
    )
    this.listTasksDueTomorrowUseCase = new ListTasksDueTomorrowUseCase(
      workspaceRepository,
      projectRepository,
      taskPlanningAppService,
    )
  }

  createAgent(command: CreateAiAgentCommand) {
    return this.createAiAgentUseCase.execute(command)
  }

  attachCredentialRef(command: AttachAiCredentialRefCommand) {
    return this.attachAiCredentialRefUseCase.execute(command)
  }

  updateAgentPolicy(command: UpdateAiAgentPolicyCommand) {
    return this.updateAiAgentPolicyUseCase.execute(command)
  }

  setAgentState(command: SetAiAgentStateCommand) {
    return this.setAiAgentStateUseCase.execute(command)
  }

  startConversation(command: StartAiConversationCommand) {
    return this.startAiConversationUseCase.execute(command)
  }

  addUserMessage(command: AddAiUserMessageCommand) {
    return this.addAiUserMessageUseCase.execute(command)
  }

  proposeCommand(command: ProposeAiCommandCommand) {
    return this.proposeAiCommandUseCase.execute(command)
  }

  approveCommand(command: ApproveAiCommandCommand) {
    return this.approveAiCommandUseCase.execute(command)
  }

  rejectCommand(command: RejectAiCommandCommand) {
    return this.rejectAiCommandUseCase.execute(command)
  }

  executeCommand(command: ExecuteAiCommandCommand) {
    return this.executeAiCommandUseCase.execute(command)
  }

  closeConversation(command: CloseAiConversationCommand) {
    return this.closeAiConversationUseCase.execute(command)
  }

  listTasksDueTomorrow(query: ListTasksDueTomorrowQuery) {
    return this.listTasksDueTomorrowUseCase.execute(query)
  }
}
