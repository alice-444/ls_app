import { PrismaClient } from "../../../prisma/generated/client/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Repositories
import { PrismaWorkshopRepository } from "../workshops/repositories/workshop.repository";
import { PrismaWorkshopFeedbackRepository } from "../workshops/repositories/feedback/workshop-feedback.repository";
import { PrismaAppUserRepository } from "../users/repositories/app-user.repository";
import { PrismaMentorRepository } from "../mentors/repositories/mentor.repository";
import { PrismaWorkshopRequestRepository } from "../mentors/repositories/workshop-request.repository";
import type { IWorkshopRepository } from "../workshops/repositories/workshop.repository.interface";
import type { IWorkshopFeedbackRepository } from "../workshops/repositories/feedback/workshop-feedback.repository.interface";
import type { AppUserRepository } from "../users/repositories";
import type { IMentorRepository } from "../mentors/repositories/mentor.repository.interface";
import type { IWorkshopRequestRepository } from "../mentors/repositories/workshop-request.repository.interface";

// Services
import { WorkshopService } from "../workshops/services/workshop.service";
import type { IWorkshopService } from "../workshops/services/workshop.service.interface";
import { WorkshopFeedbackService } from "../workshops/services/feedback/workshop-feedback.service";
import type { IWorkshopFeedbackService } from "../workshops/services/feedback/workshop-feedback.service.interface";
import { MentorProfileService } from "../mentors/services/profile/mentor-profile.service";
import type { IMentorProfileService } from "../mentors/services/profile/mentor-profile.service.interface";
import { MentorContactService } from "../mentors/services/contact/mentor-contact.service";
import type { IMentorContactService } from "../mentors/services/contact/mentor-contact.service.interface";
import { MentorFeedbackService } from "../mentors/services/feedback/mentor-feedback.service";
import type { IMentorFeedbackService } from "../mentors/services/feedback/mentor-feedback.service.interface";
import { MentorWorkshopService } from "../mentors/services/workshops/mentor-workshop.service";
import type { IMentorWorkshopService } from "../mentors/services/workshops/mentor-workshop.service.interface";
import { WorkshopRequestService } from "../mentors/services/workshops/workshop-request.service";
import type { IWorkshopRequestService } from "../mentors/services/workshops/workshop-request.service.interface";
import { ApprenticeProfileService } from "../users/services/profile/apprentice-profile.service";
import { UserConnectionService } from "../users/services/connection/user-connection.service";
import { PrismaUserConnectionRepository } from "../users/repositories/connection/user-connection.repository";
import type { IUserConnectionRepository } from "../users/repositories/connection/user-connection.repository.interface";
import { PrismaConversationRepository } from "../messaging/repositories/conversation.repository";
import { PrismaMessageRepository } from "../messaging/repositories/message.repository";
import { PrismaMessageReactionRepository } from "../messaging/repositories/reactions/message-reaction.repository";
import type { IConversationRepository } from "../messaging/repositories/conversation.repository.interface";
import type { IMessageRepository } from "../messaging/repositories/message.repository.interface";
import type { IMessageReactionRepository } from "../messaging/repositories/reactions/message-reaction.repository.interface";
import { MessagingService } from "../messaging/services/core/messaging.service";
import type { IMessagingService } from "../messaging/services/core/messaging.service.interface";
import { PresenceService } from "../messaging/services/core/presence.service";
import { MessageReactionService } from "../messaging/services/reactions/message-reaction.service";
import { MessageValidationService } from "../messaging/services/validation/message-validation.service";
import { MessageEnrichmentService } from "../messaging/services/enrichment/message-enrichment.service";
import type { IMessageValidationService } from "../messaging/services/validation/message-validation.service.interface";
import type { IMessageEnrichmentService } from "../messaging/services/enrichment/message-enrichment.service.interface";
import { PrismaNotificationRepository } from "../notifications/repositories/notification.repository";
import type { INotificationRepository } from "../notifications/repositories/notification.repository.interface";
import { NotificationService } from "../notifications/services/notification.service";
import type { INotificationService } from "../notifications/services/notification.service.interface";
import { SocketNotificationEventEmitter } from "../notifications/services/socket-notification-event-emitter";
import { PrismaUserBlockRepository } from "../users/repositories/moderation/user-block.repository";
import type { IUserBlockRepository } from "../users/repositories/moderation/user-block.repository.interface";
import { PrismaUserReportRepository } from "../users/repositories/moderation/user-report.repository";
import type { IUserReportRepository } from "../users/repositories/moderation/user-report.repository.interface";
import { UserBlockService } from "../users/services/moderation/user-block.service";
import type { IUserBlockService } from "../users/services/moderation/user-block.service.interface";
import { UserReportService } from "../users/services/moderation/user-report.service";
import type { IUserReportService } from "../users/services/moderation/user-report.service.interface";
import { AuditLogService } from "../common/audit-log.service";
import type { IAuditLogService } from "../common/audit-log.service";
import { CreditService } from "../credits/services/credit.service";
import type { ICreditService } from "../credits/services/credit.service.interface";
import { StripeService } from "../payment/services/stripe.service";
import type { IStripeService } from "../payment/services/stripe.service.interface";
import { ResendEmailService } from "../email/services/resend-email.service";
import type { IEmailService } from "../email/services/email.service.interface";
import { DailyService } from "../daily/services/daily.service";
import type { IDailyService } from "../daily/services/daily.service.interface";
import type { DailyConfig } from "../daily/config/daily.config.interface";
import { WorkshopVideoLinkService } from "../workshops/services/video/workshop-video-link.service";
import type { IWorkshopVideoLinkService } from "../workshops/services/video/workshop-video-link.service.interface";
import { WorkshopCashbackService } from "../workshops/services/rewards/workshop-cashback.service";
import type { IWorkshopCashbackService } from "../workshops/services/rewards/workshop-cashback.service.interface";
import { WorkshopNoShowPenaltyService } from "../workshops/services/rewards/workshop-no-show-penalty.service";
import type { IWorkshopNoShowPenaltyService } from "../workshops/services/rewards/workshop-no-show-penalty.service.interface";
import { UserTitleService } from "../users/services/profile/user-title.service";
import type { IUserTitleService } from "../users/services/profile/user-title.service.interface";
import { WorkshopTippingService } from "../workshops/services/feedback/workshop-tipping.service";
import type { IWorkshopTippingService } from "../workshops/services/feedback/workshop-tipping.service.interface";
import { PrismaCreditTransactionRepository } from "../credits/repositories/credit-transaction.repository";
import type { ICreditTransactionRepository } from "../credits/repositories/credit-transaction.repository.interface";
import { PrismaCashbackQueueRepository } from "../workshops/repositories/cashback/cashback-queue.repository";
import type { ICashbackQueueRepository } from "../workshops/repositories/cashback/cashback-queue.repository.interface";

