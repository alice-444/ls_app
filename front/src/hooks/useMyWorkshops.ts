"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import {
  formatCalendarMonthYear,
  createNavigateCalendar,
} from "@/lib/dashboard-utils";
import { toast } from "sonner";
import {
  calculateCountdown,
  calculateEndTime,
} from "@/lib/workshop-utils";

type SortField = "date" | "title" | "status" | "createdAt";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type { SortField, SortOrder, StatusFilter };

export function useMyWorkshops() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const {
    data: workshops,
    isLoading,
    refetch,
    error: workshopsError,
  } = trpc.workshop.getMyWorkshops.useQuery(undefined, {
    enabled: !!session && userRole === "MENTOR",
    retry: false,
  } as Record<string, unknown>);

  const { data: mentorRequests } =
    trpc.mentor.getReceivedRequests.useQuery(undefined, {
      enabled: !!session,
    } as Record<string, unknown>);

  const pendingRequestsCount =
    mentorRequests?.filter(
      (r: { status: string }) => r.status === "PENDING"
    ).length || 0;

  const deleteMutation = trpc.workshop.delete.useMutation();
  const publishMutation = trpc.workshop.publish.useMutation();
  const unpublishMutation = trpc.workshop.unpublish.useMutation();
  const confirmAttendanceMutation =
    trpc.workshopAttendance.confirmAttendance.useMutation();

  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<{
    id: string;
    title: string;
    preferredDate?: Date | string | null;
    preferredTime?: string | null;
  } | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [expandedWorkshopId, setExpandedWorkshopId] = useState<string | null>(
    null
  );

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<
    "month" | "week" | "day" | "agenda"
  >("month");

  const navigateCalendar = createNavigateCalendar(
    calendarDate,
    calendarView,
    setCalendarDate
  );

  const utils = trpc.useUtils();
  const rejectRequest = trpc.mentor.rejectRequest.useMutation();

  const handleAcceptRequest = (request: {
    id: string;
    title: string;
    preferredDate?: Date | string | null;
    preferredTime?: string | null;
  }) => {
    setSelectedRequest(request);
    setShowAcceptDialog(true);
  };

  const handleRejectRequest = (requestId: string) => {
    setRequestToReject(requestId);
    setShowRejectDialog(true);
  };

  const confirmRejectRequest = (reason?: string) => {
    if (requestToReject) {
      rejectRequest.mutate(
        { requestId: requestToReject, reason },
        {
          onSuccess: () => {
            toast.success("Demande refusée avec succès");
            utils.mentor.getReceivedRequests.invalidate();
            setShowRejectDialog(false);
            setRequestToReject(null);
          },
          onError: (error: { message: string }) => {
            toast.error(`Erreur: ${error.message}`);
          },
        }
      );
    }
  };

  const filteredAndSortedWorkshops = useMemo(() => {
    if (!workshops) return [];

    let result = [...workshops];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (workshop) =>
          workshop.title.toLowerCase().includes(query) ||
          workshop.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((workshop) => workshop.status === statusFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date": {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          comparison = dateA - dateB;
          break;
        }
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [workshops, searchQuery, statusFilter, sortField, sortOrder]);

  type Workshop = NonNullable<typeof workshops>[number];

  const upcomingWorkshops = useMemo(() => {
    if (!workshops) return [];
    const now = new Date();
    return workshops
      .filter((w: Workshop) => {
        if (w.status !== "PUBLISHED") return false;
        if (!w.date || !w.time) return false;
        const endTime = calculateEndTime(w.date, w.time, w.duration || 60);
        return endTime && endTime > now;
      })
      .sort((a: Workshop, b: Workshop) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });
  }, [workshops]);

  const nextWorkshop = upcomingWorkshops[0] ?? null;

  const [countdown, setCountdown] =
    useState<ReturnType<typeof calculateCountdown>>(null);

  useEffect(() => {
    if (!nextWorkshop?.date || !nextWorkshop?.time) {
      setCountdown(null);
      return;
    }
    const update = () =>
      setCountdown(calculateCountdown(nextWorkshop.date, nextWorkshop.time));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextWorkshop]);

  const handleDelete = (workshopId: string) => {
    deleteMutation.mutate(
      { workshopId },
      {
        onSuccess: () => {
          toast.success("Atelier supprimé avec succès");
          refetch();
          setShowDeleteDialog(null);
        },
        onError: (error: { message: string }) => {
          toast.error(error.message || "Erreur lors de la suppression");
        },
      }
    );
  };

  const handlePublish = (workshopId: string) => {
    publishMutation.mutate(
      { workshopId },
      {
        onSuccess: () => {
          toast.success("Atelier publié avec succès");
          refetch();
        },
        onError: (error: { message: string }) => {
          toast.error(error.message || "Erreur lors de la publication");
        },
      }
    );
  };

  const handleUnpublish = (workshopId: string) => {
    unpublishMutation.mutate(
      { workshopId },
      {
        onSuccess: () => {
          toast.success("Atelier dépublié avec succès");
          refetch();
        },
        onError: (error: { message: string }) => {
          toast.error(error.message || "Erreur lors de la dépublication");
        },
      }
    );
  };

  const handleConfirmComplete = (workshopId: string) => {
    confirmAttendanceMutation.mutate(
      { workshopId },
      {
        onSuccess: () => {
          toast.success("Atelier marqué comme terminé avec succès");
          refetch();
        },
        onError: (error: { message: string }) => {
          toast.error(error.message || "Erreur lors de la validation");
        },
      }
    );
  };

  return {
    router,
    session,
    isSessionLoading,
    userRole,
    isLoadingRole,
    isLoading,
    workshopsError,
    workshops,

    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    filteredAndSortedWorkshops,

    upcomingWorkshops,
    nextWorkshop,
    countdown,
    pendingRequestsCount,

    calendarDate,
    calendarView,
    setCalendarView,
    navigateCalendar,
    formatCalendarMonthYear,
    setCalendarDate,

    showDeleteDialog,
    setShowDeleteDialog,
    selectedRequest,
    setSelectedRequest,
    showAcceptDialog,
    setShowAcceptDialog,
    showRejectDialog,
    setShowRejectDialog,
    expandedWorkshopId,
    setExpandedWorkshopId,

    deleteMutation,
    publishMutation,
    unpublishMutation,
    confirmAttendanceMutation,
    rejectRequest,
    utils,

    handleAcceptRequest,
    handleRejectRequest,
    confirmRejectRequest,
    handleDelete,
    handlePublish,
    handleUnpublish,
    handleConfirmComplete,
  };
}
