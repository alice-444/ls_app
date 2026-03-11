import path from "node:path";
import { config } from "dotenv";

// Charger .env depuis le répertoire back/ (indépendant du cwd)
config({ path: path.resolve(__dirname, "../../../.env") });

import { prisma, PrismaClient } from '@/lib/prisma';
import { RepositoriesContainer } from "./repositories.container";
import { ServicesContainer } from "./services.container";

class DIContainer {
  private static instance: DIContainer;
  private readonly _prisma: PrismaClient;
  private readonly _repositories: RepositoriesContainer;
  private readonly _services: ServicesContainer;

  private constructor() {
    this._prisma = prisma;

    this._repositories = new RepositoriesContainer(this._prisma);
    this._services = new ServicesContainer(this._prisma, this._repositories);
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Delegate to repositories container
  get workshopRepository() {
    return this._repositories.workshopRepository;
  }

  get workshopFeedbackRepository() {
    return this._repositories.workshopFeedbackRepository;
  }

  get appUserRepository() {
    return this._repositories.appUserRepository;
  }

  get mentorRepository() {
    return this._repositories.mentorRepository;
  }

  get workshopRequestRepository() {
    return this._repositories.workshopRequestRepository;
  }

  get userConnectionRepository() {
    return this._repositories.userConnectionRepository;
  }

  get conversationRepository() {
    return this._repositories.conversationRepository;
  }

  get messageRepository() {
    return this._repositories.messageRepository;
  }

  get messageReactionRepository() {
    return this._repositories.messageReactionRepository;
  }

  get notificationRepository() {
    return this._repositories.notificationRepository;
  }

  get creditTransactionRepository() {
    return this._repositories.creditTransactionRepository;
  }

  get cashbackQueueRepository() {
    return this._repositories.cashbackQueueRepository;
  }

  get authUserRepository() {
    return this._repositories.authUserRepository;
  }

  get accountRepository() {
    return this._repositories.accountRepository;
  }

  get sessionRepository() {
    return this._repositories.sessionRepository;
  }

  get verificationRepository() {
    return this._repositories.verificationRepository;
  }

  get userBlockRepository() {
    return this._repositories.userBlockRepository;
  }

  get userReportRepository() {
    return this._repositories.userReportRepository;
  }

  // Delegate to services container
  get workshopService() {
    return this._services.workshopService;
  }

  get workshopFeedbackService() {
    return this._services.workshopFeedbackService;
  }

  get mentorProfileService() {
    return this._services.mentorProfileService;
  }

  get mentorContactService() {
    return this._services.mentorContactService;
  }

  get mentorFeedbackService() {
    return this._services.mentorFeedbackService;
  }

  get mentorWorkshopService() {
    return this._services.mentorWorkshopService;
  }

  get workshopRequestService() {
    return this._services.workshopRequestService;
  }

  get apprenticeProfileService() {
    return this._services.apprenticeProfileService;
  }

  get userConnectionService() {
    return this._services.userConnectionService;
  }

  get messagingService() {
    return this._services.messagingService;
  }

  get presenceService() {
    return this._services.presenceService;
  }

  get messageReactionService() {
    return this._services.messageReactionService;
  }

  get messageValidationService() {
    return this._services.messageValidationService;
  }

  get messageEnrichmentService() {
    return this._services.messageEnrichmentService;
  }

  get notificationService() {
    return this._services.notificationService;
  }

  get userBlockService() {
    return this._services.userBlockService;
  }

  get userReportService() {
    return this._services.userReportService;
  }

  get auditLogService() {
    return this._services.auditLogService;
  }

  get creditService() {
    return this._services.creditService;
  }

  get polarService() {
    return this._services.polarService;
  }

  get emailService() {
    return this._services.emailService;
  }

  get dailyService() {
    return this._services.dailyService;
  }

  get workshopVideoLinkService() {
    return this._services.workshopVideoLinkService;
  }

  get workshopCashbackService() {
    return this._services.workshopCashbackService;
  }

  get workshopNoShowPenaltyService() {
    return this._services.workshopNoShowPenaltyService;
  }

  get userTitleService() {
    return this._services.userTitleService;
  }

  get workshopTippingService() {
    return this._services.workshopTippingService;
  }

  get updateProfileService() {
    return this._services.updateProfileService;
  }

  get changePasswordService() {
    return this._services.changePasswordService;
  }

  get changeEmailService() {
    return this._services.changeEmailService;
  }

  get forgotPasswordService() {
    return this._services.forgotPasswordService;
  }

  get workshopAttendanceService() {
    return this._services.workshopAttendanceService;
  }

  get deleteAccountEnhancedService() {
    return this._services.deleteAccountEnhancedService;
  }

  get exportDataService() {
    return this._services.exportDataService;
  }

  get adminService() {
    return this._services.adminService;
  }

  get supportRequestService() {
    return this._services.supportRequestService;
  }

  get maintenanceService() {
    return this._services.maintenanceService;
  }

  get fileStorageService() {
    return this._services.fileStorageService;
  }

  get prisma(): PrismaClient {
    return this._prisma;
  }
}

export const container = DIContainer.getInstance();
