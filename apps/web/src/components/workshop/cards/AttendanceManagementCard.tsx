"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, CheckCircle2, Clock, Save } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { LevelUpModal } from "@/components/user/LevelUpModal";

interface AttendanceManagementCardProps {
  workshopId: string;
  isOwner: boolean;
}

export function AttendanceManagementCard({
  workshopId,
  isOwner,
}: AttendanceManagementCardProps) {
  const [attendanceUpdates, setAttendanceUpdates] = useState<
    Record<string, "PENDING" | "PRESENT" | "NO_SHOW">
  >({});
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState<string | null>(null);

  const { data, isLoading, refetch } =
    trpc.workshop.getWorkshopParticipants.useQuery(
      { workshopId },
      {
        enabled: isOwner && !!workshopId,
      }
    );

  const updateAttendanceMutation = trpc.workshop.updateAttendance.useMutation({
    onSuccess: (data) => {
      toast.success("Présence mise à jour");
      refetch();
      setAttendanceUpdates({});

      // Show Level Up modal if title changed
      if (data.titleChanged && "newTitle" in data && data.newTitle) {
        setNewTitle(data.newTitle);
        setLevelUpModalOpen(true);
      }
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const confirmAttendanceMutation = trpc.workshop.confirmAttendance.useMutation(
    {
      onSuccess: () => {
        toast.success("Présence confirmée avec succès");
        refetch();
        setAttendanceUpdates({});
      },
      onError: (error) => {
        toast.error(`Erreur: ${error.message}`);
      },
    }
  );

  if (!isOwner) {
    return null;
  }

  const participants = data?.participants || [];
  const hasParticipants = participants.length > 0;
  const hasUnsavedChanges = Object.keys(attendanceUpdates).length > 0;

  const handleAttendanceChange = (participantId: string, checked: boolean) => {
    setAttendanceUpdates((prev) => ({
      ...prev,
      [participantId]: checked ? "PRESENT" : "PENDING",
    }));
  };

  const handleSave = async () => {
    for (const [participantId, status] of Object.entries(attendanceUpdates)) {
      if (status === "PENDING" || status === "PRESENT") {
        await updateAttendanceMutation.mutateAsync({
          workshopId,
          participantId,
          attendanceStatus: status,
        });
      }
    }
  };

  const handleConfirm = () => {
    confirmAttendanceMutation.mutate({ workshopId });
  };

  const getAttendanceStatus = (participantId: string) => {
    if (attendanceUpdates[participantId]) {
      return attendanceUpdates[participantId];
    }
    const participant = participants.find((p) => p.id === participantId);
    return (
      (participant?.attendanceStatus as "PENDING" | "PRESENT" | "NO_SHOW") ||
      "PENDING"
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestion de la présence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestion de la présence
          </CardTitle>
          <CardDescription>
            Marquez les participants comme présents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasParticipants ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Aucun participant inscrit</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {participants.map((participant) => {
                  const currentStatus = getAttendanceStatus(participant.id);
                  const isPresent = currentStatus === "PRESENT";
                  const isNoShow = currentStatus === "NO_SHOW";
                  const isPending = currentStatus === "PENDING";

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={isPresent}
                          onCheckedChange={(checked) =>
                            handleAttendanceChange(
                              participant.id,
                              checked as boolean
                            )
                          }
                          disabled={
                            updateAttendanceMutation.isPending ||
                            confirmAttendanceMutation.isPending ||
                            isNoShow
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {participant.name || "Participant"}
                            </p>
                            {participant.title && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-4 px-1.5"
                              >
                                {participant.title}
                              </Badge>
                            )}
                          </div>
                          {participant.email && (
                            <p className="text-xs text-muted-foreground">
                              {participant.email}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            isPresent
                              ? "default"
                              : isNoShow
                              ? "destructive"
                              : "secondary"
                          }
                          className="flex items-center gap-1"
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Présent
                            </>
                          ) : isNoShow ? (
                            <>
                              <Clock className="w-3 h-3" />
                              Absent
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              En attente
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasUnsavedChanges && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={
                      updateAttendanceMutation.isPending ||
                      confirmAttendanceMutation.isPending
                    }
                    className="flex-1"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </Button>
                </div>
              )}

              <div className="pt-2 border-t">
                <Button
                  onClick={handleConfirm}
                  disabled={
                    updateAttendanceMutation.isPending ||
                    confirmAttendanceMutation.isPending ||
                    hasUnsavedChanges
                  }
                  className="w-full"
                  variant="default"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmer la présence
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {newTitle && (
        <LevelUpModal
          open={levelUpModalOpen}
          onOpenChange={setLevelUpModalOpen}
          newTitle={newTitle}
        />
      )}
    </>
  );
}
