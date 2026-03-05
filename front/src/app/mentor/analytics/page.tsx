"use client";

import { PageContainer, PageHeader } from "@/components/layout";
import { CashbackSummaryCard } from "@/components/dashboard/CashbackSummaryCard";
import { CashbackHistoryList } from "@/components/dashboard/CashbackHistoryList";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MentorAnalyticsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  
  const { data: summary, isLoading: isLoadingSummary } = trpc.cashbackAnalytics.getSummary.useQuery({
    from: dateRange.from ? new Date(dateRange.from) : undefined,
    to: dateRange.to ? new Date(dateRange.to) : undefined,
  });
  const { data: history, isLoading: isLoadingHistory } = trpc.cashbackAnalytics.getHistory.useQuery({ limit: 50 });

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <PageHeader
              title="Analyses et Gains"
              subtitle="Suivez vos gains de cashback et l'historique de vos ateliers."
            />
          </div>
          
          <div className="flex items-end gap-3 p-4 bg-white dark:bg-[#1a1720] border border-[#d6dae4] rounded-[16px]">
            <div className="grid gap-1.5">
              <Label htmlFor="from" className="text-xs text-[rgba(38,84,124,0.64)]">Du</Label>
              <Input
                id="from"
                type="date"
                className="h-9 text-xs w-36"
                value={dateRange.from || ""}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="to" className="text-xs text-[rgba(38,84,124,0.64)]">Au</Label>
              <Input
                id="to"
                type="date"
                className="h-9 text-xs w-36"
                value={dateRange.to || ""}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3"
              onClick={() => setDateRange({})}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoadingSummary ? (
            <Skeleton className="h-32 w-full rounded-[16px]" />
          ) : summary ? (
            <CashbackSummaryCard
              totalEarned={summary.totalEarned}
              byMonth={summary.byMonth}
            />
          ) : (
            <div className="p-6 border border-dashed border-[#d6dae4] rounded-[16px] flex items-center justify-center text-[rgba(38,84,124,0.64)]">
              Aucune donnée de synthèse disponible
            </div>
          )}
          
          <div className="md:col-span-2 p-6 border border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-[#26547c] dark:text-[#e6e6e6]">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-lg">Tendance des gains</span>
            </div>
            <p className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
              {summary && summary.byMonth.length > 0 
                ? `Vous avez cumulé des gains sur ${summary.byMonth.length} mois.`
                : "Commencez à donner des ateliers pour voir vos tendances de gains ici."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold text-[#26547c] dark:text-[#e6e6e6]">
            Historique détaillé des cashbacks
          </h3>
          {isLoadingHistory ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-[12px]" />
              <Skeleton className="h-16 w-full rounded-[12px]" />
              <Skeleton className="h-16 w-full rounded-[12px]" />
            </div>
          ) : history ? (
            <CashbackHistoryList items={history.items} />
          ) : (
            <div className="text-center py-12 border border-dashed border-[#d6dae4] rounded-[16px] text-[rgba(38,84,124,0.64)]">
              Aucun historique trouvé
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
