import { NextRequest } from "next/server";

const BASE_URL = "http://localhost:3000";

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string | object;
  headers?: Record<string, string>;
};

/**
 * Build a NextRequest for API route tests.
 */
export function createRequest(
  path: string,
  options: RequestOptions = {}
): NextRequest {
  const { method = "GET", body, headers = {} } = options;

  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body !== undefined && method !== "GET") {
    init.body =
      typeof body === "string" ? body : JSON.stringify(body);
  }

  return new NextRequest(url, init as any);
}

export async function getJson<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}
