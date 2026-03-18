"use client";

import { PageContainer } from "@/components/shared/layout";
import { CashbackSummaryCard } from "@/components/domains/dashboard/CashbackSummaryCard";
import { CashbackHistoryList } from "@/components/domains/dashboard/CashbackHistoryList";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import ShinyText from "@/components/ui/ShinyText";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function MentorAnalyticsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});

  const breadcrumbItems = [
    { label: "Tableau de bord", href: "/dashboard" },
    { label: "Analyses et Gains" },
  ];

  const { data: summary, isLoading: isLoadingSummary } =
    trpc.cashbackAnalytics.getSummary.useQuery({
      from: dateRange.from ? new Date(dateRange.from) : undefined,
      to: dateRange.to ? new Date(dateRange.to) : undefined,
    });
  const { data: history, isLoading: isLoadingHistory } =
    trpc.cashbackAnalytics.getHistory.useQuery({ limit: 50 });

  const renderSummaryCard = () => {
    if (isLoadingSummary) {
      return <Skeleton className="h-36 w-full rounded-2xl" />;
    }
    if (summary) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CashbackSummaryCard
            totalEarned={summary.totalEarned}
            byMonth={summary.byMonth}
          />
        </motion.div>
      );
    }
    return (
      <Card className="border-2 border-dashed border-border/50 rounded-2xl bg-card/50 flex items-center justify-center min-h-[140px]">
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-ls-muted/50 mb-3" />
          <p className="text-sm text-ls-muted">
            Aucune donnée de synthèse disponible
          </p>
        </CardContent>
      </Card>
    );
  };

  const renderHistorySection = () => {
    if (isLoadingHistory) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      );
    }
    if (history) {
      return <CashbackHistoryList items={history.items} />;
    }
    return (
      <Card className="border-2 border-dashed border-border/50 rounded-2xl bg-card/50">
        <CardContent className="py-16 text-center">
          <BarChart3 className="h-16 w-16 mx-auto text-ls-muted/40 mb-4" />
          <p className="text-ls-muted">Aucun historique trouvé</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageContainer>
      <motion.div
        className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Breadcrumb items={breadcrumbItems} />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full shrink-0 hover:bg-brand-soft group"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5 text-ls-heading group-hover:text-brand transition-colors" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <ShinyText text="Analyses et Gains" />
              </h1>
              <p className="text-base sm:text-lg text-ls-muted mt-2">
                Suivez vos gains de cashback et l'historique de vos ateliers.
              </p>
            </div>
          </div>

          <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-sm shadow-lg hover:border-brand/20 transition-all duration-300">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-end gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="from" className="text-xs text-ls-muted font-medium">
                    Du
                  </Label>
                  <Input
                    id="from"
                    type="date"
                    className="h-9 text-sm w-36 border-border bg-ls-input-bg hover:border-brand/50 focus:border-brand transition-colors rounded-xl"
                    value={dateRange.from || ""}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, from: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="to" className="text-xs text-ls-muted font-medium">
                    Au
                  </Label>
                  <Input
                    id="to"
                    type="date"
                    className="h-9 text-sm w-36 border-border bg-ls-input-bg hover:border-brand/50 focus:border-brand transition-colors rounded-xl"
                    value={dateRange.to || ""}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, to: e.target.value }))
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-xl border-border hover:bg-brand-soft hover:border-brand"
                  onClick={() => setDateRange({})}
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderSummaryCard()}

          <Card className="md:col-span-2 border border-border/50 rounded-2xl bg-card/95 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-brand/30 transition-all duration-300">
            <CardContent className="p-6 sm:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
                  <TrendingUp className="h-5 w-5 text-brand" />
                </div>
                <span className="font-semibold text-lg text-ls-heading">
                  Tendance des gains
                </span>
              </div>
              <p className="text-sm text-ls-muted leading-relaxed">
                {summary && summary.byMonth.length > 0
                  ? `Vous avez cumulé des gains sur ${summary.byMonth.length} mois.`
                  : "Commencez à donner des ateliers pour voir vos tendances de gains ici."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* History section */}
        <motion.section
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-ls-heading flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand rounded-full" aria-hidden />
            {" "}
            Historique détaillé des cashbacks
          </h2>
          {renderHistorySection()}
        </motion.section>
      </motion.div>
    </PageContainer>
  );
}
