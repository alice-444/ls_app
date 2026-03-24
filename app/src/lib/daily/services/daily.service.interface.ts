import type { Result } from "../../common";
import type { DailyRoomAccessWindow } from "../../workshops/utils/workshop-helpers";

export interface IDailyService {
  getOrCreateRoomForWorkshop(
    workshopId: string,
    workshopTitle: string,
    accessWindow: DailyRoomAccessWindow,
  ): Promise<Result<{ roomId: string; roomUrl: string }>>;

  generateToken(
    roomId: string,
    userId: string,
    userName: string,
    isOwner: boolean,
  ): Promise<Result<{ token: string; roomUrl: string }>>;

  deleteRoom(roomId: string): Promise<Result<{ success: boolean }>>;

  getRoomInfo(roomId: string): Promise<Result<{ participantCount: number }>>;
}
