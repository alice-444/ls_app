"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { MentorsGrid } from "@/components/domains/mentor/MentorsGrid";
import { MentorFilters } from "@/components/domains/mentor/MentorFilters";
import { Button } from "@/components/ui/button";
import { Loader2, Users } from "lucide-react";
import { authClient } from "@/lib/auth-server-client";
import { PageContainer } from "@/components/shared/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import type { MentorBasic } from "@ls-app/shared";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { useEffect } from "react";

export default function MentorsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (!isSessionPending && !isLoadingRole && userRole === "MENTOR") {
      router.push("/dashboard");
    }
  }, [userRole, isLoadingRole, isSessionPending, router]);

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

  const renderMentorsContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-brand mx-auto mb-4" />
            <p className="text-ls-muted">Chargement des mentors...</p>
          </div>
        </div>
      );
    }
    if (filteredMentors.length > 0) {
      return (
        <>
          <MentorsGrid
            mentors={filteredMentors}
            onViewProfile={handleViewProfile}
          />

          {hasNextPage && (
            <div className="flex justify-center mt-12">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetching}
                variant="ctaOutline" size="cta" className="min-w-[200px]"
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
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10 text-brand mb-6">
          <Users className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-ls-heading">Aucun mentor trouvé</h2>
        <p className="text-ls-muted text-center max-w-md mb-6">
          Essaie de modifier tes filtres ou ta recherche pour trouver ce que tu cherches.
        </p>
        <Button
          onClick={() => {
            setSearchQuery("");
            setDomainFilter("");
            setTopicFilter("");
          }}
          variant="ctaOutline" size="cta"
        >
          Réinitialiser les filtres
        </Button>
      </div>
    );
  };

  if (isSessionPending || isLoadingRole || userRole === "MENTOR") {
    return (
      <PageContainer className="py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-brand mb-4" />
          <p className="text-ls-muted">Vérification des accès...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-4 sm:py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF8C42] via-[#FFB647] to-[#FF8C42] text-white shadow-lg shadow-[#FF8C42]/25">
            <Users className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <ShinyText text="Découvre nos mentors" />
        </h1>
        <p className="text-base sm:text-lg text-ls-muted mt-2">
          Trouve l&apos;expert qui t&apos;accompagnera dans ton apprentissage.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <MentorFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          domainFilter={domainFilter}
          onDomainFilterChange={setDomainFilter}
          topicFilter={topicFilter}
          onTopicFilterChange={setTopicFilter}
        />

        {renderMentorsContent()}
      </motion.div>
    </PageContainer>
  );
}
