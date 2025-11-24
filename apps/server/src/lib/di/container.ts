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
import type { IConversationRepository } from "../messaging/repositories/conversation.repository.interface";
import type { IMessageRepository } from "../messaging/repositories/message.repository.interface";
import { MessagingService } from "../messaging/services/messaging.service";
import type { IMessagingService } from "../messaging/services/messaging.service.interface";

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
        this.workshopRequestRepository
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
        this.mentorRepository
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
        this.workshopRepository
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

  get messagingService(): IMessagingService {
    if (!this._messagingService) {
      this._messagingService = new MessagingService(
        this.appUserRepository,
        this.conversationRepository,
        this.messageRepository,
        this.workshopRepository
      );
    }
    return this._messagingService;
  }
}

export const container = DIContainer.getInstance();
