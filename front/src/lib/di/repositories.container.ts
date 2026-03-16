import type { PrismaClient } from '@/lib/prisma';
import { PrismaWorkshopRepository } from "../workshops/repositories/workshop.repository";
import { PrismaWorkshopFeedbackRepository } from "../workshops/repositories/feedback/workshop-feedback.repository";
import { PrismaAppUserRepository } from "../users/repositories/app-user.repository";
import { PrismaMentorRepository } from "../mentors/repositories/mentor.repository";
import { PrismaWorkshopRequestRepository } from "../mentors/repositories/workshop-request.repository";
import { PrismaUserConnectionRepository } from "../users/repositories/connection/user-connection.repository";
import { PrismaConversationRepository } from "../messaging/repositories/conversation.repository";
import { PrismaMessageRepository } from "../messaging/repositories/message.repository";
import { PrismaMessageReactionRepository } from "../messaging/repositories/reactions/message-reaction.repository";
import { PrismaNotificationRepository } from "../notifications/repositories/notification.repository";
import { PrismaUserBlockRepository } from "../users/repositories/moderation/user-block.repository";
import { PrismaUserReportRepository } from "../users/repositories/moderation/user-report.repository";
import { PrismaCreditTransactionRepository } from "../credits/repositories/credit-transaction.repository";
import { PrismaCashbackQueueRepository } from "../workshops/repositories/cashback/cashback-queue.repository";
import { PrismaAuthUserRepository } from "../users/repositories/auth/auth-user.repository";
import { PrismaAccountRepository } from "../users/repositories/auth/account.repository";
import { PrismaSessionRepository } from "../users/repositories/auth/session.repository";
import { PrismaVerificationRepository } from "../users/repositories/verification/verification.repository";
import type { IWorkshopRepository } from "../workshops/repositories/workshop.repository.interface";
import type { IWorkshopFeedbackRepository } from "../workshops/repositories/feedback/workshop-feedback.repository.interface";
import type { AppUserRepository } from "../users/repositories";
import type { IMentorRepository } from "../mentors/repositories/mentor.repository.interface";
import type { IWorkshopRequestRepository } from "../mentors/repositories/workshop-request.repository.interface";
import type { IUserConnectionRepository } from "../users/repositories/connection/user-connection.repository.interface";
import type { IConversationRepository } from "../messaging/repositories/conversation.repository.interface";
import type { IMessageRepository } from "../messaging/repositories/message.repository.interface";
import type { IMessageReactionRepository } from "../messaging/repositories/reactions/message-reaction.repository.interface";
import type { INotificationRepository } from "../notifications/repositories/notification.repository.interface";
import type { IUserBlockRepository } from "../users/repositories/moderation/user-block.repository.interface";
import type { IUserReportRepository } from "../users/repositories/moderation/user-report.repository.interface";
import type { ICreditTransactionRepository } from "../credits/repositories/credit-transaction.repository.interface";
import type { ICashbackQueueRepository } from "../workshops/repositories/cashback/cashback-queue.repository.interface";
import type { IAuthUserRepository } from "../users/repositories/auth/auth-user.repository.interface";
import type { IAccountRepository } from "../users/repositories/auth/account.repository.interface";
import type { ISessionRepository } from "../users/repositories/auth/session.repository.interface";
import type { IVerificationRepository } from "../users/repositories/verification/verification.repository.interface";
import { PrismaSupportRequestRepository } from "../support/repositories/support-request.repository";
import type { ISupportRequestRepository } from "../support/repositories/support-request.repository.interface";

export class RepositoriesContainer {
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
  private _authUserRepository?: IAuthUserRepository;
  private _accountRepository?: IAccountRepository;
  private _sessionRepository?: ISessionRepository;
  private _verificationRepository?: IVerificationRepository;
  private _userBlockRepository?: IUserBlockRepository;
  private _userReportRepository?: IUserReportRepository;
  private _supportRequestRepository?: ISupportRequestRepository;

  constructor(private readonly prisma: PrismaClient) {}

  get workshopRepository(): IWorkshopRepository {
    if (!this._workshopRepository) {
      this._workshopRepository = new PrismaWorkshopRepository(this.prisma);
    }
    return this._workshopRepository;
  }

