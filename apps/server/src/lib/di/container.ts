import { prisma } from "../common/prisma";

// Repositories
import { PrismaWorkshopRepository } from "../workshops/repositories/workshop.repository";
import { PrismaAppUserRepository } from "../users/repositories/app-user.repository";
import type { IWorkshopRepository } from "../workshops/repositories/workshop.repository.interface";
import type { AppUserRepository } from "../users/repositories";

// Services
import { WorkshopService } from "../workshops/services/workshop.service";
import type { IWorkshopService } from "../workshops/services/workshop.service.interface";

class DIContainer {
  private static instance: DIContainer;
  private readonly _prisma: typeof prisma;

  // Repository instances
  private _workshopRepository?: IWorkshopRepository;
  private _appUserRepository?: AppUserRepository;

  // Service instances
  private _workshopService?: IWorkshopService;

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
}

export const container = DIContainer.getInstance();

