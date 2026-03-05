import type { PrismaClient } from '@/lib/prisma';
import type { RepositoriesContainer } from "./repositories.container";
import { WorkshopService } from "../workshops/services/workshop.service";
import { WorkshopFeedbackService } from "../workshops/services/feedback/workshop-feedback.service";
import { MentorProfileService } from "../mentors/services/profile/mentor-profile.service";
import { MentorContactService } from "../mentors/services/contact/mentor-contact.service";
import { MentorFeedbackService } from "../mentors/services/feedback/mentor-feedback.service";
import { MentorWorkshopService } from "../mentors/services/workshops/mentor-workshop.service";
import { WorkshopRequestService } from "../mentors/services/workshops/workshop-request.service";
import { WorkshopRequestNotificationService } from "../mentors/services/workshops/workshop-request-notification.service";
import { ApprenticeProfileService } from "../users/services/profile/apprentice-profile.service";
import { UserConnectionService } from "../users/services/connection/user-connection.service";
import { MessagingService } from "../messaging/services/core/messaging.service";
import { PresenceService } from "../messaging/services/core/presence.service";
import { MessageReactionService } from "../messaging/services/reactions/message-reaction.service";
import { MessageValidationService } from "../messaging/services/validation/message-validation.service";
import { MessageEnrichmentService } from "../messaging/services/enrichment/message-enrichment.service";
import { NotificationService } from "../notifications/services/notification.service";
import { SocketNotificationEventEmitter } from "../notifications/services/socket-notification-event-emitter";
import { UserBlockService } from "../users/services/moderation/user-block.service";
import { UserReportService } from "../users/services/moderation/user-report.service";
import { AuditLogService } from "../common/audit-log.service";
import { CreditService } from "../credits/services/credit.service";
import { PolarService } from "../payment/services/polar.service";
import { ResendEmailService } from "../email/services/resend-email.service";
import { DailyService } from "../daily/services/daily.service";
import { WorkshopVideoLinkService } from "../workshops/services/video/workshop-video-link.service";
import { WorkshopCashbackService } from "../workshops/services/rewards/workshop-cashback.service";
import { WorkshopNoShowPenaltyService } from "../workshops/services/rewards/workshop-no-show-penalty.service";
import { UserTitleService } from "../users/services/profile/user-title.service";
import { WorkshopTippingService } from "../workshops/services/feedback/workshop-tipping.service";
import { UpdateProfileService } from "../users/services/account/profile/update-profile.service";
import { ChangePasswordService } from "../users/services/account/security/change-password.service";
import { ChangeEmailService } from "../users/services/account/security/change-email.service";
import { BetterAuthService } from "../users/services/account/shared/auth.service";
import { LocalFileStorageService } from "../users/services/account/shared/file-storage.service";
import { ForgotPasswordService } from "../users/services/account/security/forgot-password.service";
import { PasswordValidationService } from "../users/services/account/security/password-validation.service";
import { HttpClient } from "../users/services/account/shared/http-client";
import { DeleteAccountEnhancedService } from "../users/services/account/deletion/delete-account-enhanced.service";
import { EmailTemplateService } from "../users/services/account/shared/email-template.service";
import { MagicLinkService } from "../auth/services/magic-link/magic-link.service";
import type { IWorkshopService } from "../workshops/services/workshop.service.interface";
import type { IWorkshopFeedbackService } from "../workshops/services/feedback/workshop-feedback.service.interface";
import type { IMentorProfileService } from "../mentors/services/profile/mentor-profile.service.interface";
import type { IMentorContactService } from "../mentors/services/contact/mentor-contact.service.interface";
import type { IMentorFeedbackService } from "../mentors/services/feedback/mentor-feedback.service.interface";
import type { IMentorWorkshopService } from "../mentors/services/workshops/mentor-workshop.service.interface";
import type { IWorkshopRequestService } from "../mentors/services/workshops/workshop-request.service.interface";
import type { IMessagingService } from "../messaging/services/core/messaging.service.interface";
import type { IMessageValidationService } from "../messaging/services/validation/message-validation.service.interface";
import type { IMessageEnrichmentService } from "../messaging/services/enrichment/message-enrichment.service.interface";
import type { INotificationService } from "../notifications/services/notification.service.interface";
import type { IUserBlockService } from "../users/services/moderation/user-block.service.interface";
import type { IUserReportService } from "../users/services/moderation/user-report.service.interface";
import type { IAuditLogService } from "../common/audit-log.service";
import type { ICreditService } from "../credits/services/credit.service.interface";
import type { IPolarService } from "../payment/services/polar.service.interface";
import type { IEmailService } from "../email/services/email.service.interface";
import type { IDailyService } from "../daily/services/daily.service.interface";
import type { IWorkshopVideoLinkService } from "../workshops/services/video/workshop-video-link.service.interface";
import type { IWorkshopCashbackService } from "../workshops/services/rewards/workshop-cashback.service.interface";
import type { IWorkshopNoShowPenaltyService } from "../workshops/services/rewards/workshop-no-show-penalty.service.interface";
import type { IUserTitleService } from "../users/services/profile/user-title.service.interface";
import type { IWorkshopTippingService } from "../workshops/services/feedback/workshop-tipping.service.interface";
import type { IUpdateProfileService } from "../users/services/account/profile/update-profile.service.interface";
import type { IChangePasswordService } from "../users/services/account/security/change-password.service.interface";
import type { IChangeEmailService } from "../users/services/account/security/change-email.service.interface";
import type { IForgotPasswordService } from "../users/services/account/security/forgot-password.service.interface";
import type { IDeleteAccountEnhancedService } from "../users/services/account/deletion/delete-account-enhanced.service.interface";
import type { DailyConfig } from "../daily/config/daily.config.interface";
import { WorkshopAttendanceService } from "../workshops/services/attendance/workshop-attendance.service";
import type { IWorkshopAttendanceService } from "../workshops/services/attendance/workshop-attendance.service.interface";
import { AdminService } from "../admin/services/admin.service";
import type { IAdminService } from "../admin/services/admin.service.interface";
import { SupportRequestService } from "../support/services/support-request.service";
import type { ISupportRequestService } from "../support/services/support-request.service.interface";
import type { IMagicLinkService } from "../auth/services/magic-link/magic-link.service.interface";
import { MaintenanceService } from "../maintenance/services/maintenance.service";
import type { IMaintenanceService } from "../maintenance/services/maintenance.service.interface";

