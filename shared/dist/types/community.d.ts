export interface CommunityUserInfo {
  name: string;
  email: string;
}
export type CommunityStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface CommunityBaseProposal {
  id: string;
  status: CommunityStatus;
  proposedBy: CommunityUserInfo | null;
  createdAt?: string | Date;
}
export interface CommunityEvent extends CommunityBaseProposal {
  title: string;
  description: string;
  date: string | Date;
  location: string;
  link?: string | null;
  imageUrl?: string | null;
}
export interface CommunityDeal extends CommunityBaseProposal {
  title: string;
  description: string;
  category: string;
  link: string;
  promoCode?: string | null;
  imageUrl?: string | null;
}
export interface CommunitySpot extends CommunityBaseProposal {
  name: string;
  description: string;
  address: string;
  tags: string[];
  imageUrl?: string | null;
}
export interface CommunityPoll extends CommunityBaseProposal {
  question: string;
  options: any;
}
export type CommunityProposal =
  | CommunityEvent
  | CommunityDeal
  | CommunitySpot
  | CommunityPoll;
