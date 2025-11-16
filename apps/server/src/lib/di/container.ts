import { prisma } from "../common/prisma";

// Repositories
import { PrismaWorkshopRepository } from "../workshops/repositories/workshop.repository";
import { PrismaAppUserRepository } from "../users/repositories/app-user.repository";
import { PrismaMentorRepository } from "../mentors/repositories/mentor.repository";
import type { IWorkshopRepository } from "../workshops/repositories/workshop.repository.interface";
import type { AppUserRepository } from "../users/repositories";
import type { IMentorRepository } from "../mentors/repositories/mentor.repository.interface";

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

class DIContainer {
  private static instance: DIContainer;
  private readonly _prisma: typeof prisma;

  // Repository instances
  private _workshopRepository?: IWorkshopRepository;
  private _appUserRepository?: AppUserRepository;
  private _mentorRepository?: IMentorRepository;

  // Service instances
  private _workshopService?: IWorkshopService;
  private _mentorProfileService?: IMentorProfileService;
  private _mentorContactService?: IMentorContactService;
  private _mentorFeedbackService?: IMentorFeedbackService;
  private _mentorWorkshopService?: IMentorWorkshopService;

  private constructor() {
    this._prisma = prisma;
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

  // Getters for services
  get workshopService(): IWorkshopService {
    if (!this._workshopService) {
      this._workshopService = new WorkshopService(
        this.workshopRepository,
        this.appUserRepository
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
}

export const container = DIContainer.getInstance();
