import type { DomainEventBus } from '../dominio/puertos/DomainEventBus'
import type { AiAgentRepository } from '../dominio/puertos/AiAgentRepository'
import type { AiChatGateway } from '../dominio/puertos/AiChatGateway'
import type { AiConversationRepository } from '../dominio/puertos/AiConversationRepository'
import type { AiCredentialSecretStore } from '../dominio/puertos/AiCredentialSecretStore'
import type { AiUserCredentialRepository } from '../dominio/puertos/AiUserCredentialRepository'
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
import type { CloseAiConversationCommand } from './commands/ai/CloseAiConversationCommand'
import type { CreateAiAgentCommand } from './commands/ai/CreateAiAgentCommand'
import type { ExecuteAiCommandCommand } from './commands/ai/ExecuteAiCommandCommand'
import type { ListTasksDueTomorrowQuery } from './commands/ai/ListTasksDueTomorrowQuery'
import type { ProposeAiCommandCommand } from './commands/ai/ProposeAiCommandCommand'
import type { RejectAiCommandCommand } from './commands/ai/RejectAiCommandCommand'
import type { RegisterAiUserCredentialCommand } from './commands/ai/RegisterAiUserCredentialCommand'
import type { RevokeAiUserCredentialCommand } from './commands/ai/RevokeAiUserCredentialCommand'
import type { RotateAiUserCredentialCommand } from './commands/ai/RotateAiUserCredentialCommand'
import type { SendAiChatMessageCommand } from './commands/ai/SendAiChatMessageCommand'
import type { SetAiAgentStateCommand } from './commands/ai/SetAiAgentStateCommand'
import type { SetAiUserCredentialSecretCommand } from './commands/ai/SetAiUserCredentialSecretCommand'
import type { StartAiConversationCommand } from './commands/ai/StartAiConversationCommand'
import type { UpdateAiAgentPolicyCommand } from './commands/ai/UpdateAiAgentPolicyCommand'
import { AddAiUserMessageUseCase } from './use_cases/ai/AddAiUserMessageUseCase'
import { ApproveAiCommandUseCase } from './use_cases/ai/ApproveAiCommandUseCase'
import { CloseAiConversationUseCase } from './use_cases/ai/CloseAiConversationUseCase'
import { CreateAiAgentUseCase } from './use_cases/ai/CreateAiAgentUseCase'
import { ExecuteAiCommandUseCase } from './use_cases/ai/ExecuteAiCommandUseCase'
import { ListTasksDueTomorrowUseCase } from './use_cases/ai/ListTasksDueTomorrowUseCase'
import { ProposeAiCommandUseCase } from './use_cases/ai/ProposeAiCommandUseCase'
import { RejectAiCommandUseCase } from './use_cases/ai/RejectAiCommandUseCase'
import { RegisterAiUserCredentialUseCase } from './use_cases/ai/RegisterAiUserCredentialUseCase'
import { RevokeAiUserCredentialUseCase } from './use_cases/ai/RevokeAiUserCredentialUseCase'
import { RotateAiUserCredentialUseCase } from './use_cases/ai/RotateAiUserCredentialUseCase'
import { SendAiChatMessageUseCase } from './use_cases/ai/SendAiChatMessageUseCase'
import { SetAiAgentStateUseCase } from './use_cases/ai/SetAiAgentStateUseCase'
import { SetAiUserCredentialSecretUseCase } from './use_cases/ai/SetAiUserCredentialSecretUseCase'
import { StartAiConversationUseCase } from './use_cases/ai/StartAiConversationUseCase'
import { UpdateAiAgentPolicyUseCase } from './use_cases/ai/UpdateAiAgentPolicyUseCase'

export class AiAssistantAppService {
  private readonly aiAgentRepository: AiAgentRepository
  private readonly aiConversationRepository: AiConversationRepository
  private readonly aiUserCredentialRepository: AiUserCredentialRepository
  private readonly createAiAgentUseCase: CreateAiAgentUseCase
  private readonly registerAiUserCredentialUseCase: RegisterAiUserCredentialUseCase
  private readonly rotateAiUserCredentialUseCase: RotateAiUserCredentialUseCase
  private readonly revokeAiUserCredentialUseCase: RevokeAiUserCredentialUseCase
  private readonly setAiUserCredentialSecretUseCase: SetAiUserCredentialSecretUseCase
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
  private readonly sendAiChatMessageUseCase: SendAiChatMessageUseCase

  constructor(
    aiAgentRepository: AiAgentRepository,
    aiConversationRepository: AiConversationRepository,
    aiUserCredentialRepository: AiUserCredentialRepository,
    secretStore: AiCredentialSecretStore,
    chatGateway: AiChatGateway,
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
    this.aiAgentRepository = aiAgentRepository
    this.aiConversationRepository = aiConversationRepository
    this.aiUserCredentialRepository = aiUserCredentialRepository
    const eventPublisher = new DomainEventPublisher(eventBus)
    this.createAiAgentUseCase = new CreateAiAgentUseCase(
      aiAgentRepository,
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.registerAiUserCredentialUseCase = new RegisterAiUserCredentialUseCase(
      aiUserCredentialRepository,
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.rotateAiUserCredentialUseCase = new RotateAiUserCredentialUseCase(
      aiUserCredentialRepository,
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.revokeAiUserCredentialUseCase = new RevokeAiUserCredentialUseCase(
      aiUserCredentialRepository,
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.setAiUserCredentialSecretUseCase = new SetAiUserCredentialSecretUseCase(
      aiUserCredentialRepository,
      secretStore,
      workspaceRepository,
      unitOfWork,
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
      aiUserCredentialRepository,
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
    this.sendAiChatMessageUseCase = new SendAiChatMessageUseCase(
      aiConversationRepository,
      aiAgentRepository,
      aiUserCredentialRepository,
      secretStore,
      chatGateway,
      workspaceRepository,
      projectRepository,
      unitOfWork,
      eventPublisher,
    )
  }

  createAgent(command: CreateAiAgentCommand) {
    return this.createAiAgentUseCase.execute(command)
  }

  registerUserCredential(command: RegisterAiUserCredentialCommand) {
    return this.registerAiUserCredentialUseCase.execute(command)
  }

  rotateUserCredential(command: RotateAiUserCredentialCommand) {
    return this.rotateAiUserCredentialUseCase.execute(command)
  }

  revokeUserCredential(command: RevokeAiUserCredentialCommand) {
    return this.revokeAiUserCredentialUseCase.execute(command)
  }

  setUserCredentialSecret(command: SetAiUserCredentialSecretCommand) {
    return this.setAiUserCredentialSecretUseCase.execute(command)
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

  sendChatMessage(command: SendAiChatMessageCommand) {
    return this.sendAiChatMessageUseCase.execute(command)
  }

  listAgentsByWorkspace(workspaceId: string) {
    return this.aiAgentRepository.findByWorkspaceId(workspaceId)
  }

  listConversationsByWorkspace(workspaceId: string) {
    return this.aiConversationRepository.findByWorkspaceId(workspaceId)
  }

  findConversationById(conversationId: string) {
    return this.aiConversationRepository.findById(conversationId)
  }

  findUserCredential(workspaceId: string, userId: number) {
    return this.aiUserCredentialRepository.findByWorkspaceAndUser(workspaceId, userId)
  }
}