  get workshopFeedbackRepository(): IWorkshopFeedbackRepository {
    if (!this._workshopFeedbackRepository) {
      this._workshopFeedbackRepository = new PrismaWorkshopFeedbackRepository(
        this.prisma
      );
    }
    return this._workshopFeedbackRepository;
  }

  get appUserRepository(): AppUserRepository {
    if (!this._appUserRepository) {
      this._appUserRepository = new PrismaAppUserRepository(this.prisma);
    }
    return this._appUserRepository;
  }

  get mentorRepository(): IMentorRepository {
    if (!this._mentorRepository) {
      this._mentorRepository = new PrismaMentorRepository(this.prisma);
    }
    return this._mentorRepository;
  }

  get workshopRequestRepository(): IWorkshopRequestRepository {
    if (!this._workshopRequestRepository) {
      this._workshopRequestRepository = new PrismaWorkshopRequestRepository(
        this.prisma
      );
    }
    return this._workshopRequestRepository;
  }

  get userConnectionRepository(): IUserConnectionRepository {
    if (!this._userConnectionRepository) {
      this._userConnectionRepository = new PrismaUserConnectionRepository(this.prisma);
    }
    return this._userConnectionRepository;
  }

  get conversationRepository(): IConversationRepository {
    if (!this._conversationRepository) {
      this._conversationRepository = new PrismaConversationRepository(this.prisma);
    }
    return this._conversationRepository;
  }

  get messageRepository(): IMessageRepository {
    if (!this._messageRepository) {
      this._messageRepository = new PrismaMessageRepository(this.prisma);
    }
    return this._messageRepository;
  }

  get messageReactionRepository(): IMessageReactionRepository {
    if (!this._messageReactionRepository) {
      this._messageReactionRepository = new PrismaMessageReactionRepository(this.prisma);
    }
    return this._messageReactionRepository;
  }

  get notificationRepository(): INotificationRepository {
    if (!this._notificationRepository) {
      this._notificationRepository = new PrismaNotificationRepository(
        this.prisma
      );
    }
    return this._notificationRepository;
  }

  get creditTransactionRepository(): ICreditTransactionRepository {
    if (!this._creditTransactionRepository) {
      this._creditTransactionRepository = new PrismaCreditTransactionRepository(
        this.prisma
      );
    }
    return this._creditTransactionRepository;
  }

  get cashbackQueueRepository(): ICashbackQueueRepository {
    if (!this._cashbackQueueRepository) {
      this._cashbackQueueRepository = new PrismaCashbackQueueRepository(
        this.prisma
      );
    }
    return this._cashbackQueueRepository;
  }

  get authUserRepository(): IAuthUserRepository {
    if (!this._authUserRepository) {
      this._authUserRepository = new PrismaAuthUserRepository(this.prisma);
    }
    return this._authUserRepository;
  }

  get accountRepository(): IAccountRepository {
    if (!this._accountRepository) {
      this._accountRepository = new PrismaAccountRepository(this.prisma);
    }
    return this._accountRepository;
  }

  get sessionRepository(): ISessionRepository {
    if (!this._sessionRepository) {
      this._sessionRepository = new PrismaSessionRepository(this.prisma);
    }
    return this._sessionRepository;
  }

  get verificationRepository(): IVerificationRepository {
    if (!this._verificationRepository) {
      this._verificationRepository = new PrismaVerificationRepository(
        this.prisma
      );
    }
    return this._verificationRepository;
  }

  get userBlockRepository(): IUserBlockRepository {
    if (!this._userBlockRepository) {
      this._userBlockRepository = new PrismaUserBlockRepository(this.prisma);
    }
    return this._userBlockRepository;
  }

  get userReportRepository(): IUserReportRepository {
    if (!this._userReportRepository) {
      this._userReportRepository = new PrismaUserReportRepository(this.prisma);
    }
    return this._userReportRepository;
  }

  get supportRequestRepository(): ISupportRequestRepository {
    if (!this._supportRequestRepository) {
      this._supportRequestRepository = new PrismaSupportRequestRepository(this.prisma);
    }
    return this._supportRequestRepository;
  }
}
