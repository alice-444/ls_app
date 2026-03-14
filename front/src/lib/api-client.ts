const getApiBaseUrl = () => {
  // 1. Client-side: Always prioritize the current browser domain in production
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    
    // Si on est sur un domaine de prod (pas localhost)
    if (hostname !== "localhost" && hostname !== "127.0.0.1" && hostname.includes(".")) {
      // Si on est sur app.domaine.fr, on vise api.domaine.fr
      if (hostname.startsWith("app.")) {
        return `${protocol}//${hostname.replace("app.", "api.")}`;
      }
      // Cas générique : on tente le sous-domaine api
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        return `${protocol}//api.${parts.slice(-2).join(".")}`;
      }
    }
  }

  // 2. Fallback sur la variable d'environnement (Build-time ou SSR)
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL;
  }

  // 3. Last resort fallback (Dev local)
  return "http://localhost:4500";
};

export const API_BASE_URL = getApiBaseUrl();

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
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/profile/role`,
    {
      method: "GET",
    }
  );
  
  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    role: data.role || null,
    status: data.status || null,
  };
}

export async function getUserRole(): Promise<"MENTOR" | "APPRENANT" | "ADMIN" | null> {
  const data = await getUserData();
  return data?.role || null;
}
