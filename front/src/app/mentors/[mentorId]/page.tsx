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
  GraduationCap,
  Briefcase,
  Award,
  BookOpen,
  Globe,
  MessageSquare,
  UserPlus,
  UserMinus,
  Star,
} from "lucide-react";
import { API_BASE_URL, getUserRole } from "@/lib/api-client";
import Loader from "@/components/loader";
import { ContactMentorDialog } from "@/components/mentor/ContactMentorDialog";
import { RequestWorkshopParticipationDialog } from "@/components/mentor/RequestWorkshopParticipationDialog";
import { MentorFeedbacks } from "@/components/mentor/MentorFeedbacks";
import { MentorWorkshopsList } from "@/components/mentor/MentorWorkshopsList";
import { BlockUserDialog } from "@/components/user/BlockUserDialog";
import { ReportUserDialog } from "@/components/user/ReportUserDialog";
import { toast } from "sonner";
import { BackButton } from "@/components/back-button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageCard } from "@/components/layout/PageCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Ban, Flag } from "lucide-react";

export default function MentorProfileViewPage() {
  const router = useRouter();
  const params = useParams();
  const mentorId = params.mentorId as string;
  const { data: session } = authClient.useSession();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const {
    data: mentor,
    isLoading,
    error,
  } = trpc.mentor.getPublicProfile.useQuery({ mentorId }, {
    enabled: !!mentorId,
  });

  const { data: connectionStatus, refetch: refetchConnectionStatus } =
    trpc.connection.checkConnectionStatus.useQuery(
      { otherUserId: mentor?.userId || "" },
      {
        enabled: !!mentor?.userId && !!session && mentor.userId !== session?.user?.id,
      }
    );

  const sendConnectionRequestMutation = trpc.connection.sendConnectionRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande d'invitation envoyée");
      refetchConnectionStatus();
    },
    onError: (error: { message: string }) => toast.error("Erreur lors de l'envoi: " + error.message),
  });

  const removeConnectionMutation = trpc.connection.removeConnection.useMutation({
    onSuccess: () => {
      toast.success("Connexion supprimée");
      refetchConnectionStatus();
    },
    onError: (error: { message: string }) => toast.error("Erreur lors de la suppression: " + error.message),
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error || !mentor) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Profil introuvable</h1>
          <p className="text-muted-foreground mb-6">
            Le profil du mentor que vous recherchez n'existe pas ou n'est pas publié.
          </p>
          <Button onClick={() => router.push("/")}>Retour à l'accueil</Button>
        </div>
      </PageContainer>
    );
  }

  const canContact = userRole === 'APPRENANT';
  const photoUrl = mentor.photoUrl ? `${API_BASE_URL}${mentor.photoUrl}` : null;
  const socialMediaLinks = mentor.socialMediaLinks || {};

  return (
    <PageContainer>
      <BackButton onClick={() => router.back()} />

      <PageCard>
        <div className="absolute top-4 right-4">
          {session && mentor.userId !== session.user.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-ls-error">
                  <Flag className="h-4 w-4 mr-2" /> Signaler
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="text-ls-error">
                  <Ban className="h-4 w-4 mr-2" /> Bloquer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
             <Avatar className="w-32 h-32 border-4 border-primary shadow-lg">
              <AvatarImage src={photoUrl || undefined} alt={mentor.displayName || 'Mentor'} />
              <AvatarFallback className="text-5xl">
                {mentor.displayName?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{mentor.displayName || "Mentor"}</h1>
            {mentor.domain && <p className="text-lg text-muted-foreground">{mentor.domain}</p>}
          </div>
          {session && userRole === "APPRENANT" && mentor.userId !== session.user.id && (
            <div className="flex justify-center pt-2 gap-2 flex-wrap">
              <Button onClick={() => setShowRequestDialog(true)}>
                <BookOpen className="h-4 w-4 mr-2" /> Participer à un atelier
              </Button>
              <Button onClick={() => setShowContactDialog(true)} variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" /> Contacter
              </Button>
              {connectionStatus?.status === 'ACCEPTED' ? (
                <Button onClick={() => removeConnectionMutation.mutate({ otherUserId: mentor.userId! })} disabled={removeConnectionMutation.isPending} variant="destructive" >
                  <UserMinus className="h-4 w-4 mr-2" /> {removeConnectionMutation.isPending ? "Suppression..." : "Supprimer la connexion"}
                </Button>
              ) : connectionStatus?.status === 'PENDING' ? (
                <Button disabled variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" /> Demande envoyée
                </Button>
              ) : (
                <Button onClick={() => sendConnectionRequestMutation.mutate({ receiverUserId: mentor.userId! })} disabled={sendConnectionRequestMutation.isPending} variant="outline" >
                  <UserPlus className="h-4 w-4 mr-2" /> {sendConnectionRequestMutation.isPending ? "Envoi..." : "Ajouter au réseau"}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6 border-t border-border p-6">
            {mentor.bio && (
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5" />À propos</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">{mentor.bio}</p>
                </div>
            )}
            {mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Award className="h-5 w-5" />Domaines d'expertise</h3>
                    <div className="flex flex-wrap gap-2">
                        {mentor.areasOfExpertise.map((area: string) => <Badge key={area} variant="secondary">{area}</Badge>)}
                    </div>
                </div>
            )}
            {mentor.qualifications && (
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><GraduationCap className="h-5 w-5" />Qualifications</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">{mentor.qualifications}</p>
                </div>
            )}
            {mentor.experience && (
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Briefcase className="h-5 w-5" />Expérience</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">{mentor.experience}</p>
                </div>
            )}
        </div>
      </PageCard>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Ateliers proposés</h2>
        <MentorWorkshopsList mentorId={mentorId} />
      </div>

      <div className="mt-8">
        <MentorFeedbacks mentorId={mentorId} mentorUserId={mentor?.userId} />
      </div>

      <ContactMentorDialog open={showContactDialog} onOpenChange={setShowContactDialog} mentorId={mentorId} mentorName={mentor.displayName || "ce mentor"} />
      <RequestWorkshopParticipationDialog open={showRequestDialog} onOpenChange={setShowRequestDialog} mentorId={mentorId} mentorName={mentor.displayName || "ce mentor"} />
      
      <BlockUserDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        userId={mentor.userId!}
        userName={mentor.displayName}
        onBlocked={() => router.push("/")}
      />
      <ReportUserDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        userId={mentor.userId!}
        userName={mentor.displayName}
      />
    </PageContainer>
  );
}
