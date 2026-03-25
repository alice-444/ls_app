"use client";

import { useState } from "react";
import Image from "next/image";
import { redirect, useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  GraduationCap,
  Tag,
  Lock,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

export default function ApprenticeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const {
    data: profile,
    isLoading,
    error,
  } = trpc.apprentice.getApprenticeProfileForViewer.useQuery(
    { apprenticeUserId: userId },
    {
      enabled: !!userId && !!session,
    }
  );

  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const { data: connectionStatus } =
    trpc.connection.checkConnectionStatus.useQuery(
      { otherUserId: userId },
      {
        enabled: !!userId && !!session && userId !== session?.user?.id,
      }
    );

  const sendConnectionRequestMutation =
    trpc.connection.sendConnectionRequest.useMutation({
      onSuccess: () => {
        toast.success("Demande d'invitation envoyée");
      },
      onError: (error: { message?: string }) => {
        toast.error("Erreur lors de l'envoi", {
          description: error.message,
        });
      },
    });

  const removeConnectionMutation = trpc.connection.removeConnection.useMutation(
    {
      onSuccess: () => {
        toast.success("Connexion supprimée");
        router.refresh();
      },
      onError: (error: { message?: string }) => {
        toast.error("Erreur lors de la suppression", {
          description: error.message,
        });
      },
    }
  );

  if (!isSessionPending && !session) redirect("/login");

  const handleSendConnectionRequest = async () => {
    if (!userId) return;
    setIsSendingRequest(true);
    try {
      await sendConnectionRequestMutation.mutateAsync({
        receiverUserId: userId,
      });
    } finally {
      setIsSendingRequest(false);
    }
  };

  if (isSessionPending || isLoading) {
    return <Loader fullScreen size="lg" />;
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>
              {error.message || "Impossible de charger le profil"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profil introuvable</CardTitle>
            <CardDescription>
              Ce profil n'existe pas ou n'est plus disponible.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const hasFullAccess = profile.hasFullAccess;
  const displayName = profile.displayName || "Apprenti";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Profil Apprenti</CardTitle>
                <CardDescription>
                  {hasFullAccess
                    ? "Profil complet"
                    : "Profil privé - Accès restreint"}
                </CardDescription>
              </div>
              {!hasFullAccess && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-5 w-5" />
                  <span className="text-sm">Privé</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                {hasFullAccess && profile.photoUrl ? (
                  <Image
                    src={profile.photoUrl}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-300 dark:border-gray-600 relative overflow-hidden">
                    {!hasFullAccess && (
                      <div className="absolute inset-0 bg-black/20 blur-sm" />
                    )}
                    <User className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  {hasFullAccess && (
                    <>
                      {profile.studyDomain && (
                        <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
                          <GraduationCap className="h-4 w-4" />
                          <span>{profile.studyDomain}</span>
                        </div>
                      )}
                      {profile.studyProgram && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-500 ml-6">
                          <span>{profile.studyProgram}</span>
                        </div>
                      )}
                    </>
                  )}
                  {!hasFullAccess && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Profil privé
                    </div>
                  )}
                </div>
              </div>

              {hasFullAccess && (
                <>
                  {(profile.studyDomain || profile.studyProgram) && (
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Formation
                      </h3>
                      <div className="space-y-2">
                        {profile.studyDomain && (
                          <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Domaine :</span>{" "}
                            {profile.studyDomain}
                          </p>
                        )}
                        {profile.studyProgram && (
                          <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Cursus :</span>{" "}
                            {profile.studyProgram}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {profile.iceBreakerTags &&
                    profile.iceBreakerTags.length > 0 && (
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Tag className="h-5 w-5" />
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.iceBreakerTags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {hasFullAccess &&
                    connectionStatus?.status === "ACCEPTED" &&
                    userId !== session?.user?.id && (
                      <div className="pt-4 border-t">
                        <Button
                          onClick={() => {
                            if (userId) {
                              removeConnectionMutation.mutate({
                                otherUserId: userId,
                              });
                            }
                          }}
                          disabled={removeConnectionMutation.isPending}
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          {removeConnectionMutation.isPending
                            ? "Suppression..."
                            : "Supprimer la connexion"}
                        </Button>
                      </div>
                    )}
                </>
              )}

              {!hasFullAccess && (
                <div className="pt-4 border-t">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ce profil est privé.
                    </p>
                    {connectionStatus?.status !== "ACCEPTED" &&
                      connectionStatus?.status !== "PENDING" && (
                        <Button
                          onClick={handleSendConnectionRequest}
                          disabled={
                            isSendingRequest ||
                            sendConnectionRequestMutation.isPending
                          }
                          className="w-full sm:w-auto"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          {isSendingRequest ||
                            sendConnectionRequestMutation.isPending
                            ? "Envoi..."
                            : "Envoyer une demande"}
                        </Button>
                      )}
                    {connectionStatus?.status === "PENDING" && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Demande d'invitation en attente
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
