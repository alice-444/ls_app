import { PrismaClient } from "../../../prisma/generated/client/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Repositories
import { PrismaWorkshopRepository } from "../workshops/repositories/workshop.repository";
import { PrismaAppUserRepository } from "../users/repositories/app-user.repository";
import { PrismaMentorRepository } from "../mentors/repositories/mentor.repository";
import { PrismaWorkshopRequestRepository } from "../mentors/repositories/workshop-request.repository";
import type { IWorkshopRepository } from "../workshops/repositories/workshop.repository.interface";
import type { AppUserRepository } from "../users/repositories";
import type { IMentorRepository } from "../mentors/repositories/mentor.repository.interface";
import type { IWorkshopRequestRepository } from "../mentors/repositories/workshop-request.repository.interface";

// Services
import { WorkshopService } from "../workshops/services/workshop.service";
import type { IWorkshopService } from "../workshops/services/workshop.service.interface";
import { MentorProfileService } from "../mentors/services/mentor-profile.service";
import type { IMentorProfileService } from "../mentors/services/mentor-profile.service.interface";
import { MentorContactService } from "../mentors/services/mentor-contact.service";
import type { IMentorContactService } from "../mentors/services/mentor-contact.service.interface";
import { MentorFeedbackService } from "../mentors/services/mentor-feedback.service";
import type { IMentorFeedbackService } from "../mentors/services/mentor-feedback.service.interface";
import { MentorWorkshopService } from "../mentors/services/mentor-workshop.service";
import type { IMentorWorkshopService } from "../mentors/services/mentor-workshop.service.interface";
import { WorkshopRequestService } from "../mentors/services/workshop-request.service";
import type { IWorkshopRequestService } from "../mentors/services/workshop-request.service.interface";
import { ApprenticeProfileService } from "../users/services/apprentice-profile.service";
import { UserConnectionService } from "../users/services/user-connection.service";
import { PrismaUserConnectionRepository } from "../users/repositories/user-connection.repository";
import type { IUserConnectionRepository } from "../users/repositories/user-connection.repository.interface";
import { PrismaConversationRepository } from "../messaging/repositories/conversation.repository";
import { PrismaMessageRepository } from "../messaging/repositories/message.repository";
import { PrismaMessageReactionRepository } from "../messaging/repositories/message-reaction.repository";
import type { IConversationRepository } from "../messaging/repositories/conversation.repository.interface";
import type { IMessageRepository } from "../messaging/repositories/message.repository.interface";
import type { IMessageReactionRepository } from "../messaging/repositories/message-reaction.repository.interface";
import { MessagingService } from "../messaging/services/messaging.service";
import type { IMessagingService } from "../messaging/services/messaging.service.interface";
import { PresenceService } from "../messaging/services/presence.service";
import { MessageReactionService } from "../messaging/services/message-reaction.service";
import { MessageValidationService } from "../messaging/services/message-validation.service";
import { MessageEnrichmentService } from "../messaging/services/message-enrichment.service";
import type { IMessageValidationService } from "../messaging/services/message-validation.service.interface";
import type { IMessageEnrichmentService } from "../messaging/services/message-enrichment.service.interface";
import { PrismaNotificationRepository } from "../notifications/repositories/notification.repository";
import type { INotificationRepository } from "../notifications/repositories/notification.repository.interface";
import { NotificationService } from "../notifications/services/notification.service";
import type { INotificationService } from "../notifications/services/notification.service.interface";
import { SocketNotificationEventEmitter } from "../notifications/services/socket-notification-event-emitter";
import { PrismaUserBlockRepository } from "../users/repositories/user-block.repository";
import type { IUserBlockRepository } from "../users/repositories/user-block.repository.interface";
import { PrismaUserReportRepository } from "../users/repositories/user-report.repository";
import type { IUserReportRepository } from "../users/repositories/user-report.repository.interface";
import { UserBlockService } from "../users/services/user-block.service";
import type { IUserBlockService } from "../users/services/user-block.service.interface";
import { UserReportService } from "../users/services/user-report.service";
import type { IUserReportService } from "../users/services/user-report.service.interface";
import { AuditLogService } from "../common/audit-log.service";
import type { IAuditLogService } from "../common/audit-log.service";

class DIContainer {
  private static instance: DIContainer;
  private readonly _prisma: PrismaClient;

