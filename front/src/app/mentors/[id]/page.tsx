"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Linkedin,
  Twitter,
  Youtube,
  Github,
  Mail,
  GraduationCap,
  Briefcase,
  Award,
  BookOpen,
  Globe,
  MessageSquare,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { API_BASE_URL, getUserRole } from "@/lib/api-client";
import Loader from "@/components/loader";
import { ContactMentorDialog } from "@/components/mentor/ContactMentorDialog";
import { RequestWorkshopParticipationDialog } from "@/components/mentor/RequestWorkshopParticipationDialog";
import { MentorFeedbacks } from "@/components/mentor/MentorFeedbacks";
import { MentorWorkshopHistory } from "@/components/mentor/MentorWorkshopHistory";
import { WorkshopCalendar } from "@/components/workshop/calendar/WorkshopCalendar";
import { toast } from "sonner";
import { BackButton } from "@/components/back-button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageCard } from "@/components/layout/PageCard";

export default function MentorProfileViewPage() {
  const router = useRouter();
  const params = useParams();
  const mentorId = params.id as string;
  const { data: session } = authClient.useSession();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [isSendingConnectionRequest, setIsSendingConnectionRequest] =
    useState(false);

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const {
    data: mentor,
    isLoading,
    error,
  } = trpc.mentor.getById.useQuery({ mentorId }, {
    enabled: !!mentorId,
  } as any);

  const { data: mentorWorkshopsData } = trpc.mentor.getPublicWorkshops.useQuery(
    { mentorId },
    {
      enabled: !!mentorId && !!session,
    } as any
  );

  const { data: mentorFeedbacks } = trpc.mentor.getFeedbacks.useQuery(
    { mentorId },
    {
      enabled: !!mentorId,
    } as any
  );

  const { data: connectionStatus } =
    trpc.connection.checkConnectionStatus.useQuery(
      { otherUserId: mentor?.userId || "" },
      {
        enabled:
          !!mentor?.userId && !!session && mentor.userId !== session?.user?.id,
      } as any
    );

  const sendConnectionRequestMutation =
    trpc.connection.sendConnectionRequest.useMutation({
      onSuccess: () => {
        toast.success("Demande d'invitation envoyée");
      },
      onError: (error: { message: string }) => {
        toast.error("Erreur lors de l'envoi", {
          description: error.message,
        });
      },
    } as any);

  const removeConnectionMutation = trpc.connection.removeConnection.useMutation(
    {
      onSuccess: () => {
        toast.success("Connexion supprimée");
      },
      onError: (error: { message: string }) => {
        toast.error("Erreur lors de la suppression", {
          description: error.message,
        });
      },
    } as any
  );

  const handleSendConnectionRequest = async () => {
    if (!mentor?.userId) return;
    setIsSendingConnectionRequest(true);
    try {
      await sendConnectionRequestMutation.mutateAsync({
        receiverUserId: mentor.userId,
      });
    } finally {
      setIsSendingConnectionRequest(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!mentor?.userId) return;
    removeConnectionMutation.mutate({
      otherUserId: mentor.userId,
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !mentor) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-[#26547c] dark:text-[#e6e6e6] mb-4">
            Profil introuvable
          </h1>
          <p className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] mb-6">
            Le profil du mentor que vous recherchez n'existe pas ou n'est pas
            publié.
          </p>
          <Button
            onClick={() => router.push("/workshop-room")}
            className="bg-[#26547c] hover:bg-[#1e4260] text-white"
          >
            Retour aux ateliers
          </Button>
        </div>
      </PageContainer>
    );
  }

  const photoUrl = mentor.photoUrl ? `${API_BASE_URL}${mentor.photoUrl}` : null;
  const areasOfExpertise = Array.isArray(mentor.areasOfExpertise)
    ? mentor.areasOfExpertise
    : [];
  const mentorshipTopics = Array.isArray(mentor.mentorshipTopics)
    ? mentor.mentorshipTopics
    : [];
  const socialMediaLinks = mentor.socialMediaLinks || {};

  return (
    <PageContainer>
      <BackButton onClick={() => router.back()} />

      <PageCard>
        <div className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={mentor.name || "Mentor"}
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-[#1a1720] shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-[#26547c] to-[#4A90E2] flex items-center justify-center text-white text-4xl font-semibold shadow-lg">
                {mentor.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#26547c] dark:text-[#e6e6e6]">
              {mentor.name || "Mentor"}
            </h1>
            {mentor.domain && (
              <p className="text-lg text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                {mentor.domain}
              </p>
            )}
            {mentorFeedbacks && (
              <div className="mt-3 flex items-center gap-2 justify-center">
                {mentorFeedbacks.aggregate.totalCount > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-[#FF8C42]">
                        {mentorFeedbacks.aggregate.averageRating.toFixed(1)}
                      </span>
                      <span className="text-[#FF8C42] text-xl">★</span>
                    </div>
                    <span className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] text-sm">
                      ({mentorFeedbacks.aggregate.totalCount} avis)
                    </span>
                  </>
                ) : (
                  <span className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] text-sm">
                    Nouveau mentor
                  </span>
                )}
              </div>
            )}
          </div>
          {session &&
            userRole === "APPRENANT" &&
            mentor.userId !== session.user.id && (
              <div className="flex justify-center pt-2 gap-2 flex-wrap">
                <Button
                  onClick={() => setShowRequestDialog(true)}
                  className="gap-2 bg-[#26547c] hover:bg-[#1e4260] text-white"
                >
                  <BookOpen className="h-4 w-4" />
                  Participer à l'atelier
                </Button>
                <Button
                  onClick={() => setShowContactDialog(true)}
                  variant="outline"
                  className="gap-2 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(38,84,124,0.1)] dark:hover:bg-[rgba(230,230,230,0.1)]"
                >
                  <MessageSquare className="h-4 w-4" />
                  Contacter
                </Button>
                {connectionStatus?.status !== "ACCEPTED" &&
                  connectionStatus?.status !== "PENDING" && (
                    <Button
                      onClick={handleSendConnectionRequest}
                      disabled={
                        isSendingConnectionRequest ||
                        sendConnectionRequestMutation.isPending
                      }
                      variant="outline"
                      className="gap-2 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(38,84,124,0.1)] dark:hover:bg-[rgba(230,230,230,0.1)]"
                    >
                      <UserPlus className="h-4 w-4" />
                      {isSendingConnectionRequest ||
                      sendConnectionRequestMutation.isPending
                        ? "Envoi..."
                        : "Envoyer une demande"}
                    </Button>
                  )}
                {connectionStatus?.status === "PENDING" && (
                  <Button
                    variant="outline"
                    disabled
                    className="gap-2 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Demande d'invitation en attente
                  </Button>
                )}
                {connectionStatus?.status === "ACCEPTED" && (
                  <Button
                    onClick={handleRemoveConnection}
                    disabled={removeConnectionMutation.isPending}
                    variant="outline"
                    className="gap-2 border border-[#f44336] dark:border-[#f44336] text-[#f44336] dark:text-[#f44336] hover:bg-[rgba(244,67,54,0.1)] dark:hover:bg-[rgba(244,67,54,0.15)]"
                  >
                    <UserMinus className="h-4 w-4" />
                    {removeConnectionMutation.isPending
                      ? "Suppression..."
                      : "Supprimer la connexion"}
                  </Button>
                )}
              </div>
            )}
        </div>

        <div className="space-y-6">
          {mentor.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
                <BookOpen className="h-5 w-5" />À propos
              </h3>
              <p className="text-[#161616] dark:text-[#e6e6e6] whitespace-pre-wrap">
                {mentor.bio}
              </p>
            </div>
          )}

          {areasOfExpertise.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
                <Award className="h-5 w-5" />
                Domaines d'expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {areasOfExpertise.map((area: string) => (
                  <Badge
                    key={area}
                    className="text-sm px-3 py-1 bg-[rgba(38,84,124,0.1)] dark:bg-[rgba(74,144,226,0.2)] text-[#26547c] dark:text-[#4A90E2] border-0"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {mentorshipTopics.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
                <GraduationCap className="h-5 w-5" />
                Sujets de mentorat
              </h3>
              <div className="flex flex-wrap gap-2">
                {mentorshipTopics.map((topic: string) => (
                  <Badge
                    key={topic}
                    className="text-sm px-3 py-1 bg-[rgba(255,182,71,0.15)] dark:bg-[rgba(255,182,71,0.25)] text-[#ffb647] dark:text-[#ffb647] border-0"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {mentor.qualifications && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
                <GraduationCap className="h-5 w-5" />
                Qualifications
              </h3>
              <p className="text-[#161616] dark:text-[#e6e6e6] whitespace-pre-wrap">
                {mentor.qualifications}
              </p>
            </div>
          )}

          {mentor.experience && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
                <Briefcase className="h-5 w-5" />
                Expérience
              </h3>
              <p className="text-[#161616] dark:text-[#e6e6e6] whitespace-pre-wrap">
                {mentor.experience}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
              <Mail className="h-5 w-5" />
              Contact
            </h3>
            <div className="space-y-2">
              {mentor.calendlyLink && (
                <div className="flex items-center gap-2 text-[#161616] dark:text-[#e6e6e6]">
                  <Calendar className="h-4 w-4" />
                  <a
                    href={mentor.calendlyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-[#26547c] dark:text-[#4A90E2]"
                  >
                    Réserver une session
                  </a>
                </div>
              )}
            </div>
          </div>

          {(socialMediaLinks.linkedin ||
            socialMediaLinks.twitter ||
            socialMediaLinks.youtube ||
            socialMediaLinks.github) && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
                <Globe className="h-5 w-5" />
                Réseaux sociaux
              </h3>
              <div className="flex flex-wrap gap-3">
                {socialMediaLinks.linkedin && (
                  <a
                    href={socialMediaLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-[32px] hover:bg-[#005885] transition-colors text-sm font-medium"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {socialMediaLinks.twitter && (
                  <a
                    href={socialMediaLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-[32px] hover:bg-sky-600 transition-colors text-sm font-medium"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </a>
                )}
                {socialMediaLinks.youtube && (
                  <a
                    href={socialMediaLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white rounded-[32px] hover:bg-[#cc0000] transition-colors text-sm font-medium"
                  >
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </a>
                )}
                {socialMediaLinks.github && (
                  <a
                    href={socialMediaLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#333] dark:bg-[#24292e] text-white rounded-[32px] hover:bg-[#24292e] dark:hover:bg-[#1a1e22] transition-colors text-sm font-medium"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          )}

          {mentorWorkshopsData &&
            (mentorWorkshopsData.upcoming.length > 0 ||
              mentorWorkshopsData.past.length > 0) && (
              <div className="pt-4 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
                  <Calendar className="h-5 w-5" />
                  Calendrier des ateliers
                </h3>
                <div className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-lg overflow-hidden">
                  <WorkshopCalendar
                    workshops={[
                      ...mentorWorkshopsData.upcoming,
                      ...mentorWorkshopsData.past,
                    ]}
                    height="600px"
                    userRole="MENTOR"
                    onSelectEvent={(workshop) => {
                      router.push(`/workshop/${workshop.id}`);
                    }}
                  />
                </div>
              </div>
            )}
        </div>
      </PageCard>

      <div className="mt-6 space-y-6">
        <MentorWorkshopHistory
          mentorId={mentorId}
          mentorName={mentor.name || "Mentor"}
        />

        <MentorFeedbacks mentorId={mentorId} mentorUserId={mentor?.userId} />
      </div>

      <ContactMentorDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        mentorId={mentorId}
        mentorName={mentor.name || "Mentor"}
      />

      <RequestWorkshopParticipationDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        mentorId={mentorId}
        mentorName={mentor.name || "Mentor"}
      />
    </PageContainer>
  );
}
