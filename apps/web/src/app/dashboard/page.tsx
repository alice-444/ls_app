"use client";
import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, X } from "lucide-react";
import { AcceptWorkshopRequestDialog } from "@/components/mentor/AcceptWorkshopRequestDialog";
import { WorkshopRequestCard } from "@/components/workshop/WorkshopRequestCard";
import { EditWorkshopRequestDialog } from "@/components/workshop/EditWorkshopRequestDialog";
import {
  getWorkshopRequestStatusLabel,
  getWorkshopRequestStatusColor,
} from "@/lib/workshop-request-utils";
import { toast } from "sonner";
import { Edit, Users } from "lucide-react";

type UserRole = "apprenant" | "mentor" | "both";

// Données mockées
const mockUserData = {
  apprenant: {
    ateliersSuivis: 8,
    heuresApprentissage: 45,
    progression: 78,
    coursEnCours: 3,
    demandesAide: 2,
    mentorsSuivis: 4,
    prochainsAteliers: [
      {
        titre: "Mathématiques avancées",
        mentor: "Dr. Martin",
        date: "Demain, 14h",
      },
      {
        titre: "Programmation Python",
        mentor: "Sarah K.",
        date: "Vendredi, 16h",
      },
    ],
    recommandations: [
      {
        titre: "Calcul différentiel",
        niveau: "Intermédiaire",
        mentor: "Prof. Dubois",
      },
      { titre: "Algèbre linéaire", niveau: "Débutant", mentor: "Marie L." },
    ],
  },
  mentor: {
    ateliersDonnes: 12,
    heuresMentorat: 36,
    etudiantsAides: 8,
    noteMoyenne: 4.8,
    demandesEnAttente: 3,
    creditsGagnes: 240,
    prochainsAteliers: [
      {
        titre: "Aide en physique",
        etudiant: "Thomas R.",
        date: "Demain, 15h",
        statut: "confirmé",
      },
      {
        titre: "Révision maths",
        etudiant: "Emma S.",
        date: "Jeudi, 17h",
        statut: "confirmé",
      },
      {
        titre: "Introduction Python",
        etudiant: "Lucas M.",
        date: "Vendredi, 14h",
        statut: "à préparer",
      },
      {
        titre: "Calcul différentiel",
        etudiant: "Sophie K.",
        date: "Lundi, 16h",
        statut: "à préparer",
      },
    ],
    ateliersAPreparer: [
      {
        titre: "Introduction Python",
        etudiant: "Lucas M.",
        date: "Vendredi, 14h",
        matiere: "Informatique",
        niveau: "Débutant",
      },
      {
        titre: "Calcul différentiel",
        etudiant: "Sophie K.",
        date: "Lundi, 16h",
        matiere: "Mathématiques",
        niveau: "Avancé",
      },
      {
        titre: "Mécanique quantique",
        etudiant: "Alex R.",
        date: "Mardi, 15h",
        matiere: "Physique",
        niveau: "Intermédiaire",
      },
    ],
    statistiques: {
      matieres: ["Mathématiques", "Physique", "Informatique"],
      heuresParSemaine: 8,
      disponibilite: "Lun-Ven, 14h-20h",
    },
  },
};

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const [userRole, setUserRole] = useState<UserRole>("both");

  const { data: workshopRequests, refetch: refetchApprenticeRequests } =
    trpc.mentor.getMyWorkshopRequests.useQuery(undefined, {
      enabled: !!session && userRole === "apprenant",
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    });

  const [previousApprenticeRequests, setPreviousApprenticeRequests] = useState<
    any[] | null
  >(null);

  useEffect(() => {
    if (workshopRequests && previousApprenticeRequests) {
      workshopRequests.forEach((currentRequest: any) => {
        const previousRequest = previousApprenticeRequests.find(
          (r: any) => r.id === currentRequest.id
        );

        if (previousRequest) {
          if (
            previousRequest.status === "PENDING" &&
            currentRequest.status === "ACCEPTED"
          ) {
            toast.success(
              `Votre demande "${currentRequest.title}" a été acceptée !`,
              {
                description:
                  "L'atelier a été programmé. Consultez vos ateliers confirmés.",
                duration: 6000,
              }
            );
          }

          if (
            previousRequest.status === "PENDING" &&
            currentRequest.status === "REJECTED"
          ) {
            toast.error(
              `Votre demande "${currentRequest.title}" a été refusée`,
              {
                description:
                  "Vous pouvez modifier et renvoyer votre demande ou choisir un autre mentor.",
                duration: 8000,
              }
            );
          }
        }
      });
    }

    if (workshopRequests) {
      setPreviousApprenticeRequests([...workshopRequests]);
    }
  }, [workshopRequests, previousApprenticeRequests]);

  const { data: mentorWorkshopRequests, refetch: refetchMentorRequests } =
    trpc.mentor.getMentorWorkshopRequests.useQuery(undefined, {
      enabled: !!session && (userRole === "mentor" || userRole === "both"),
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    });

  const [previousRequestCount, setPreviousRequestCount] = useState<number>(0);
  const [previousPendingCount, setPreviousPendingCount] = useState<number>(0);

  useEffect(() => {
    if (mentorWorkshopRequests) {
      const currentCount = mentorWorkshopRequests.length;
      const currentPendingCount = mentorWorkshopRequests.filter(
        (r: any) => r.status === "PENDING"
      ).length;

      if (previousRequestCount > 0 && currentCount > previousRequestCount) {
        const newRequests = currentCount - previousRequestCount;
        toast.success(
          `${newRequests} nouvelle${newRequests > 1 ? "s" : ""} demande${
            newRequests > 1 ? "s" : ""
          } d'atelier reçue${newRequests > 1 ? "s" : ""}`,
          {
            duration: 5000,
          }
        );
      }

      if (
        previousPendingCount > 0 &&
        currentPendingCount !== previousPendingCount
      ) {
        if (currentPendingCount > previousPendingCount) {
          toast.info(
            `${currentPendingCount - previousPendingCount} nouvelle${
              currentPendingCount - previousPendingCount > 1 ? "s" : ""
            } demande${
              currentPendingCount - previousPendingCount > 1 ? "s" : ""
            } en attente`,
            {
              duration: 4000,
            }
          );
        }
      }

      setPreviousRequestCount(currentCount);
      setPreviousPendingCount(currentPendingCount);
    }
  }, [mentorWorkshopRequests, previousRequestCount, previousPendingCount]);

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [selectedEditRequest, setSelectedEditRequest] = useState<any | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);

  const utils = trpc.useUtils();
  const rejectRequest = trpc.mentor.rejectWorkshopRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande refusée avec succès");
      utils.mentor.getMentorWorkshopRequests.invalidate();
      refetchMentorRequests();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleAcceptRequest = (request: any) => {
    setSelectedRequest(request);
    setSelectedRequestId(request.id);
    setShowAcceptDialog(true);
  };

  const handleRejectRequest = (requestId: string) => {
    if (confirm("Êtes-vous sûr de vouloir refuser cette demande ?")) {
      rejectRequest.mutate({ requestId });
    }
  };

  // const privateData = useQuery(trpc.privateData.queryOptions());

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
  }, [session, isPending]);

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderSocialNetworkSection = () => (
    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Réseaux sociaux
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="text-center mb-3">
          <div className="text-xl font-bold mb-1">
            {userRole === "mentor"
              ? mockUserData.mentor.demandesEnAttente
              : mockUserData.apprenant.demandesAide}
          </div>
          <p className="text-xs text-indigo-100">Demandes en attente</p>
        </div>
        <div className="space-y-2">
          <div className="bg-white/20 rounded p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Demande de Marie L.</p>
                <p className="text-xs text-indigo-100">
                  Mathématiques • Il y a 2h
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" className="text-xs px-2">
                  ✓
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 text-red-300 hover:text-red-100"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-white/20 rounded p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Demande de Thomas R.</p>
                <p className="text-xs text-indigo-100">
                  Programmation • Il y a 4h
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" className="text-xs px-2">
                  ✓
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 text-red-300 hover:text-red-100"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-white/20 rounded p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Demande de Sophie M.</p>
                <p className="text-xs text-indigo-100">
                  Littérature • Il y a 6h
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" className="text-xs px-2">
                  ✓
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 text-red-300 hover:text-red-100"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1 text-xs" variant="outline" size="sm">
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nouvelle demande
          </Button>
          <Button
            className="flex-1 text-xs"
            variant="outline"
            size="sm"
            onClick={() => router.push("/relationship")}
          >
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Relationships
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderApprenantDashboard = () => (
    <>
      <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            Bienvenue dans votre parcours d'apprentissage
          </CardTitle>
          <CardDescription className="text-green-100">
            Continuez votre progression avec l'aide de nos mentors expérimentés
          </CardDescription>
        </CardHeader>
      </Card>

      {/* ateliers passés */}
      <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Ateliers passés
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {mockUserData.apprenant.coursEnCours}
            </div>
            <p className="text-xs text-blue-100 mb-2">Ateliers passés</p>
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Voir les ateliers
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Mes mentors
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {mockUserData.apprenant.mentorsSuivis}
            </div>
            <p className="text-xs text-purple-100 mb-2">Mentors suivis</p>
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Voir les mentors
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Mes demandes d'atelier
              {workshopRequests && workshopRequests.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {workshopRequests.length}
                </Badge>
              )}
            </div>
            {workshopRequests &&
              workshopRequests.filter((r: any) => r.status === "PENDING")
                .length > 0 && (
                <Badge
                  variant="default"
                  className="bg-yellow-500 text-white animate-pulse"
                >
                  {
                    workshopRequests.filter((r: any) => r.status === "PENDING")
                      .length
                  }{" "}
                  en attente
                </Badge>
              )}
          </CardTitle>
          <CardDescription>
            Vos demandes d'atelier envoyées aux mentors
            {workshopRequests &&
              workshopRequests.filter((r: any) => r.status === "PENDING")
                .length > 0 && (
                <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">
                  • Mise à jour automatique toutes les 10 secondes
                </span>
              )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {workshopRequests && workshopRequests.length > 0 ? (
            workshopRequests.map((request: any) => {
              const isRejected = request.status === "REJECTED";
              return (
                <div key={request.id} className="space-y-2">
                  <WorkshopRequestCard
                    request={request}
                    variant="dashboard"
                    showTitle={true}
                    showDescription={true}
                    showMentor={true}
                  />
                  {isRejected && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEditRequest(request);
                          setShowEditDialog(true);
                        }}
                        className="text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Éditer et renvoyer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          router.push("/workshop-room");
                        }}
                        className="text-xs"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Créer une nouvelle demande
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Aucune demande d'atelier pour le moment</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/workshop-room")}
              >
                Parcourir les mentors
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEditRequest && (
        <EditWorkshopRequestDialog
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) {
              setSelectedEditRequest(null);
              refetchApprenticeRequests();
            }
          }}
          request={selectedEditRequest}
          onSuccess={() => {
            refetchApprenticeRequests();
            utils.mentor.getMyWorkshopRequests.invalidate();
          }}
        />
      )}

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Prochains ateliers
          </CardTitle>
          <CardDescription>
            Vos ateliers programmés avec vos mentors
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {mockUserData.apprenant.prochainsAteliers.map((atelier, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-sm">{atelier.titre}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Mentor: {atelier.mentor}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {atelier.date}
                </Badge>
                <Button size="sm" className="text-xs">
                  Rejoindre
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Annuler
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {renderSocialNetworkSection()}
    </>
  );

  const renderMentorDashboard = () => (
    <>
      <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            Bienvenue dans votre espace mentor
          </CardTitle>
          <p>
            Continuez votre progression avec l'aide de nos mentors expérimentés
            !
          </p>
          <CardDescription className="text-blue-100">
            Prenez soin de vos étudiants et gérez vos ateliers
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Progression globale</p>
              <p className="text-sm text-blue-100">4.8/5.0 moyenne des notes</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-sm font-medium">Ateliers donnés</span>
              </div>
              <p className="text-xs text-blue-100">
                {mockUserData.mentor.ateliersDonnes}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Étudiants aidés</span>
              </div>
              <p className="text-xs text-blue-100">
                {mockUserData.mentor.etudiantsAides}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            Crédits gagnés
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              {mockUserData.mentor.creditsGagnes}
            </div>
            <p className="text-xs text-yellow-100 mb-2">Crédits disponibles</p>
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Utiliser mes crédits
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Demandes d'atelier reçues
              {mentorWorkshopRequests && mentorWorkshopRequests.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {mentorWorkshopRequests.length}
                </Badge>
              )}
            </div>
            {mentorWorkshopRequests &&
              mentorWorkshopRequests.filter((r: any) => r.status === "PENDING")
                .length > 0 && (
                <Badge
                  variant="default"
                  className="bg-yellow-500 text-white animate-pulse"
                >
                  {
                    mentorWorkshopRequests.filter(
                      (r: any) => r.status === "PENDING"
                    ).length
                  }{" "}
                  en attente
                </Badge>
              )}
          </CardTitle>
          <CardDescription>
            Les demandes d'atelier que vous avez reçues de la part des apprentis
            {mentorWorkshopRequests &&
              mentorWorkshopRequests.filter((r: any) => r.status === "PENDING")
                .length > 0 && (
                <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">
                  • Mise à jour automatique toutes les 10 secondes
                </span>
              )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {mentorWorkshopRequests && mentorWorkshopRequests.length > 0 ? (
            mentorWorkshopRequests.map((request: any) => (
              <WorkshopRequestCard
                key={request.id}
                request={request}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                isRejecting={rejectRequest.isPending}
                variant="dashboard"
                showTitle={true}
                showDescription={true}
                showPreferredDate={true}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune demande d'atelier reçue</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Ateliers à préparer
          </CardTitle>
          <CardDescription>
            Vos prochains ateliers nécessitant une préparation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {mockUserData.mentor.ateliersAPreparer.map((atelier, index) => {
            const isPrepared = index === 0;
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                  isPrepared
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex-1">
                  <h4
                    className={`font-medium text-sm ${
                      isPrepared ? "text-green-700 dark:text-green-300" : ""
                    }`}
                  >
                    {atelier.titre}
                  </h4>
                  <p
                    className={`text-xs ${
                      isPrepared
                        ? "text-green-600 dark:text-green-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {atelier.etudiant} • {atelier.matiere} • {atelier.niveau}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isPrepared ? "default" : "secondary"}
                    className={`text-xs ${isPrepared ? "bg-green-600" : ""}`}
                  >
                    {atelier.date}
                  </Badge>
                  <Button
                    size="sm"
                    className={`text-xs ${
                      isPrepared ? "bg-green-600 hover:bg-green-700" : ""
                    }`}
                  >
                    {isPrepared ? (
                      <>
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Préparé
                      </>
                    ) : (
                      "Préparer"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`text-xs ${
                      isPrepared
                        ? "text-slate-400 border-slate-300"
                        : "text-red-600 hover:text-red-700"
                    }`}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {renderSocialNetworkSection()}

      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Mes statistiques
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="text-sm font-medium">Heures de mentorat</span>
              </div>
              <p className="text-xs text-green-100">
                {mockUserData.mentor.heuresMentorat}h
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="text-sm font-medium">Notes moyennes</span>
              </div>
              <p className="text-xs text-green-100">
                {mockUserData.mentor.noteMoyenne}/5.0
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Étudiants aidés</span>
              </div>
              <p className="text-xs text-green-100">
                {mockUserData.mentor.etudiantsAides}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="text-sm font-medium">Disponibilité</span>
              </div>
              <p className="text-xs text-green-100">
                {mockUserData.mentor.statistiques.disponibilite}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Demandes d'atelier reçues
              {mentorWorkshopRequests && mentorWorkshopRequests.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {mentorWorkshopRequests.length}
                </Badge>
              )}
            </div>
            {mentorWorkshopRequests &&
              mentorWorkshopRequests.filter((r: any) => r.status === "PENDING")
                .length > 0 && (
                <Badge
                  variant="default"
                  className="bg-yellow-500 text-white animate-pulse"
                >
                  {
                    mentorWorkshopRequests.filter(
                      (r: any) => r.status === "PENDING"
                    ).length
                  }{" "}
                  en attente
                </Badge>
              )}
          </CardTitle>
          <CardDescription>
            Les demandes d'atelier que vous avez reçues de la part des apprentis
            {mentorWorkshopRequests &&
              mentorWorkshopRequests.filter((r: any) => r.status === "PENDING")
                .length > 0 && (
                <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">
                  • Mise à jour automatique toutes les 10 secondes
                </span>
              )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {mentorWorkshopRequests && mentorWorkshopRequests.length > 0 ? (
            mentorWorkshopRequests.map((request: any) => (
              <WorkshopRequestCard
                key={request.id}
                request={request}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                isRejecting={rejectRequest.isPending}
                variant="dashboard"
                showTitle={true}
                showDescription={true}
                showPreferredDate={true}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune demande d'atelier reçue</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRequest && (
        <AcceptWorkshopRequestDialog
          open={showAcceptDialog}
          onOpenChange={(open) => {
            setShowAcceptDialog(open);
            if (!open) {
              setSelectedRequest(null);
              setSelectedRequestId(null);
              utils.mentor.getMentorWorkshopRequests.invalidate();
              refetchMentorRequests();
            }
          }}
          requestId={selectedRequest.id}
          requestTitle={selectedRequest.title}
          preferredDate={
            selectedRequest.preferredDate
              ? new Date(selectedRequest.preferredDate)
              : null
          }
          preferredTime={selectedRequest.preferredTime}
          onSuccess={() => {
            refetchMentorRequests();
            toast.success("Demande acceptée avec succès !");
          }}
        />
      )}
    </>
  );

  const renderBothDashboard = () => (
    <>
      <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            Bienvenue dans votre espace d'entraide
          </CardTitle>
          <CardDescription className="text-indigo-100">
            Vous êtes à la fois mentor et apprenant - partagez et apprenez !
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Progression globale</p>
              <p className="text-sm text-indigo-100">78% de progression</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-sm font-medium">Ateliers suivis</span>
              </div>
              <p className="text-xs text-indigo-100">
                {mockUserData.apprenant.ateliersSuivis}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Heures d'apprentissage
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                {mockUserData.apprenant.heuresApprentissage}h
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ateliers passés */}
      <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Ateliers passés
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {mockUserData.apprenant.coursEnCours}
            </div>
            <p className="text-xs text-blue-100 mb-2">Ateliers passés</p>
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Voir les ateliers
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Mes mentors
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {mockUserData.apprenant.mentorsSuivis}
            </div>
            <p className="text-xs text-purple-100 mb-2">Mentors suivis</p>
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Voir les mentors
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Prochains ateliers
          </CardTitle>
          <CardDescription>
            Vos ateliers programmés avec vos mentors
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {mockUserData.apprenant.prochainsAteliers.map((atelier, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-sm">{atelier.titre}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Mentor: {atelier.mentor}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {atelier.date}
                </Badge>
                <Button size="sm" className="text-xs">
                  Rejoindre
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Annuler
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {renderSocialNetworkSection()}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Bonjour, {session?.user.name} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Votre espace d'entraide étudiant
            </p>
          </div>

          {/* Sélecteur de rôle */}
          <div className="flex gap-2">
            <Button
              variant={userRole === "apprenant" ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleChange("apprenant")}
            >
              Apprenant
            </Button>
            <Button
              variant={userRole === "mentor" ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleChange("mentor")}
            >
              Mentor
            </Button>
            <Button
              variant={userRole === "both" ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleChange("both")}
            >
              Les deux
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
        {userRole === "apprenant" && renderApprenantDashboard()}
        {userRole === "mentor" && renderMentorDashboard()}
        {userRole === "both" && renderBothDashboard()}
      </div>
    </div>
  );
}