  // Repository instances
  private _workshopRepository?: IWorkshopRepository;
  private _appUserRepository?: AppUserRepository;
  private _mentorRepository?: IMentorRepository;
  private _workshopRequestRepository?: IWorkshopRequestRepository;
  private _userConnectionRepository?: IUserConnectionRepository;
  private _conversationRepository?: IConversationRepository;
  private _messageRepository?: IMessageRepository;
  private _messageReactionRepository?: IMessageReactionRepository;
  private _notificationRepository?: INotificationRepository;

  // Service instances
  private _workshopService?: IWorkshopService;
  private _mentorProfileService?: IMentorProfileService;
  private _mentorContactService?: IMentorContactService;
  private _mentorFeedbackService?: IMentorFeedbackService;
  private _mentorWorkshopService?: IMentorWorkshopService;
  private _workshopRequestService?: IWorkshopRequestService;
  private _apprenticeProfileService?: ApprenticeProfileService;
  private _userConnectionService?: UserConnectionService;
  private _messagingService?: IMessagingService;
  private _presenceService?: PresenceService;
  private _messageReactionService?: MessageReactionService;
  private _messageValidationService?: IMessageValidationService;
  private _messageEnrichmentService?: IMessageEnrichmentService;
  private _notificationService?: INotificationService;
  private _userBlockRepository?: IUserBlockRepository;
  private _userReportRepository?: IUserReportRepository;
  private _userBlockService?: IUserBlockService;
  private _userReportService?: IUserReportService;
  private _auditLogService?: IAuditLogService;

