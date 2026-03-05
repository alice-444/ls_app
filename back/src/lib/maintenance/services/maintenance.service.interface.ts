export interface IMaintenanceService {
  /**
   * Run scheduled account deletions (GDPR compliance / anonymization)
   */
  purgeScheduledDeletions(): Promise<{ processed: number; errors: number }>;

  /**
   * Create feedback request notifications for completed workshops
   */
  createFeedbackNotifications(): Promise<{
    created: number;
    skipped: number;
    timestamp: string;
  }>;

  /**
   * Generate Daily.co video links for upcoming virtual workshops
   */
  generateVideoLinks(): Promise<{
    processed: number;
    generated: number;
    errors: number;
  }>;

  /**
   * Cleanup inactive Daily.co rooms
   */
  cleanupInactiveRooms(): Promise<{
    processed: number;
    closed: number;
    errors: number;
  }>;

  /**
   * Verify cashback integrity and retry failed cashbacks
   */
  processCashbackMaintenance(): Promise<{
    processed: number;
    failed: number;
    retried: number;
    integrityIssues: number;
  }>;

  /**
   * Retry failed cashback operations
   */
  retryFailedCashbacks(): Promise<{ retried: number; errors: number }>;

  /**
   * Send email reminders for workshops starting in ~24h
   */
  sendWorkshopReminders(): Promise<{
    sent: number;
    errors: number;
    timestamp: string;
  }>;
}
