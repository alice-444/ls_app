"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { MentorsGrid } from "@/components/mentor/MentorsGrid";
import { MentorFilters } from "@/components/mentor/MentorFilters";
import { Button } from "@/components/ui/button";
import { Loader2, Users } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { MentorBasic } from "@/types/workshop-components";

export default function MentorsPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = trpc.mentor.getPublicMentors.useInfiniteQuery(
    {
      domain: domainFilter || undefined,
      topic: topicFilter || undefined,
      limit: 12,
    },
    {
      getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    }
  );

  const mentors = data?.pages.flatMap((page: any) => page.mentors as MentorBasic[]) || [];

  const filteredMentors = mentors.filter((mentor: MentorBasic) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = mentor.displayName?.toLowerCase().includes(searchLower);
    const domainMatch = mentor.domain?.toLowerCase().includes(searchLower);
    const expertiseMatch = mentor.areasOfExpertise?.some((e: string) =>
      e.toLowerCase().includes(searchLower)
    );
    return nameMatch || domainMatch || expertiseMatch;
  });

  const handleViewProfile = (mentorId: string) => {
    router.push(`/mentors/${mentorId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Découvrez nos mentors</h1>
        <p className="text-muted-foreground">
          Trouvez l'expert qui vous accompagnera dans votre apprentissage.
        </p>
      </div>

      <MentorFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        domainFilter={domainFilter}
        onDomainFilterChange={setDomainFilter}
        topicFilter={topicFilter}
        onTopicFilterChange={setTopicFilter}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Chargement des mentors...</p>
        </div>
      ) : filteredMentors.length > 0 ? (
        <>
          <MentorsGrid
            mentors={filteredMentors}
            onViewProfile={handleViewProfile}
          />

          {hasNextPage && (
            <div className="flex justify-center mt-12">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetching}
                className="min-w-[200px]"
              >
                {isFetching ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Charger plus de mentors"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucun mentor trouvé</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.
          </p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("");
              setDomainFilter("");
              setTopicFilter("");
            }}
            className="mt-2"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
