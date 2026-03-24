export interface IAuthUserRepository {
  findById(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
  } | null>;

  findByEmail(email: string): Promise<{
    id: string;
    email: string;
    name: string;
  } | null>;

  updateEmail(userId: string, newEmail: string): Promise<void>;

  updateName(userId: string, name: string): Promise<void>;
}

