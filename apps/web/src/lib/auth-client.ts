import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
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
  async selectRole(role: "PROF" | "APPRENANT") {
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
};
