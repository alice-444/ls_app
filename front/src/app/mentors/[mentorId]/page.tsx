"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MessageSquare, Briefcase, Star, GraduationCap, MapPin } from "lucide-react";
import { ContactMentorDialog } from "@/components/mentor/ContactMentorDialog";
import { Badge } from "@/components/ui/badge";

export default function MentorProfilePage() {
  const params = useParams();
  const mentorId = params.mentorId as string;
  const { data: session } = authClient.useSession();
  const [showContactDialog, setShowContactDialog] = useState(false);

  const { data: mentor, isLoading, error } = trpc.mentor.getById.useQuery(
    { mentorId },
    { enabled: !!mentorId }
  );
  
  const { data: userRole } = trpc.profile.getRole.useQuery(undefined, { enabled: !!session });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader /></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Erreur: {error.message}</div>;
  }

  if (!mentor) {
    return <div className="text-center py-10">Mentor non trouvé.</div>;
  }

  const canContact = userRole === 'APPRENANT';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-slate-900 shadow-lg rounded-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary">
              <AvatarImage src={mentor.photoUrl || undefined} alt={mentor.displayName || 'Mentor'} />
              <AvatarFallback className="text-4xl">
                <User />
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight">{mentor.displayName}</h1>
              <p className="text-muted-foreground">{mentor.domain}</p>
              {canContact && (
                <Button 
                  onClick={() => setShowContactDialog(true)} 
                  className="mt-4"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contacter ce mentor
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Briefcase /> Bio & Expérience</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{mentor.bio}</p>
            <p className="text-muted-foreground whitespace-pre-wrap mt-2">{mentor.experience}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Star /> Domaines d'expertise</h2>
            <div className="flex flex-wrap gap-2">
              {(mentor.areasOfExpertise as string[] || []).map((area) => (
                <Badge key={area} variant="secondary">{area}</Badge>
              ))}
            </div>
             <h2 className="text-xl font-semibold mt-6 mb-4 flex items-center gap-2"><GraduationCap /> Qualifications</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{mentor.qualifications}</p>
          </div>
        </div>
      </div>
      
      {mentor.displayName && (
        <ContactMentorDialog
            open={showContactDialog}
            onOpenChange={setShowContactDialog}
            mentorId={mentorId}
            mentorName={mentor.displayName}
        />
      )}
    </div>
  );
}
