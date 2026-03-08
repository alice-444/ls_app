"use client";

import { Suspense, useState } from "react";
import { trpc } from "@/utils/trpc";
import { PageContainer, PageHeader } from "@/components/layout";
import { EventsTabs } from "@/components/community/EventsTabs";
import { EventsHubGrid } from "@/components/community/EventsHubGrid";
import { DealsGrid } from "@/components/community/DealsGrid";
import { SpotFinder } from "@/components/community/SpotFinder";
import { CommunityPoll } from "@/components/community/CommunityPoll";
import { MemberDirectory } from "@/components/community/MemberDirectory";
import { ImpactStats } from "@/components/community/ImpactStats";
import { Loader2, PlusCircle, CalendarDays, Rocket } from "lucide-react";
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
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
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
                    Propose an Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Propose a Community Event</DialogTitle>
                    <DialogDescription>
                      Share a meetup, webinar, or any student gathering.
                    </DialogDescription>
                  </DialogHeader>
                  <ProposeEventForm onSuccess={() => setIsEventDialogOpen(false)} />
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
                    Propose a Deal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Propose a Student Deal</DialogTitle>
                    <DialogDescription>
                      Share a discount or a good plan with the community.
                    </DialogDescription>
                  </DialogHeader>
                  <ProposeDealForm onSuccess={() => setIsDealDialogOpen(false)} />
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
                    Propose a Spot
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Propose a Study Spot</DialogTitle>
                    <DialogDescription>
                      Recommend a great place to work or relax.
                    </DialogDescription>
                  </DialogHeader>
                  <ProposeSpotForm onSuccess={() => setIsSpotDialogOpen(false)} />
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

          {/* Featured Members */}
          <MemberDirectory members={hubData?.featuredMembers || []} />
          
          {/* CTA: Create Workshop */}
          <Card className="bg-ls-blue text-white rounded-3xl p-6 border-none shadow-xl shadow-ls-blue/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-2xl">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black">Want to share knowledge?</h3>
            </div>
            <p className="text-white/80 text-sm mb-6">
              Create a mentorship workshop and help other students grow. Earn credits and impact.
            </p>
            <Button asChild className="w-full bg-white text-ls-blue hover:bg-white/90 font-bold rounded-full">
              <a href="/workshops/create">Start a Workshop</a>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Community Hub" 
        subtitle="The pulse of student solidarity. Discover events, share deals and find the best spots."
      />
      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>}>
        <CommunityHubContent />
      </Suspense>
    </PageContainer>
  );
}
