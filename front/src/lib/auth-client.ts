import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "./api-client";

const baseURL = API_BASE_URL;

export const authClient = createAuthClient({
  baseURL,
  basePath: "/api/auth",
});

export const customAuthClient = {
  async signUpEmail(
    email: string,
    password: string,
    name: string,
    username: string
  ) {
    const response = await fetch(`${baseURL}/api/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password, name, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Sign up failed");
    }

    return response.json();
  },
  async selectRole(role: "MENTOR" | "APPRENANT") {
    const response = await fetch(`${baseURL}/api/onboarding/select-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to select role");
    }

    return response.json();
  },
  async uploadPhoto(file: File): Promise<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(`${baseURL}/api/profile/upload-photo`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload photo");
    }

    return response.json();
  },
  async saveProfProfile(data: {
    name: string;
    bio: string;
    domain: string;
    photoUrl?: string | null;
    qualifications?: string | null;
    experience?: string | null;
    socialMediaLinks?: Record<string, string> | null;
    areasOfExpertise?: string[] | null;
    mentorshipTopics?: string[] | null;
    calendlyLink?: string | null;
  }): Promise<{ success: boolean }> {
		const response = await fetch(`${baseURL}/api/profile/role/prof`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save profile");
    }

    return response.json();
  },
  async publishProfile(): Promise<{ success: boolean; publishedAt: string }> {
    const response = await fetch(`${baseURL}/api/profile/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to publish profile");
    }

    return response.json();
  },
  async unpublishProfile(): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${baseURL}/api/profile/publish`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Failed to unpublish profile";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          `Unable to connect to server. Please check that the server is running at ${baseURL}`
        );
      }
      throw error;
    }
  },
  async deleteAccount(reason?: string): Promise<void> {
    try {
      let url = `${baseURL}/api/profile/delete`;
      if (reason) {
        url += `?reason=${encodeURIComponent(reason)}`;
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete account";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return;
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          `Unable to connect to server. Please check that the server is running at database`
        );
      }
      throw error;
    }
  },
};
