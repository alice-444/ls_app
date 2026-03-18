const getApiBaseUrl = () => {
  // En architecture Single Domain, l'API est sur le même domaine que le front.
  // On retourne une chaîne vide pour utiliser des chemins relatifs, 
  // ou l'origine actuelle si on est côté client.
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Fallback sur la variable d'environnement (Build-time ou SSR)
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL;
  }

  // En dev local, on utilise le port 3001 du serveur unifié
  return "http://localhost:3001";
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
