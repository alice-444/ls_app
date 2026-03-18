import type { IHttpClient } from "./http-client.interface";

export class HttpClient implements IHttpClient {
  constructor(private readonly baseUrl: string) {}

  async post<T = unknown>(
    url: string,
    body: unknown,
    options?: RequestInit
  ): Promise<{ ok: boolean; data?: T; error?: string; status?: number }> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          ok: false,
          error: errorData?.message || "Request failed",
          status: response.status,
        };
      }

      const data = await response.json().catch(() => ({}));
      return { ok: true, data: data as T };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  }
}
