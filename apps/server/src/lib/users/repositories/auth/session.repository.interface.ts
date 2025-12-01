export interface ISessionRepository {
  findManyByUserId(userId: string): Promise<Array<{ token: string }>>;

  deleteAllByUserId(userId: string): Promise<number>;

  deleteAllExceptToken(userId: string, keepToken: string): Promise<number>;
}

