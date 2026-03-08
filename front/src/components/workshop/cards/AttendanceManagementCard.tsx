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
import type { WorkshopParticipant } from "@/types/workshop";
import type { AttendanceManagementCardProps } from "@/types/workshop-components";

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
    onSuccess: (data: { titleChanged?: boolean; newTitle?: string }) => {
      toast.success("Présence mise à jour");
      refetch();
      setAttendanceUpdates({});

      // Show Level Up modal if title changed
      if (data.titleChanged && data.newTitle) {
        setNewTitle(data.newTitle);
        setLevelUpModalOpen(true);
      }
    },
    onError: (error: { message?: string }) => {
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    },
  });

  const confirmAttendanceMutation = trpc.workshop.confirmAttendance.useMutation(
    {
      onSuccess: () => {
        toast.success("Présence confirmée avec succès");
        refetch();
        setAttendanceUpdates({});
      },
      onError: (error: { message?: string }) => {
        toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
      },
    }
  );

  if (!isOwner) {
    return null;
  }

  const participants = data?.participants || [];
  const hasParticipants = participants.length > 0;
  const hasUnsavedChanges = Object.keys(attendanceUpdates).length > 0;

  const handleAttendanceChange = (participantId: string, status: "PRESENT" | "NO_SHOW" | "PENDING") => {
    setAttendanceUpdates((prev) => ({
      ...prev,
      [participantId]: status,
    }));
  };

  const handleSave = async () => {
    for (const [participantId, status] of Object.entries(attendanceUpdates)) {
      await updateAttendanceMutation.mutateAsync({
        workshopId,
        participantId,
        attendanceStatus: status,
      });
    }
  };

  const handleConfirm = () => {
    confirmAttendanceMutation.mutate({ workshopId });
  };

  const getAttendanceStatus = (participantId: string) => {
    if (attendanceUpdates[participantId]) {
      return attendanceUpdates[participantId];
    }
    const participant = participants.find((p: WorkshopParticipant) => p.id === participantId);
    return (
      (participant?.attendanceStatus as "PENDING" | "PRESENT" | "NO_SHOW") ||
      "PENDING"
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ls-heading">
            <Users className="w-5 h-5" />
            Gestion de la présence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ls-muted">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ls-heading">
            <Users className="w-5 h-5" />
            Gestion de la présence
          </CardTitle>
          <CardDescription className="text-ls-muted">
            Marque si l&apos;apprenant était présent ou absent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasParticipants ? (
            <div className="text-center py-8 text-ls-muted">
              <Users className="w-12 h-12 mx-auto mb-3 text-ls-muted/50" />
              <p>Aucun participant inscrit</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {participants.map((participant: WorkshopParticipant) => {
                  const currentStatus = getAttendanceStatus(participant.id);
                  const isPresent = currentStatus === "PRESENT";
                  const isNoShow = currentStatus === "NO_SHOW";
                  const isPending = currentStatus === "PENDING";

                  return (
                    <div
                      key={participant.id}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 border border-border/50 rounded-2xl bg-card/80 gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-ls-heading">
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
                            <p className="text-xs text-ls-muted">
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
                          className="flex items-center gap-1 shrink-0"
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

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={isPresent ? "default" : "outline"}
                          size="sm"
                          className={`flex-1 sm:flex-none rounded-full h-8 text-xs font-semibold ${
                            isPresent ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0" : "text-[#26547c] border-[#26547c]/20"
                          }`}
                          onClick={() => handleAttendanceChange(participant.id, isPresent ? "PENDING" : "PRESENT")}
                          disabled={updateAttendanceMutation.isPending}
                        >
                          Présent
                        </Button>
                        <Button
                          type="button"
                          variant={isNoShow ? "destructive" : "outline"}
                          size="sm"
                          className={`flex-1 sm:flex-none rounded-full h-8 text-xs font-semibold ${
                            isNoShow ? "bg-red-600 hover:bg-red-700 text-white border-0" : "text-red-600 border-red-200"
                          }`}
                          onClick={() => handleAttendanceChange(participant.id, isNoShow ? "PENDING" : "NO_SHOW")}
                          disabled={updateAttendanceMutation.isPending}
                        >
                          Absent
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasUnsavedChanges && (
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="cta"
                    size="ctaSm"
                    onClick={handleSave}
                    disabled={
                      updateAttendanceMutation.isPending ||
                      confirmAttendanceMutation.isPending
                    }
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </Button>
                </div>
              )}

                <div className="pt-2 border-t border-border/50">
                <Button
                  variant="cta"
                  size="cta"
                  onClick={handleConfirm}
                  disabled={
                    updateAttendanceMutation.isPending ||
                    confirmAttendanceMutation.isPending ||
                    hasUnsavedChanges
                  }
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Valider et clôturer l'atelier
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
