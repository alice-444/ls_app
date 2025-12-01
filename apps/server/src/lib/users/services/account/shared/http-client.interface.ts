export interface IHttpClient {
  post<T = unknown>(
    url: string,
    body: unknown,
    options?: RequestInit
  ): Promise<{ ok: boolean; data?: T; error?: string; status?: number }>;
}