class DIContainer {
  private static instance: DIContainer;
  private readonly _prisma: PrismaClient;

  // Repository instances
  private _workshopRepository?: IWorkshopRepository;
  private _workshopFeedbackRepository?: IWorkshopFeedbackRepository;
  private _appUserRepository?: AppUserRepository;
  private _mentorRepository?: IMentorRepository;
  private _workshopRequestRepository?: IWorkshopRequestRepository;
  private _userConnectionRepository?: IUserConnectionRepository;
  private _conversationRepository?: IConversationRepository;
  private _messageRepository?: IMessageRepository;
  private _messageReactionRepository?: IMessageReactionRepository;
  private _notificationRepository?: INotificationRepository;
  private _creditTransactionRepository?: ICreditTransactionRepository;
  private _cashbackQueueRepository?: ICashbackQueueRepository;

  // Service instances
  private _workshopService?: IWorkshopService;
  private _workshopFeedbackService?: IWorkshopFeedbackService;
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
  private _creditService?: ICreditService;
  private _stripeService?: IStripeService;
  private _emailService?: IEmailService;
  private _dailyService?: IDailyService;
  private _workshopVideoLinkService?: IWorkshopVideoLinkService;
  private _workshopCashbackService?: IWorkshopCashbackService;
  private _workshopNoShowPenaltyService?: IWorkshopNoShowPenaltyService;
  private _userTitleService?: IUserTitleService;
  private _workshopTippingService?: IWorkshopTippingService;

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

