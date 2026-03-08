import { Result } from "../../../common/types";

export interface UserDataExport {
  profile: any;
  account: any;
  workshops: {
    asMentor: any[];
    asApprentice: any[];
  };
  workshopRequests: {
    sent: any[];
    received: any[];
  };
  feedbacks: {
    given: any[];
    received: any[];
  };
  conversations: any[];
  messages: any[];
  connections: {
    sent: any[];
    received: any[];
  };
  credits: {
    balance: number;
    transactions: any[];
  };
  notifications: any[];
  moderation: {
    blocks: any[];
    blockedBy: any[];
    reportsMade: any[];
    reportsReceived: any[];
  };
  exportedAt: Date;
}

export interface IExportDataService {
  exportUserData(userId: string): Promise<Result<UserDataExport>>;
}
