const getApiBaseUrl = () => {
  // 1. Try build-time/runtime environment variable
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL;
  }

  // 2. Client-side fallback: Guess backend URL from frontend URL
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    
    // If we are on the production domain, use the api subdomain
    if (hostname === "app.learnsup.fr") {
      return `${protocol}//api.learnsup.fr`;
    }
    
    // If we are on localhost, use the default backend port
    if (hostname === "localhost") {
      return `${protocol}//localhost:4500`;
    }
  }

  // 3. Last resort fallback
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
