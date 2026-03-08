export const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const authenticatedFetchOptions: RequestInit = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...authenticatedFetchOptions,
    ...options,
    headers: {
      ...authenticatedFetchOptions.headers,
      ...options.headers,
    },
  });
}

export async function getMentorProfile(): Promise<{
  profile?: Record<string, unknown>;
  isPublished?: boolean;
}> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/profile/role/mentor`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load profile: ${response.statusText}`);
  }

  return response.json();
}

export async function getUserData(): Promise<{
  role: "MENTOR" | "APPRENANT" | "ADMIN" | null;
  status: "PENDING" | "ACTIVE" | "UNDER_REVIEW" | "BLOCKED" | null;
} | null> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/profile/role`,
      {
        method: "GET",
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      role: data.role || null,
      status: data.status || null,
    };
  } catch {
    return null;
  }
}

export async function getUserRole(): Promise<"MENTOR" | "APPRENANT" | "ADMIN" | null> {
  const data = await getUserData();
  return data?.role || null;
}
