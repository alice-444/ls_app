export interface IAccountRepository {
  findCredentialAccount(userId: string): Promise<{
    id: string;
    password: string | null;
  } | null>;

  updatePassword(accountId: string, hashedPassword: string): Promise<void>;

  setPasswordNull(userId: string): Promise<void>;
}

