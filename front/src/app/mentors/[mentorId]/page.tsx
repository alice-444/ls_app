"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
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
  MessageSquare,
  UserPlus,
  UserMinus,
  MoreVertical,
  Ban,
  Flag,
} from "lucide-react";
import { getUserRole } from "@/lib/api-client";
import { formatPhotoUrl } from "@/utils/photo";
import { ContactMentorDialog } from "@/components/domains/mentor/ContactMentorDialog";
import { RequestWorkshopParticipationDialog } from "@/components/domains/mentor/RequestWorkshopParticipationDialog";
import { MentorFeedbacks } from "@/components/domains/mentor/MentorFeedbacks";
import { MentorWorkshopsList } from "@/components/domains/mentor/MentorWorkshopsList";
import { BlockUserDialog } from "@/components/domains/user/BlockUserDialog";
import { ReportUserDialog } from "@/components/domains/user/ReportUserDialog";
import { toast } from "sonner";
import { BackButton } from "@/components/shared/back-button";
import { PageContainer } from "@/components/shared/layout/PageContainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";

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
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
            <p className="text-ls-muted">Chargement du profil...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !mentor) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            <ShinyText text="Profil introuvable" />
          </h1>
          <p className="text-ls-muted mb-6">
            Le profil du mentor que tu recherches n&apos;existe pas ou n&apos;est pas publié.
          </p>
          <Button onClick={() => router.push("/")} className="rounded-full">
            Retour à l&apos;accueil
          </Button>
        </div>
      </PageContainer>
    );
  }

  const canContact = userRole === 'APPRENANT';
  const photoUrl = formatPhotoUrl(mentor.photoUrl);
  const socialMediaLinks = mentor.socialMediaLinks || {};

  const breadcrumbItems = [
    { label: "Accueil", href: "/dashboard" },
    { 
      label: "Mentors", 
      href: (userRole === "APPRENANT" || userRole === "ADMIN") ? "/mentors" : undefined 
    },
    { label: mentor?.displayName || mentor?.name || "Profil", isCurrent: true },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 mb-6">
        <Breadcrumb items={breadcrumbItems} />
        <BackButton onClick={() => router.back()} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="relative bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="absolute top-4 right-4 z-10">
              {session && mentor.userId !== session.user.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-border/50 backdrop-blur-xl">
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
            <div className="text-center space-y-4 pb-6 pt-6">
              <div className="flex justify-center">
                <Avatar className="w-32 h-32 border-4 border-brand shadow-lg">
                  <AvatarImage src={photoUrl || undefined} alt={mentor.displayName || 'Mentor'} />
                  <AvatarFallback className="text-5xl">
                    {mentor.displayName?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  <ShinyText text={mentor.displayName || "Mentor"} />
                </h1>
                {mentor.domain && <p className="text-lg text-ls-muted">{mentor.domain}</p>}
              </div>
              {session && userRole === "APPRENANT" && mentor.userId !== session.user.id && (
                <div className="flex justify-center pt-2 gap-2 flex-wrap">
                  <Button variant="cta" size="cta" onClick={() => setShowRequestDialog(true)}>
                    <BookOpen className="h-4 w-4 mr-2" /> Participer à un atelier
                  </Button>
                  <Button variant="ctaOutline" size="cta" onClick={() => setShowContactDialog(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Contacter
                  </Button>
                  {connectionStatus?.status === "ACCEPTED" && (
                    <Button onClick={() => removeConnectionMutation.mutate({ otherUserId: mentor.userId! })} disabled={removeConnectionMutation.isPending} variant="destructive" className="rounded-full">
                      <UserMinus className="h-4 w-4 mr-2" /> {removeConnectionMutation.isPending ? "Suppression..." : "Supprimer la connexion"}
                    </Button>
                  )}
                  {connectionStatus?.status === "PENDING" && (
                    <Button disabled variant="outline" className="rounded-full">
                      <UserPlus className="h-4 w-4 mr-2" /> Demande envoyée
                    </Button>
                  )}
                  {connectionStatus?.status !== "ACCEPTED" && connectionStatus?.status !== "PENDING" && (
                    <Button variant="ctaOutline" size="cta" onClick={() => sendConnectionRequestMutation.mutate({ receiverUserId: mentor.userId! })} disabled={sendConnectionRequestMutation.isPending}>
                      <UserPlus className="h-4 w-4 mr-2" /> {sendConnectionRequestMutation.isPending ? "Envoi..." : "Ajouter au réseau"}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6 border-t border-border/50 p-6">
              {mentor.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-ls-heading"><BookOpen className="h-5 w-5 text-brand" />À propos</h3>
                  <p className="whitespace-pre-wrap text-ls-muted">{mentor.bio}</p>
                </div>
              )}
              {mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-ls-heading"><Award className="h-5 w-5 text-brand" />Domaines d&apos;expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.areasOfExpertise.map((area: string) => <Badge key={area} variant="secondary" className="rounded-full">{area}</Badge>)}
                  </div>
                </div>
              )}
              {mentor.qualifications && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-ls-heading"><GraduationCap className="h-5 w-5 text-brand" />Qualifications</h3>
                  <p className="whitespace-pre-wrap text-ls-muted">{mentor.qualifications}</p>
                </div>
              )}
              {mentor.experience && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-ls-heading"><Briefcase className="h-5 w-5 text-brand" />Expérience</h3>
                  <p className="whitespace-pre-wrap text-ls-muted">{mentor.experience}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold mb-4">
          <ShinyText text="Ateliers proposés" />
        </h2>
        <MentorWorkshopsList mentorId={mentorId} />
      </motion.div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <MentorFeedbacks mentorId={mentorId} mentorUserId={mentor?.userId} />
      </motion.div>

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
