"use client";

import { Suspense, useState } from "react";
import { trpc } from "@/utils/trpc";
import { PageContainer } from "@/components/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import { EventsTabs } from "@/components/community/EventsTabs";
import { EventsHubGrid } from "@/components/community/EventsHubGrid";
import { DealsGrid } from "@/components/community/DealsGrid";
import { SpotFinder } from "@/components/community/SpotFinder";
import { CommunityPoll } from "@/components/community/CommunityPoll";
import { MemberDirectory } from "@/components/community/MemberDirectory";
import { ImpactStats } from "@/components/community/ImpactStats";
import { Loader2, PlusCircle, Rocket, Calendar, Tag, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ProposeDealForm } from "@/components/community/ProposeDealForm";
import { ProposeSpotForm } from "@/components/community/ProposeSpotForm";
import { ProposeEventForm } from "@/components/community/ProposeEventForm";

function CommunityHubContent() {
  const { data: hubData, isLoading, refetch } = trpc.community.getHubData.useQuery();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);
  const [isSpotDialogOpen, setIsSpotDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-ls-muted">Chargement de la communauté...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-10 pb-20"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* Section 1: Events Hub (Participatif) */}
          <section id="events-hub">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-ls-heading flex items-center gap-2">
                <span className="w-2 h-8 bg-brand rounded-full"></span>
                Events Hub
              </h2>
              <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full border-brand text-brand hover:bg-brand hover:text-white transition-all h-9">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Proposer un événement
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl p-0 gap-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:h-9 [&>button]:w-9 [&>button]:bg-muted/50 [&>button]:hover:bg-muted">
                  <DialogHeader className="p-6 pb-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                        <Calendar className="h-5 w-5 text-brand" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-ls-heading">Proposer un événement communautaire</DialogTitle>
                        <DialogDescription className="text-ls-muted mt-0.5">
                          Partage un meetup, un webinar ou tout rassemblement étudiant.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="p-6 pt-4">
                    <ProposeEventForm onSuccess={() => setIsEventDialogOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <EventsHubGrid events={hubData?.communityEvents || []} />
          </section>

          {/* Section 2: Mentorship Workshops (Automatique) */}
          <section id="workshops">
            <h2 className="text-2xl font-black text-ls-heading mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-ls-blue rounded-full"></span>
              Mentorship Workshops
            </h2>
            <EventsTabs 
              upcoming={hubData?.upcomingWorkshops || []} 
              past={[]} // On focus on upcoming here
            />
          </section>

          {/* Section 3: Student Deals */}
          <section id="deals">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-ls-heading flex items-center gap-2">
                <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
                Student Deals
              </h2>
              <Dialog open={isDealDialogOpen} onOpenChange={setIsDealDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white transition-all h-9">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Proposer une offre
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl p-0 gap-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:h-9 [&>button]:w-9 [&>button]:bg-muted/50 [&>button]:hover:bg-muted">
                  <DialogHeader className="p-6 pb-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                        <Tag className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-ls-heading">Proposer une offre étudiante</DialogTitle>
                        <DialogDescription className="text-ls-muted mt-0.5">
                          Partage une réduction ou une bonne affaire avec la communauté.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="p-6 pt-4">
                    <ProposeDealForm onSuccess={() => setIsDealDialogOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <DealsGrid initialDeals={hubData?.deals || []} />
          </section>

          {/* Section 4: Spot Finder */}
          <section id="spots">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-ls-heading flex items-center gap-2">
                <span className="w-2 h-8 bg-ls-success rounded-full"></span>
                Spot Finder
              </h2>
              <Dialog open={isSpotDialogOpen} onOpenChange={setIsSpotDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full border-ls-success text-ls-success hover:bg-ls-success hover:text-white transition-all h-9">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Proposer un spot
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl p-0 gap-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:h-9 [&>button]:w-9 [&>button]:bg-muted/50 [&>button]:hover:bg-muted">
                  <DialogHeader className="p-6 pb-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ls-success/10">
                        <MapPin className="h-5 w-5 text-ls-success" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-ls-heading">Proposer un lieu d'étude</DialogTitle>
                        <DialogDescription className="text-ls-muted mt-0.5">
                          Recommande un super endroit pour travailler ou te détendre.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="p-6 pt-4">
                    <ProposeSpotForm onSuccess={() => setIsSpotDialogOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <SpotFinder initialSpots={hubData?.spots || []} />
          </section>
        </div>

        <div className="space-y-8">
          {/* Impact Stats */}
          <ImpactStats stats={hubData?.stats} />

          {/* Weekly Poll */}
          {hubData?.activePoll && (
            <CommunityPoll 
              poll={hubData.activePoll} 
              onVoteSuccess={refetch} 
            />
          )}

          {/* CTA: Create Workshop */}
          <Card className="bg-ls-blue text-white rounded-2xl p-6 border-none shadow-xl shadow-ls-blue/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-2xl">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black">Tu veux partager tes connaissances ?</h3>
            </div>
            <p className="text-white/80 text-sm mb-6">
              Crée un atelier de mentorat et aide les autres à progresser. Gagne des crédits et de l'impact.
            </p>
            <Button asChild className="w-full bg-white text-ls-blue hover:bg-white/90 font-bold rounded-full">
              <a href="/workshops/create">Créer un atelier</a>
            </Button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunityPage() {
  return (
    <PageContainer>
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          <ShinyText text="Community Hub" />
        </h1>
        <p className="text-base sm:text-lg text-ls-muted mt-2">
          Le cœur de la solidarité étudiante. Découvre les événements, partage les offres et trouve les meilleurs spots.
        </p>
      </motion.div>
      <Suspense fallback={
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-ls-muted">Chargement de la communauté...</p>
        </div>
      }>
        <CommunityHubContent />
      </Suspense>
    </PageContainer>
  );
}
