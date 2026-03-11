import type { IDailyService } from "./daily.service.interface";
import type { DailyConfig } from "../config/daily.config.interface";
import type { Result } from "../../common";
import { success, failure } from "../../common/types";
import { externalApiErrorsTotal } from "../../metrics/prometheus";

export class DailyService implements IDailyService {
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;
  private readonly domain: string;

  constructor(config: DailyConfig) {
    if (!config.apiKey) {
      throw new Error("Daily API key is required");
    }
    this.apiKey = config.apiKey;
    this.apiBaseUrl = config.apiBaseUrl;
    this.domain = config.domain;

    if (!this.domain) {
      console.warn(
        "DAILY_DOMAIN n'est pas configuré. Les URLs des rooms seront générées automatiquement par Daily.co."
      );
    }
  }

  private async apiRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      externalApiErrorsTotal.labels("daily").inc();
      const error = await response.json().catch(() => ({}));
      const message = error.error || response.statusText;
      const dailyError = new Error(message);
      (dailyError as any).status = response.status;
      throw dailyError;
    }

    return response.json();
  }

  async getOrCreateRoomForWorkshop(
    workshopId: string,
    workshopTitle: string
  ): Promise<Result<{ roomId: string; roomUrl: string }>> {
    try {
      const roomName = `workshop-${workshopId}`;

      let room;
      try {
        room = await this.apiRequest(`/rooms/${roomName}`);
      } catch (error: any) {
        if (error?.status === 404) {
          room = await this.apiRequest("/rooms", {
            method: "POST",
            body: JSON.stringify({
              name: roomName,
              privacy: "private",
              properties: {
                enable_chat: true,
                enable_screenshare: true,
                enable_recording: false,
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                max_participants: 20,
              },
            }),
          });
        } else {
          throw error;
        }
      }

      if (!room?.id || !room?.url) {
        return failure("Failed to create or retrieve Daily.co room");
      }

      return success({
        roomId: room.id,
        roomUrl: room.url,
      });
    } catch (error: any) {
      console.error("Error in getOrCreateRoomForWorkshop:", error);
      return failure(
        error?.message || "Failed to create Daily.co room",
        error?.status || 500
      );
    }
  }

  async generateToken(
    roomId: string,
    userId: string,
    userName: string,
    isOwner: boolean
  ): Promise<Result<{ token: string; roomUrl: string }>> {
    try {
      const room = await this.apiRequest(`/rooms/${roomId}`);
      if (!room?.url) {
        return failure("Room not found");
      }

      const tokenResponse = await this.apiRequest("/meeting-tokens", {
        method: "POST",
        body: JSON.stringify({
          properties: {
            room_name: room.name,
            user_id: userId,
            user_name: userName,
            is_owner: isOwner,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
          },
        }),
      });

      if (!tokenResponse || !tokenResponse.token) {
        return failure("Failed to generate Daily.co token");
      }

      return success({
        token: tokenResponse.token,
        roomUrl: room.url,
      });
    } catch (error: any) {
      console.error("Error in generateToken:", error);
      return failure(
        error?.message || "Failed to generate Daily.co token",
        error?.status || 500
      );
    }
  }

  async deleteRoom(roomId: string): Promise<Result<{ success: boolean }>> {
    try {
      await this.apiRequest(`/rooms/${roomId}`, {
        method: "DELETE",
      });
      return success({ success: true });
    } catch (error: any) {
      console.error("Error in deleteRoom:", error);
      if (error?.status === 404) {
        return success({ success: true });
      }
      return failure(
        error?.message || "Failed to delete Daily.co room",
        error?.status || 500
      );
    }
  }

  async getRoomInfo(
    roomId: string
  ): Promise<Result<{ participantCount: number }>> {
    try {
      const room = await this.apiRequest(`/rooms/${roomId}`);
      if (!room) {
        return failure("Room not found");
      }

      const participants = await this.apiRequest(
        `/rooms/${roomId}/participants`
      ).catch(() => ({ data: [] }));

      const participantCount = participants?.data?.length || 0;

      return success({ participantCount });
    } catch (error: any) {
      console.error("Error in getRoomInfo:", error);
      if (error?.status === 404) {
        return success({ participantCount: 0 });
      }
      return failure(
        error?.message || "Failed to get room info",
        error?.status || 500
      );
    }
  }
}