  get workshopFeedbackRepository(): IWorkshopFeedbackRepository {
    if (!this._workshopFeedbackRepository) {
      this._workshopFeedbackRepository = new PrismaWorkshopFeedbackRepository(
        this._prisma
      );
    }
    return this._workshopFeedbackRepository;
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

  get workshopFeedbackService(): IWorkshopFeedbackService {
    if (!this._workshopFeedbackService) {
      this._workshopFeedbackService = new WorkshopFeedbackService(
        this.workshopFeedbackRepository,
        this.workshopRepository,
        this.mentorRepository,
        this.creditService
      );
    }
    return this._workshopFeedbackService;
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
        this.creditService,
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

  get creditService(): ICreditService {
    if (!this._creditService) {
      this._creditService = new CreditService(this._prisma);
    }
    return this._creditService;
  }

  get stripeService(): IStripeService {
    if (!this._stripeService) {
      this._stripeService = new StripeService();
    }
    return this._stripeService;
  }

  get emailService(): IEmailService {
    if (!this._emailService) {
      this._emailService = new ResendEmailService();
    }
    return this._emailService;
  }

  get dailyService(): IDailyService {
    if (!this._dailyService) {
      const config: DailyConfig = {
        apiKey: process.env.DAILY_API_KEY || "",
        apiBaseUrl: process.env.DAILY_API_BASE_URL || "https://api.daily.co/v1",
        domain: process.env.DAILY_DOMAIN || "",
      };

      if (!config.apiKey) {
        throw new Error("DAILY_API_KEY environment variable is required");
      }

      this._dailyService = new DailyService(config);
    }
    return this._dailyService;
  }

  get workshopVideoLinkService(): IWorkshopVideoLinkService {
    if (!this._workshopVideoLinkService) {
      this._workshopVideoLinkService = new WorkshopVideoLinkService(
        this.workshopRepository
      );
    }
    return this._workshopVideoLinkService;
  }

  get creditTransactionRepository(): ICreditTransactionRepository {
    if (!this._creditTransactionRepository) {
      this._creditTransactionRepository = new PrismaCreditTransactionRepository(
        this._prisma
      );
    }
    return this._creditTransactionRepository;
  }

  get cashbackQueueRepository(): ICashbackQueueRepository {
    if (!this._cashbackQueueRepository) {
      this._cashbackQueueRepository = new PrismaCashbackQueueRepository(
        this._prisma
      );
    }
    return this._cashbackQueueRepository;
  }

  get workshopCashbackService(): IWorkshopCashbackService {
    if (!this._workshopCashbackService) {
      this._workshopCashbackService = new WorkshopCashbackService(
        this.workshopRepository,
        this.appUserRepository,
        this.creditTransactionRepository,
        this.cashbackQueueRepository,
        this.creditService,
        this.notificationService
      );
    }
    return this._workshopCashbackService;
  }

  get workshopNoShowPenaltyService(): IWorkshopNoShowPenaltyService {
    if (!this._workshopNoShowPenaltyService) {
      this._workshopNoShowPenaltyService = new WorkshopNoShowPenaltyService();
    }
    return this._workshopNoShowPenaltyService;
  }

  get userTitleService(): IUserTitleService {
    if (!this._userTitleService) {
      this._userTitleService = new UserTitleService(this._prisma);
    }
    return this._userTitleService;
  }

  get workshopTippingService(): IWorkshopTippingService {
    if (!this._workshopTippingService) {
      this._workshopTippingService = new WorkshopTippingService(
        this.creditService
      );
    }
    return this._workshopTippingService;
  }

  get prisma(): PrismaClient {
    return this._prisma;
  }
}

export const container = DIContainer.getInstance();
