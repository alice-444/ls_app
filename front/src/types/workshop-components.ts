import type { View } from "react-big-calendar";
import DailyIframe from "@daily-co/daily-js";
import type { WorkshopBase, WorkshopDetailed, WorkshopRequest } from "./workshop";

// ============================================================================
// Daily Video Call Types
// ============================================================================

export interface DailyVideoCallProps {
  workshopId: string;
  onLeave?: () => void;
}

export type DailyCallFrame = ReturnType<typeof DailyIframe.createFrame>;

// ============================================================================
// Calendar Types
// ============================================================================

export interface WorkshopCalendarProps {
  readonly workshops: readonly WorkshopDetailed[];
  readonly height?: string;
  readonly onSelectEvent: (workshop: WorkshopDetailed) => void;
  readonly showOnlyConfirmed?: boolean;
  readonly userRole?: "MENTOR" | "APPRENANT";
  readonly controlledDate?: Date;
  readonly controlledView?: View;
  readonly onDateChange?: (date: Date) => void;
  readonly onViewChange?: (view: View) => void;
}

// ============================================================================
// Mentor Types
// ============================================================================

export interface MentorBasic {
  id: string;
  name: string | null;
  displayName: string | null;
  bio: string | null;
  domain: string | null;
  photoUrl: string | null;
  areasOfExpertise: string[] | null;
  mentorshipTopics: string[] | null;
  workshopsCount?: number;
}

export interface MentorCardProps {
  mentor: MentorBasic;
  onViewProfile?: (mentorId: string) => void;
  className?: string;
}

// ============================================================================
// Card Types
// ============================================================================

export interface AttendanceManagementCardProps {
  workshopId: string;
  isOwner: boolean;
}

export interface WorkshopCardProps {
  workshop: WorkshopDetailed;
  variant?: "default" | "hero" | "past" | "catalogue";
  onViewDetails?: (workshopId: string) => void;
  onViewParticipants?: (workshopId: string) => void;
  onEdit?: (workshopId: string) => void;
  onReschedule?: (workshopId: string) => void;
  onDelete?: (workshopId: string) => void;
  onDuplicate?: (workshopId: string) => void;
  onComplete?: (workshopId: string) => void;
  onRequestParticipation?: (workshop: WorkshopDetailed) => void;
  showDropdown?: boolean;
  className?: string;
}

// ============================================================================
// Dialog Types
// ============================================================================

export interface TippingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorUserId: string;
  onSuccess?: () => void;
}

export interface SubmitFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshopId: string;
  onSuccess?: () => void;
}

export interface ReportFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedbackId: string;
  onSuccess?: () => void;
}

export interface EditWorkshopRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    id: string;
    title: string;
    description?: string | null;
    message?: string | null;
    preferredDate?: Date | string | null;
    preferredTime?: string | null;
    mentorId: string;
    mentor?: {
      user?: {
        name: string | null;
      };
    };
  };
  onSuccess?: () => void;
}

// ============================================================================
// Button Types
// ============================================================================

export interface JoinVideoButtonProps {
  workshop: {
    id: string;
    date: Date | string | null;
    time: string | null;
    isVirtual: boolean;
    dailyRoomId: string | null;
  };
}

// ============================================================================
// List Types
// ============================================================================

export interface WorkshopListItemProps {
  workshop: WorkshopBase & {
    apprenticeId?: string | null;
  };
  expandedWorkshopId: string | null;
  onExpand: (id: string | null) => void;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
  onAcceptRequest: (request: WorkshopRequest) => void;
  onRejectRequest: (requestId: string) => void;
  isPublishing: boolean;
  isUnpublishing: boolean;
  isDeleting: boolean;
  isRejecting: boolean;
}

// ============================================================================
// Request Types
// ============================================================================

export interface WorkshopRequestCardProps {
  request: WorkshopRequest;
  onAccept?: (request: WorkshopRequest) => void;
  onReject?: (requestId: string) => void;
  isRejecting?: boolean;
  variant?: "default" | "compact" | "dashboard";
  showTitle?: boolean;
  showDescription?: boolean;
  showPreferredDate?: boolean;
  showMentor?: boolean;
}

export interface WorkshopRequestsProps {
  workshopId: string;
  workshopStatus: string;
  expandedWorkshopId: string | null;
  setExpandedWorkshopId: (id: string | null) => void;
  onAcceptRequest: (request: WorkshopRequest) => void;
  onRejectRequest: (requestId: string) => void;
  isRejecting: boolean;
}

// ============================================================================
// Filter Types
// ============================================================================

export type SortField = "date" | "title" | "status" | "createdAt";
export type SortOrder = "asc" | "desc";
export type StatusFilter =
  | "all"
  | "DRAFT"
  | "PUBLISHED"
  | "CANCELLED"
  | "COMPLETED";

export interface WorkshopFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
}