  private constructor() {
    const useAccelerate = !!process.env.PRISMA_ACCELERATE_URL;

    if (useAccelerate) {
      this._prisma = new PrismaClient({
        accelerateUrl: process.env.PRISMA_ACCELERATE_URL!,
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      });
    } else {
      if (!process.env.DATABASE_URL) {
        throw new Error(
          "Either PRISMA_ACCELERATE_URL or DATABASE_URL environment variable must be set"
        );
      }
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 20,
      });
      const adapter = new PrismaPg(pool);
      this._prisma = new PrismaClient({
        adapter,
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      });
    }
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Getters for repositories
  get workshopRepository(): IWorkshopRepository {
    if (!this._workshopRepository) {
      this._workshopRepository = new PrismaWorkshopRepository(this._prisma);
    }
    return this._workshopRepository;
  }

  get appUserRepository(): AppUserRepository {
    if (!this._appUserRepository) {
      this._appUserRepository = new PrismaAppUserRepository(this._prisma);
    }
    return this._appUserRepository;
  }

  get mentorRepository(): IMentorRepository {
    if (!this._mentorRepository) {
      this._mentorRepository = new PrismaMentorRepository(this._prisma);
    }
    return this._mentorRepository;
  }

  get workshopRequestRepository(): IWorkshopRequestRepository {
    if (!this._workshopRequestRepository) {
      this._workshopRequestRepository = new PrismaWorkshopRequestRepository(
        this._prisma
      );
    }
    return this._workshopRequestRepository;
  }

  // Getters for services
  get workshopService(): IWorkshopService {
    if (!this._workshopService) {
      this._workshopService = new WorkshopService(
        this.workshopRepository,
        this.appUserRepository,
        this.workshopRequestRepository,
        this.notificationService
      );
    }
    return this._workshopService;
  }

  get mentorProfileService(): IMentorProfileService {
    if (!this._mentorProfileService) {
      this._mentorProfileService = new MentorProfileService(
        this.mentorRepository
      );
    }
    return this._mentorProfileService;
  }

  get mentorContactService(): IMentorContactService {
    if (!this._mentorContactService) {
      this._mentorContactService = new MentorContactService(
        this.mentorRepository,
        this.notificationService,
        this.messagingService
      );
    }
    return this._mentorContactService;
  }

  get mentorFeedbackService(): IMentorFeedbackService {
    if (!this._mentorFeedbackService) {
      this._mentorFeedbackService = new MentorFeedbackService(
        this.mentorRepository
      );
    }
    return this._mentorFeedbackService;
  }

  get mentorWorkshopService(): IMentorWorkshopService {
    if (!this._mentorWorkshopService) {
      this._mentorWorkshopService = new MentorWorkshopService(
        this.mentorRepository
      );
    }
    return this._mentorWorkshopService;
  }

  get workshopRequestService(): IWorkshopRequestService {
    if (!this._workshopRequestService) {
      this._workshopRequestService = new WorkshopRequestService(
        this.workshopRequestRepository,
        this.mentorRepository,
        this.workshopRepository,
        this.notificationService,
        this._prisma
      );
    }
    return this._workshopRequestService;
  }

  get apprenticeProfileService(): ApprenticeProfileService {
    if (!this._apprenticeProfileService) {
      this._apprenticeProfileService = new ApprenticeProfileService(
        this.appUserRepository,
        this.workshopRepository,
        this.userConnectionRepository
      );
    }
    return this._apprenticeProfileService;
  }

  get userConnectionRepository(): IUserConnectionRepository {
    if (!this._userConnectionRepository) {
      this._userConnectionRepository = new PrismaUserConnectionRepository();
    }
    return this._userConnectionRepository;
  }

  get userConnectionService(): UserConnectionService {
    if (!this._userConnectionService) {
      this._userConnectionService = new UserConnectionService(
        this.appUserRepository,
        this.userConnectionRepository
      );
    }
    return this._userConnectionService;
  }

  get conversationRepository(): IConversationRepository {
    if (!this._conversationRepository) {
      this._conversationRepository = new PrismaConversationRepository();
    }
    return this._conversationRepository;
  }

  get messageRepository(): IMessageRepository {
    if (!this._messageRepository) {
      this._messageRepository = new PrismaMessageRepository();
    }
    return this._messageRepository;
  }

  get messageValidationService(): IMessageValidationService {
    if (!this._messageValidationService) {
      this._messageValidationService = new MessageValidationService();
    }
    return this._messageValidationService;
  }

  get messageEnrichmentService(): IMessageEnrichmentService {
    if (!this._messageEnrichmentService) {
      this._messageEnrichmentService = new MessageEnrichmentService(
        this.appUserRepository,
        this.messageRepository
      );
    }
    return this._messageEnrichmentService;
  }

  get messagingService(): IMessagingService {
    if (!this._messagingService) {
      this._messagingService = new MessagingService(
        this.appUserRepository,
        this.conversationRepository,
        this.messageRepository,
        this.messageValidationService,
        this.messageEnrichmentService,
        this.userBlockService,
        this.workshopRepository,
        this._prisma
      );
    }
    return this._messagingService;
  }

  get messageReactionRepository(): IMessageReactionRepository {
    if (!this._messageReactionRepository) {
      this._messageReactionRepository = new PrismaMessageReactionRepository();
    }
    return this._messageReactionRepository;
  }

  get presenceService(): PresenceService {
    if (!this._presenceService) {
      this._presenceService = new PresenceService(this.appUserRepository);
    }
    return this._presenceService;
  }

  get messageReactionService(): MessageReactionService {
    if (!this._messageReactionService) {
      this._messageReactionService = new MessageReactionService(
        this.messageReactionRepository,
        this.messageRepository,
        this.appUserRepository
      );
    }
    return this._messageReactionService;
  }

  get notificationRepository(): INotificationRepository {
    if (!this._notificationRepository) {
      this._notificationRepository = new PrismaNotificationRepository(
        this._prisma
      );
    }
    return this._notificationRepository;
  }

  get notificationService(): INotificationService {
    if (!this._notificationService) {
      const eventEmitter = new SocketNotificationEventEmitter();
      this._notificationService = new NotificationService(
        this.notificationRepository,
        this.appUserRepository,
        eventEmitter,
        this.userBlockService
      );
    }
    return this._notificationService;
  }

  get userBlockRepository(): IUserBlockRepository {
    if (!this._userBlockRepository) {
      this._userBlockRepository = new PrismaUserBlockRepository();
    }
    return this._userBlockRepository;
  }

  get userReportRepository(): IUserReportRepository {
    if (!this._userReportRepository) {
      this._userReportRepository = new PrismaUserReportRepository();
    }
    return this._userReportRepository;
  }

  get auditLogService(): IAuditLogService {
    if (!this._auditLogService) {
      this._auditLogService = new AuditLogService();
    }
    return this._auditLogService;
  }

  get userBlockService(): IUserBlockService {
    if (!this._userBlockService) {
      this._userBlockService = new UserBlockService(
        this.userBlockRepository,
        this.appUserRepository,
        this.auditLogService
      );
    }
    return this._userBlockService;
  }

  get userReportService(): IUserReportService {
    if (!this._userReportService) {
      this._userReportService = new UserReportService(
        this.userReportRepository,
        this.appUserRepository,
        this.auditLogService
      );
    }
    return this._userReportService;
  }

  get prisma(): PrismaClient {
    return this._prisma;
  }
}

export const container = DIContainer.getInstance();
