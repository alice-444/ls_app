export type SupportRequestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export interface SupportMessage {
  id: string;
  requestId: string;
  senderId: string | null;
  content: string;
  isAdmin: boolean;
  createdAt: Date;
  sender?: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

export interface SupportRequestDetailed {
  id: string;
  userId: string | null;
  email: string;
  subject: string;
  description: string;
  problemType: string;
  status: SupportRequestStatus;
  attachments: any;
  createdAt: Date;
  updatedAt: Date;
  messages: SupportMessage[];
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}
