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
  CardHeader,
  CardTitle,
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
  Filter,
  Search,
  ChevronDown,
  Tag,
  BookOpen,
} from "lucide-react";
import { PageContainer } from "@/components/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RequestWorkshopParticipationDialog } from "@/components/mentor/RequestWorkshopParticipationDialog";
import { WorkshopCard } from "@/components/workshop/cards/WorkshopCard";

type Workshop = {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  date: Date | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  maxParticipants: number | null;
  status: string;
  creator: {
    id: string;
    name: string;
    email: string;
    displayName: string | null;
    photoUrl: string | null;
  } | null;
};

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

  const allTopicsQuery = trpc.workshop.getAllTopics.useQuery();

  const workshops = isApprentice && session
    ? availableWorkshopsQuery.data
    : publishedWorkshopsQuery.data;
  const isLoading =
    (isApprentice && session
      ? availableWorkshopsQuery.isLoading
      : publishedWorkshopsQuery.isLoading) || !userRole || allTopicsQuery.isLoading;
  
  const error = 
    (isApprentice && session
      ? availableWorkshopsQuery.error
      : publishedWorkshopsQuery.error) || allTopicsQuery.error;
  
  const availableTopics = allTopicsQuery.data || [];

  const filteredWorkshops = useMemo(() => {
    if (!workshops) return [];
    let result = [...workshops];

    if (mentorSearchQuery.trim().length > 0) {
      const searchLower = mentorSearchQuery.toLowerCase().trim();
      result = result.filter((workshop: Workshop) => {
        const mentorName = (workshop.creator?.displayName || workshop.creator?.name || "").toLowerCase();
        return mentorName.includes(searchLower);
      });
    }

    if (selectedTopics.length > 0) {
      result = result.filter((workshop: Workshop) => {
        if (!workshop.topic) return false;
        return selectedTopics.some(
          (selectedTopic) =>
            workshop.topic &&
            workshop.topic.trim().toLowerCase() === selectedTopic.toLowerCase()
        );
      });
    }

    if (dateFilterType === "single" && selectedDate) {
      const filterDate = new Date(selectedDate);
      filterDate.setHours(0, 0, 0, 0);
      result = result.filter((workshop: Workshop) => {
        if (!workshop.date) return false;
        const workshopDate = new Date(workshop.date);
        workshopDate.setHours(0, 0, 0, 0);
        return workshopDate.getTime() === filterDate.getTime();
      });
    } else if (dateFilterType === "range" && dateRangeStart && dateRangeEnd) {
      const startDate = new Date(dateRangeStart);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRangeEnd);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter((workshop: Workshop) => {
        if (!workshop.date) return false;
        const workshopDate = new Date(workshop.date);
        return workshopDate >= startDate && workshopDate <= endDate;
      });
    }

    return result;
  }, [
    workshops,
    mentorSearchQuery,
    selectedTopics,
    dateFilterType,
    selectedDate,
    dateRangeStart,
    dateRangeEnd,
  ]);

  const clearMentorFilter = () => {
    setMentorSearchQuery("");
  };

  const handleTopicToggle = (topic: string, checked: boolean) => {
    if (checked) {
      setSelectedTopics((prev) => [...prev, topic]);
    } else {
      setSelectedTopics((prev) => prev.filter((t) => t !== topic));
    }
  };

  const clearTopicFilter = () => {
    setSelectedTopics([]);
  };

  const clearDateFilter = () => {
    setSelectedDate("");
    setDateRangeStart("");
    setDateRangeEnd("");
  };

  const hasDateFilter = () => {
    return (
      (dateFilterType === "single" && selectedDate) ||
      (dateFilterType === "range" && dateRangeStart && dateRangeEnd)
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
            <p className="text-ls-muted">Chargement du catalogue...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-destructive">
            Erreur lors du chargement des ateliers
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
    <PageContainer className="py-4 sm:py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF8C42] via-[#FFB647] to-[#FF8C42] text-white shadow-lg shadow-[#FF8C42]/25">
            <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <ShinyText text="e-Atelier" />
        </h1>
        <p className="text-base sm:text-lg text-ls-muted mt-2">
          Découvre et rejoins les ateliers disponibles
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="mb-6 border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-ls-heading">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <Filter className="h-5 w-5" />
              </span>
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block text-ls-heading">
                  Rechercher par nom de mentor
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ls-muted" />
                  <Input
                    type="text"
                    placeholder="Rechercher un mentor..."
                    value={mentorSearchQuery}
                    onChange={(e) => setMentorSearchQuery(e.target.value)}
                    className="pl-9 pr-9 rounded-full border-border bg-card/80 focus:ring-brand"
                  />
                  {mentorSearchQuery.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearMentorFilter}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block text-ls-heading">
                  Filtrer par date
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant={
                        dateFilterType === "single" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setDateFilterType("single");
                        setDateRangeStart("");
                        setDateRangeEnd("");
                      }}
                      className="flex-1 rounded-full"
                    >
                      Date unique
                    </Button>
                    <Button
                      variant={
                        dateFilterType === "range" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setDateFilterType("range");
                        setSelectedDate("");
                      }}
                      className="flex-1 rounded-full"
                    >
                      Plage de dates
                    </Button>
                  </div>
                  {dateFilterType === "single" ? (
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="flex-1 rounded-full border-border bg-card/80"
                      />
                      {selectedDate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedDate("")}
                          className="h-10 w-10 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={dateRangeStart}
                          onChange={(e) => setDateRangeStart(e.target.value)}
                          placeholder="Date de début"
                          className="flex-1 rounded-full border-border bg-card/80"
                        />
                        <Input
                          type="date"
                          value={dateRangeEnd}
                          onChange={(e) => setDateRangeEnd(e.target.value)}
                          placeholder="Date de fin"
                          className="flex-1 rounded-full border-border bg-card/80"
                        />
                        {hasDateFilter() && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearDateFilter}
                            className="h-10 w-10 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block text-ls-heading">
                  Filtrer par topic
                </label>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between rounded-full border-border bg-card/80"
                      >
                        <span>
                          {selectedTopics.length === 0
                            ? "Tous les topics"
                            : selectedTopics.length === 1
                            ? selectedTopics[0]
                            : `${selectedTopics.length} topics sélectionnés`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-40 max-h-96 rounded-2xl border-border/50 bg-card/95 backdrop-blur-md"
                      align="start"
                    >
                      <DropdownMenuLabel className="text-ls-heading">Topics</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {availableTopics.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-ls-muted">
                          Aucun topic disponible
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto">
                          {availableTopics.map((topic: string) => (
                            <DropdownMenuCheckboxItem
                              key={topic}
                              checked={selectedTopics.includes(topic)}
                              onCheckedChange={(checked) =>
                                handleTopicToggle(topic, checked as boolean)
                              }
                            >
                              {topic}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </div>
                      )}
                      {selectedTopics.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={false}
                            onCheckedChange={() => clearTopicFilter()}
                            className="text-ls-muted"
                          >
                            Tout désélectionner
                          </DropdownMenuCheckboxItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {selectedTopics.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearTopicFilter}
                      className="h-10 w-10 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTopics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="gap-1 rounded-full border border-border/50 bg-brand/10 text-ls-heading hover:bg-brand/15">
                        <Tag className="h-3 w-3" />
                        {topic}
                        <button
                          onClick={() =>
                            setSelectedTopics((prev) =>
                              prev.filter((t) => t !== topic)
                            )
                          }
                          className="ml-1 hover:bg-brand/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredWorkshops.length === 0 ? (
          <Card className="border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl shadow-black/5">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10 text-brand mb-6">
                <GraduationCap className="h-10 w-10" />
              </div>
              <p className="text-lg text-ls-heading font-medium mb-2">
                {workshops && workshops.length === 0
                  ? "Aucun atelier disponible pour le moment"
                  : "Aucun atelier ne correspond aux filtres sélectionnés"}
              </p>
              <p className="text-sm text-ls-muted mb-6 max-w-md">
                {workshops && workshops.length === 0
                  ? "Reviens plus tard pour découvrir les prochains ateliers."
                  : "Essaie d'élargir tes critères de recherche."}
              </p>
              {(mentorSearchQuery.length > 0 ||
                selectedTopics.length > 0 ||
                hasDateFilter()) && (
                <Button
                  variant="ctaOutline"
                  size="cta"
                  onClick={() => {
                    clearMentorFilter();
                    clearTopicFilter();
                    clearDateFilter();
                  }}
                >
                  Réinitialiser tous les filtres
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
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
                  setSelectedWorkshopId(w.id);
                  setSelectedMentorId(w.creator?.id || null);
                  setSelectedMentorName(w.creator?.displayName || w.creator?.name || "Mentor");
                  setShowRequestDialog(true);
                }}
              />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </PageContainer>

      {isApprentice && selectedMentorId && (
        <RequestWorkshopParticipationDialog
          open={showRequestDialog}
          onOpenChange={(open) => {
            setShowRequestDialog(open);
            if (!open) {
              setSelectedWorkshopId(null);
              setSelectedMentorId(null);
              setSelectedMentorName("");
            }
          }}
          mentorId={selectedMentorId}
          mentorName={selectedMentorName}
          preselectedWorkshopId={selectedWorkshopId}
        />
      )}
    </>
  );
}
