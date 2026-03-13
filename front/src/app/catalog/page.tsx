"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { getUserRole } from "@/lib/api-client";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  X,
  Search,
  ChevronDown,
  Tag,
  BookOpen,
} from "lucide-react";
import { PageContainer } from "@/components/shared/layout";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RequestWorkshopParticipationDialog } from "@/components/domains/mentor/RequestWorkshopParticipationDialog";
import { WorkshopCard } from "@/components/domains/workshop/cards/WorkshopCard";
import type { WorkshopDetailed as Workshop } from "@ls-app/shared";

export default function WorkshopRoomPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [selectedMentorName, setSelectedMentorName] = useState<string>("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const isApprentice = userRole === "APPRENANT";

  const [mentorSearchQuery, setMentorSearchQuery] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [dateFilterType, setDateFilterType] = useState<"single" | "range">(
    "single"
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateRangeStart, setDateRangeStart] = useState<string>("");
  const [dateRangeEnd, setDateRangeEnd] = useState<string>("");

  const availableWorkshopsQuery = trpc.workshop.getAvailableWorkshops.useQuery(
    undefined,
    {
      enabled: !!session && isApprentice,
    }
  );

  const publishedWorkshopsQuery = trpc.workshop.getPublished.useQuery(
    undefined,
    {
      enabled: !session || !isApprentice,
    }
  );

  const workshops = (isApprentice ? availableWorkshopsQuery.data : publishedWorkshopsQuery.data) || [];

  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    workshops.forEach((w: Workshop) => {
      if (w.topic) topics.add(w.topic);
    });
    return Array.from(topics);
  }, [workshops]);

  const filteredWorkshops = useMemo(() => {
    return workshops.filter((workshop: Workshop) => {
      const creatorName = workshop.creator?.displayName || workshop.creator?.name || workshop.creator?.user?.name || "";
      const matchesSearch =
        workshop.title.toLowerCase().includes(mentorSearchQuery.toLowerCase()) ||
        creatorName.toLowerCase().includes(mentorSearchQuery.toLowerCase());

      const matchesTopic =
        selectedTopics.length === 0 ||
        (workshop.topic && selectedTopics.includes(workshop.topic));

      let matchesDate = true;
      if (workshop.date) {
        const workshopDate = new Date(workshop.date).toISOString().split("T")[0];

        if (dateFilterType === "single" && selectedDate) {
          matchesDate = workshopDate === selectedDate;
        } else if (dateFilterType === "range" && dateRangeStart && dateRangeEnd) {
          matchesDate = workshopDate >= dateRangeStart && workshopDate <= dateRangeEnd;
        }
      } else if (selectedDate || (dateRangeStart && dateRangeEnd)) {
        matchesDate = false;
      }

      return matchesSearch && matchesTopic && matchesDate;
    });
  }, [workshops, mentorSearchQuery, selectedTopics, selectedDate, dateRangeStart, dateRangeEnd, dateFilterType]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const clearFilters = () => {
    setMentorSearchQuery("");
    setSelectedTopics([]);
    setSelectedDate("");
    setDateRangeStart("");
    setDateRangeEnd("");
  };

  const isLoading = availableWorkshopsQuery.isLoading || publishedWorkshopsQuery.isLoading;

  const renderWorkshopContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[400px] rounded-3xl bg-ls-surface animate-pulse" />
          ))}
        </div>
      );
    }
    if (filteredWorkshops.length === 0) {
      return (
        <Card className="border-dashed border-2 bg-ls-surface/30 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-brand/5 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-brand/30" />
            </div>
            <h3 className="text-2xl font-bold text-ls-heading mb-3">
              Aucun atelier trouvé
            </h3>
            <p className="text-ls-muted text-lg max-w-md mb-8 leading-relaxed">
              Essayez d&apos;élargir votre recherche ou de modifier vos filtres pour trouver ce que vous cherchez.
            </p>
            <Button
              variant="cta"
              size="cta"
              onClick={clearFilters}
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkshops.map((workshop: Workshop, index: number) => (
          <motion.div
            key={workshop.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
          >
            <WorkshopCard
              workshop={workshop}
              variant="catalogue"
              className="border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-brand/10 transition-all duration-300"
              onViewDetails={(id) => router.push(`/workshop/${id}`)}
              onRequestParticipation={(w) => {
                const creatorName = w.creator?.displayName || w.creator?.name || w.creator?.user?.name || "Mentor";
                setSelectedWorkshopId(w.id);
                setSelectedMentorId(w.creator?.id || null);
                setSelectedMentorName(creatorName);
                setShowRequestDialog(true);
              }}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <PageContainer>
      <RequestWorkshopParticipationDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        mentorId={selectedMentorId || ""}
        mentorName={selectedMentorName}
        workshopId={selectedWorkshopId || ""}
        onSuccess={() => {
          setShowRequestDialog(false);
          availableWorkshopsQuery.refetch();
          publishedWorkshopsQuery.refetch();
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand/10 rounded-2xl">
                <GraduationCap className="h-8 w-8 text-brand" />
              </div>
              <h1 className="text-4xl font-bold text-ls-heading tracking-tight">
                Catalogue des <span className="text-brand">Ateliers</span>
              </h1>
            </div>
            <p className="text-ls-muted text-lg max-w-2xl">
              Trouve l&apos;atelier idéal pour progresser dans vos études avec l&apos;aide de nos mentors passionnés.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 text-sm bg-brand/5 border-brand/20 text-brand rounded-full">
              {filteredWorkshops.length} Ateliers disponibles
            </Badge>
          </div>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl shadow-black/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ls-muted" />
                <Input
                  placeholder="Rechercher par titre ou mentor..."
                  value={mentorSearchQuery}
                  onChange={(e) => setMentorSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-ls-surface border-border/50 focus:border-brand rounded-2xl transition-all"
                />
              </div>

              <div className="md:col-span-7 flex flex-wrap items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-14 px-6 border-border/50 rounded-2xl gap-2 hover:bg-brand/5 transition-all">
                      <Tag className="h-5 w-5 text-brand" />
                      Domaines
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 border-border/50">
                    <DropdownMenuLabel className="px-3 py-2">Filtrer par domaine</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-60 overflow-y-auto">
                      {allTopics.map((topic) => (
                        <DropdownMenuCheckboxItem
                          key={topic}
                          checked={selectedTopics.includes(topic)}
                          onCheckedChange={() => toggleTopic(topic)}
                          className="rounded-xl cursor-pointer"
                        >
                          {topic}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-2 bg-ls-surface p-1 rounded-2xl border border-border/50">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-12 border-0 bg-transparent focus-visible:ring-0 rounded-xl w-40"
                  />
                  {(mentorSearchQuery || selectedTopics.length > 0 || selectedDate) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFilters}
                      className="h-10 w-10 rounded-xl hover:bg-brand/10 hover:text-brand"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {selectedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
                {selectedTopics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="pl-3 pr-1 py-1.5 gap-1 bg-brand/10 text-brand border-0 rounded-xl group"
                  >
                    {topic}
                    <button
                      onClick={() => toggleTopic(topic)}
                      className="p-0.5 hover:bg-brand/20 rounded-lg transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {renderWorkshopContent()}
      </motion.div>
    </PageContainer>
  );
}
