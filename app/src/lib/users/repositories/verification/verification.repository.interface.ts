export interface IVerificationRepository {
  upsertEmailChange(
    userId: string,
    newEmail: string,
    token: string,
    expiresAt: Date
  ): Promise<void>;

  findEmailChangeToken(token: string): Promise<{
    id: string;
    identifier: string;
    expiresAt: Date;
  } | null>;

  deleteById(id: string): Promise<void>;

  upsertPasswordReset(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void>;

  findPasswordResetToken(token: string): Promise<{
    id: string;
    identifier: string;
    expiresAt: Date;
  } | null>;
}