export class ServicesContainer {
  private _adminService?: IAdminService;
  private _supportRequestService?: ISupportRequestService;
  private _magicLinkService?: IMagicLinkService;
  private _maintenanceService?: IMaintenanceService;

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
  private _userBlockService?: IUserBlockService;
  private _userReportService?: IUserReportService;
  private _auditLogService?: IAuditLogService;
  private _creditService?: ICreditService;
  private _polarService?: IPolarService;
  private _emailService?: IEmailService;
  private _dailyService?: IDailyService;
  private _workshopVideoLinkService?: IWorkshopVideoLinkService;
  private _workshopCashbackService?: IWorkshopCashbackService;
  private _workshopNoShowPenaltyService?: IWorkshopNoShowPenaltyService;
  private _userTitleService?: IUserTitleService;
  private _workshopTippingService?: IWorkshopTippingService;
  private _updateProfileService?: IUpdateProfileService;
  private _changePasswordService?: IChangePasswordService;
  private _changeEmailService?: IChangeEmailService;
  private _forgotPasswordService?: IForgotPasswordService;
  private _deleteAccountEnhancedService?: IDeleteAccountEnhancedService;
  private _workshopAttendanceService?: IWorkshopAttendanceService;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly repositories: RepositoriesContainer
  ) {}
  
  get magicLinkService(): IMagicLinkService {
    this._magicLinkService ??= new MagicLinkService(
      this.prisma,
      this.repositories.appUserRepository,
      this.emailService
    );
    return this._magicLinkService;
  }

  get workshopService(): IWorkshopService {
    this._workshopService ??= new WorkshopService(
      this.repositories.workshopRepository,
      this.repositories.appUserRepository,
      this.userBlockService,
      this.repositories.workshopRequestRepository,
      this.notificationService,
      this.workshopVideoLinkService,
      this.emailService,
      this.creditService,
      this.prisma
    );
    return this._workshopService;
  }

  get workshopFeedbackService(): IWorkshopFeedbackService {
    this._workshopFeedbackService ??= new WorkshopFeedbackService(
      this.repositories.workshopFeedbackRepository,
      this.workshopService,
      this.creditService,
      this.notificationService
    );
    return this._workshopFeedbackService;
  }

  get mentorProfileService(): IMentorProfileService {
    this._mentorProfileService ??= new MentorProfileService(
      this.repositories.mentorRepository,
      this.userBlockService
    );
    return this._mentorProfileService;
  }

  get mentorContactService(): IMentorContactService {
    this._mentorContactService ??= new MentorContactService(
      this.repositories.mentorRepository,
      this.notificationService,
      this.messagingService,
      this.userBlockService
    );
    return this._mentorContactService;
  }

  get mentorFeedbackService(): IMentorFeedbackService {
    this._mentorFeedbackService ??= new MentorFeedbackService(
      this.repositories.mentorRepository
    );
    return this._mentorFeedbackService;
  }

  get mentorWorkshopService(): IMentorWorkshopService {
    this._mentorWorkshopService ??= new MentorWorkshopService(
      this.repositories.mentorRepository
    );
    return this._mentorWorkshopService;
  }

  get workshopRequestService(): IWorkshopRequestService {
    this._workshopRequestService ??= new WorkshopRequestService(
      this.repositories.workshopRequestRepository,
      this.repositories.mentorRepository,
      this.repositories.workshopRepository,
      new WorkshopRequestNotificationService(
        this.repositories.workshopRequestRepository,
        this.repositories.workshopRepository,
        this.notificationService,
        this.emailService
      ),
      this.creditService,
      this.prisma
    );
    return this._workshopRequestService;
  }

  get apprenticeProfileService(): ApprenticeProfileService {
    this._apprenticeProfileService ??= new ApprenticeProfileService(
      this.repositories.appUserRepository,
      this.repositories.workshopRepository,
      this.repositories.userConnectionRepository,
      this.userBlockService
    );
    return this._apprenticeProfileService;
  }

  get userConnectionService(): UserConnectionService {
    this._userConnectionService ??= new UserConnectionService(
      this.repositories.appUserRepository,
      this.repositories.userConnectionRepository,
      this.userBlockService,
      this.notificationService
    );
    return this._userConnectionService;
  }

  get messageValidationService(): IMessageValidationService {
    this._messageValidationService ??= new MessageValidationService();
    return this._messageValidationService;
  }

  get messageEnrichmentService(): IMessageEnrichmentService {
    this._messageEnrichmentService ??= new MessageEnrichmentService(
      this.repositories.appUserRepository,
      this.repositories.messageRepository
    );
    return this._messageEnrichmentService;
  }

  get messagingService(): IMessagingService {
    this._messagingService ??= new MessagingService(
      this.repositories.appUserRepository,
      this.repositories.conversationRepository,
      this.repositories.messageRepository,
      this.messageValidationService,
      this.messageEnrichmentService,
      this.userBlockService,
      this.notificationService,
      this.repositories.workshopRepository,
      this.prisma
    );
    return this._messagingService;
  }

  get presenceService(): PresenceService {
    this._presenceService ??= new PresenceService(
      this.repositories.appUserRepository
    );
    return this._presenceService;
  }

  get messageReactionService(): MessageReactionService {
    this._messageReactionService ??= new MessageReactionService(
      this.repositories.messageReactionRepository,
      this.repositories.messageRepository,
      this.repositories.appUserRepository
    );
    return this._messageReactionService;
  }

  get notificationService(): INotificationService {
    if (!this._notificationService) {
      const eventEmitter = new SocketNotificationEventEmitter();
      this._notificationService = new NotificationService(
        this.repositories.notificationRepository,
        this.repositories.appUserRepository,
        eventEmitter,
        this.userBlockService,
        this.prisma
      );
    }
    return this._notificationService;
  }

  get auditLogService(): IAuditLogService {
    this._auditLogService ??= new AuditLogService();
    return this._auditLogService;
  }

  get userBlockService(): IUserBlockService {
    this._userBlockService ??= new UserBlockService(
      this.repositories.userBlockRepository,
      this.repositories.appUserRepository,
      this.auditLogService
    );
    return this._userBlockService;
  }

  get userReportService(): IUserReportService {
    this._userReportService ??= new UserReportService(
      this.repositories.userReportRepository,
      this.repositories.appUserRepository,
      this.auditLogService,
      this.notificationService
    );
    return this._userReportService;
  }

  get creditService(): ICreditService {
    this._creditService ??= new CreditService(this.prisma);
    return this._creditService;
  }

  get polarService(): IPolarService {
    this._polarService ??= new PolarService();
    return this._polarService;
  }

  get emailService(): IEmailService {
    this._emailService ??= new ResendEmailService();
    return this._emailService;
  }

  get dailyService(): IDailyService {
    if (!this._dailyService) {
      const config: DailyConfig = {
        apiKey: process.env.DAILY_API_KEY ?? "",
        apiBaseUrl: process.env.DAILY_API_BASE_URL ?? "https://api.daily.co/v1",
        domain: process.env.DAILY_DOMAIN ?? "",
      };

      if (!config.apiKey) {
        throw new Error("DAILY_API_KEY environment variable is required");
      }

      this._dailyService = new DailyService(config);
    }
    return this._dailyService;
  }

  get workshopVideoLinkService(): IWorkshopVideoLinkService {
    this._workshopVideoLinkService ??= new WorkshopVideoLinkService(
      this.repositories.workshopRepository
    );
    return this._workshopVideoLinkService;
  }

  get workshopCashbackService(): IWorkshopCashbackService {
    this._workshopCashbackService ??= new WorkshopCashbackService(
      this.repositories.workshopRepository,
      this.repositories.appUserRepository,
      this.repositories.creditTransactionRepository,
      this.repositories.cashbackQueueRepository,
      this.creditService,
      this.notificationService
    );
    return this._workshopCashbackService;
  }

  get workshopNoShowPenaltyService(): IWorkshopNoShowPenaltyService {
    this._workshopNoShowPenaltyService ??= new WorkshopNoShowPenaltyService();
    return this._workshopNoShowPenaltyService;
  }

  get userTitleService(): IUserTitleService {
    this._userTitleService ??= new UserTitleService(this.prisma);
    return this._userTitleService;
  }

  get workshopTippingService(): IWorkshopTippingService {
    this._workshopTippingService ??= new WorkshopTippingService(
      this.creditService
    );
    return this._workshopTippingService;
  }

  get updateProfileService(): IUpdateProfileService {
    this._updateProfileService ??= new UpdateProfileService(
      this.repositories.authUserRepository,
      this.repositories.appUserRepository
    );
    return this._updateProfileService;
  }

  get changePasswordService(): IChangePasswordService {
    this._changePasswordService ??= new ChangePasswordService(
      this.repositories.authUserRepository,
      this.repositories.accountRepository,
      new PasswordValidationService(),
      new BetterAuthService(),
      this.emailService
    );
    return this._changePasswordService;
  }

  get changeEmailService(): IChangeEmailService {
    this._changeEmailService ??= new ChangeEmailService(
      this.repositories.authUserRepository,
      this.repositories.verificationRepository,
      this.emailService,
      new EmailTemplateService(),
      new BetterAuthService()
    );
    return this._changeEmailService;
  }

  get forgotPasswordService(): IForgotPasswordService {
    if (!this._forgotPasswordService) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
      this._forgotPasswordService = new ForgotPasswordService(
        new PasswordValidationService(),
        new HttpClient(baseUrl)
      );
    }
    return this._forgotPasswordService;
  }

  get workshopAttendanceService(): IWorkshopAttendanceService {
    this._workshopAttendanceService ??= new WorkshopAttendanceService(
      this.workshopService,
      this.repositories.workshopRepository,
      this.userTitleService,
      this.workshopCashbackService,
      this.workshopNoShowPenaltyService,
      this.prisma
    );
    return this._workshopAttendanceService;
  }

  get deleteAccountEnhancedService(): IDeleteAccountEnhancedService {
    this._deleteAccountEnhancedService ??= new DeleteAccountEnhancedService(
      this.repositories.appUserRepository,
      this.repositories.workshopRepository,
      this.prisma,
      new LocalFileStorageService()
    );
    return this._deleteAccountEnhancedService;
  }

  get adminService(): IAdminService {
    this._adminService ??= new AdminService(this.prisma);
    return this._adminService;
  }

  get supportRequestService(): ISupportRequestService {
    this._supportRequestService ??= new SupportRequestService(
      this.repositories.supportRequestRepository,
      this.notificationService
    );
    return this._supportRequestService;
  }

  get maintenanceService(): IMaintenanceService {
    this._maintenanceService ??= new MaintenanceService(this.prisma, this);
    return this._maintenanceService;
  }
}
