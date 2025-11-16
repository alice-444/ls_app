"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
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
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  User,
  X,
  Filter,
  Search,
  ChevronDown,
  Tag,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/workshop-utils";
import { Badge } from "@/components/ui/badge";

type Workshop = {
  id: string;
  title: string;
  description: string | null;
  date: Date | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  maxParticipants: number | null;
  status: string;
  creator: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    } | null;
    mentorshipTopics: string[] | null;
  } | null;
};

export default function WorkshopRoomPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [mentorSearchQuery, setMentorSearchQuery] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [dateFilterType, setDateFilterType] = useState<"single" | "range">(
    "single"
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateRangeStart, setDateRangeStart] = useState<string>("");
  const [dateRangeEnd, setDateRangeEnd] = useState<string>("");

  const {
    data: workshops,
    isLoading,
    error,
  } = trpc.workshop.getPublished.useQuery(undefined, {
    enabled: !!session,
  });

  const availableTopics = useMemo(() => {
    if (!workshops) return [];
    const topicSet = new Set<string>();
    workshops.forEach((workshop: Workshop) => {
      const topics = workshop.creator?.mentorshipTopics;
      if (Array.isArray(topics)) {
        topics.forEach((topic) => {
          if (typeof topic === "string" && topic.trim().length > 0) {
            topicSet.add(topic.trim());
          }
        });
      }
    });
    return Array.from(topicSet).sort((a, b) => a.localeCompare(b));
  }, [workshops]);

  const filteredWorkshops = useMemo(() => {
    if (!workshops) return [];
    let result = [...workshops];

    if (mentorSearchQuery.trim().length > 0) {
      const searchLower = mentorSearchQuery.toLowerCase().trim();
      result = result.filter((workshop: Workshop) => {
        const mentorName = workshop.creator?.user?.name?.toLowerCase() || "";
        return mentorName.includes(searchLower);
      });
    }

    if (selectedTopics.length > 0) {
      result = result.filter((workshop: Workshop) => {
        const workshopTopics = workshop.creator?.mentorshipTopics || [];
        if (!Array.isArray(workshopTopics)) return false;
        return selectedTopics.some((selectedTopic) =>
          workshopTopics.some(
            (topic) =>
              typeof topic === "string" &&
              topic.trim().toLowerCase() === selectedTopic.toLowerCase()
          )
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              Erreur lors du chargement des ateliers
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Workshop Room
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            La salle virtuelle où l'apprenant découvre et rejoint l'atelier.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">
                  Rechercher par nom de mentor
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher un mentor..."
                    value={mentorSearchQuery}
                    onChange={(e) => setMentorSearchQuery(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {mentorSearchQuery.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearMentorFilter}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">
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
                      className="flex-1"
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
                      className="flex-1"
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
                        className="flex-1"
                      />
                      {selectedDate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedDate("")}
                          className="h-10 w-10"
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
                          className="flex-1"
                        />
                        <Input
                          type="date"
                          value={dateRangeEnd}
                          onChange={(e) => setDateRangeEnd(e.target.value)}
                          placeholder="Date de fin"
                          className="flex-1"
                        />
                        {hasDateFilter() && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearDateFilter}
                            className="h-10 w-10"
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
                <label className="text-sm font-medium mb-2 block">
                  Filtrer par topic
                </label>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
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
                      className="w-40 max-h-96"
                      align="start"
                    >
                      <DropdownMenuLabel>Topics</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {availableTopics.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Aucun topic disponible
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto">
                          {availableTopics.map((topic) => (
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
                            className="text-muted-foreground"
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
                      className="h-10 w-10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTopics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {topic}
                        <button
                          onClick={() =>
                            setSelectedTopics((prev) =>
                              prev.filter((t) => t !== topic)
                            )
                          }
                          className="ml-1 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full p-0.5"
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">
                {workshops && workshops.length === 0
                  ? "Aucun atelier disponible pour le moment"
                  : "Aucun atelier ne correspond aux filtres sélectionnés"}
              </p>
              {(mentorSearchQuery.length > 0 ||
                selectedTopics.length > 0 ||
                hasDateFilter()) && (
                <Button
                  variant="outline"
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
            {filteredWorkshops.map((workshop: Workshop) => (
              <Card
                key={workshop.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/workshop/${workshop.id}`)}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {workshop.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {workshop.description || "Aucune description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {workshop.creator && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-slate-500" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (workshop.creator) {
                            router.push(`/mentors/${workshop.creator.id}`);
                          }
                        }}
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:underline"
                      >
                        {workshop.creator.user?.name || "Mentor"}
                      </button>
                    </div>
                  )}

                  {workshop.date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatDate(workshop.date)}
                      </span>
                    </div>
                  )}

                  {workshop.time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatTime(workshop.time)}
                        {workshop.duration && ` • ${workshop.duration} min`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    {workshop.isVirtual ? (
                      <Video className="h-4 w-4 text-slate-500" />
                    ) : (
                      <MapPin className="h-4 w-4 text-slate-500" />
                    )}
                    <span className="text-slate-600 dark:text-slate-400">
                      {workshop.isVirtual
                        ? "En ligne"
                        : workshop.location || "Lieu à définir"}
                    </span>
                  </div>

                  {workshop.maxParticipants && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Max {workshop.maxParticipants} participants
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
