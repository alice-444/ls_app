"use client";

import React, { useState, useMemo, isValidElement, type ElementType, type ReactNode, type ReactElement } from "react";
import { trpc } from "@/utils/trpc";
import {
  AreaChart,
  BarChart,
  BarList,
  Flex,
  Text,
  ProgressBar,
} from "@tremor/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  CreditCard,
  Calendar,
  Maximize2,
  Clock,
  Layout,
  Info
} from "lucide-react";
import type { AdminBIStats, AdminTimeRange } from "@ls-app/shared";
import { PageContainer } from "@/components/shared/layout/PageContainer";
import ShinyText from "@/components/ui/ShinyText";
import { motion, AnimatePresence } from "framer-motion";
import RollingNumber from "@/components/ui/RollingNumber";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TIME_RANGES: { value: AdminTimeRange; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: 'all', label: 'Tout' },
];

const DAYS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const DAYS_SHORT_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<AdminTimeRange>('30d');
  const { data: stats, isLoading } = trpc.admin.getAnalytics.useQuery({ timeRange });

  const activityHeatmapMatrix = useMemo(() => {
    if (!stats) return { matrix: [], maxCount: 0 };

    // Matrix 7 days x 24 hours
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
    let maxCount = 0;

    stats.activityHeatmap.forEach((item: AdminBIStats['activityHeatmap'][0]) => {
      // Correct for local timezone
      // Using a reference Sunday (2024-01-07) to handle day shift correctly
      const refDate = new Date(Date.UTC(2024, 0, 7 + item.dayOfWeek, item.hour));
      const localDay = refDate.getDay();
      const localHour = refDate.getHours();

      matrix[localDay][localHour] += item.count;
      if (matrix[localDay][localHour] > maxCount) maxCount = matrix[localDay][localHour];
    });

    return { matrix, maxCount };
  }, [stats]);

  const sortedDomains = useMemo(() => {
    if (!stats) return [];
    return [...stats.workshops.workshopsByDomain]
      .sort((a, b) => b.count - a.count)
      .map(item => ({
        name: item.domain,
        value: item.count,
      }));
  }, [stats]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 rounded-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!stats) return <PageContainer>Erreur lors du chargement des statistiques.</PageContainer>;

  const { credits, workshops } = stats;

  return (
    <PageContainer>
      <motion.div
        className="space-y-8 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-brand" />
              <ShinyText text="Analyses Plateforme" />
            </h1>
            <p className="text-ls-muted mt-2 text-lg">
              Suis l'activité &amp; la croissance de LearnSup en temps réel.
            </p>
          </div>

          {/* Improved Filter UI */}
          <div className="flex bg-card/40 backdrop-blur-md border border-border/50 p-1 rounded-full shadow-inner relative overflow-hidden">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full z-10 ${timeRange === range.value
                  ? "text-ls-heading"
                  : "text-ls-muted hover:text-ls-heading"
                  }`}
              >
                {timeRange === range.value && (
                  <motion.div
                    layoutId="activeRange"
                    className="absolute inset-0 bg-brand rounded-full shadow-lg shadow-brand/20 -z-10"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Crédits en Circulation"
            value={credits.totalBalance}
            icon={CreditCard}
            color="amber"
          />
          <MetricCard
            title="Workshops Créés"
            value={workshops.totalWorkshops}
            icon={BookOpen}
            color="blue"
          />
          <MetricCard
            title="Flux Entrant (Top-ups)"
            value={credits.totalTopUps}
            icon={TrendingUp}
            color="emerald"
            progress={credits.totalTopUps > 0 ? (credits.totalTopUps / (credits.totalTopUps + credits.totalUsage) * 100) : 0}
          />
          <MetricCard
            title="Flux Sortant (Usage)"
            value={credits.totalUsage}
            icon={Users}
            color="rose"
            progress={credits.totalUsage > 0 ? (credits.totalUsage / (credits.totalTopUps + credits.totalUsage) * 100) : 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Credits Evolution Chart */}
          <AnalyticsChartContainer
            title="Évolution des Crédits"
            description="Historique des transactions (Usage global)"
            icon={Calendar}
          >
            <AreaChart
              className="mt-4 h-80"
              data={credits.transactionsOverTime}
              index="date"
              categories={["amount"]}
              colors={["amber"]}
              valueFormatter={(number: number) => `${number.toLocaleString()} cr`}
              showLegend={false}
              showGridLines={false}
              curveType="monotone"
            />
          </AnalyticsChartContainer>

          {/* Activity Heatmap Chart */}
          <AnalyticsChartContainer
            title="Pics d'Activité (Heatmap)"
            description="Activité cumulée par jour et par heure (Heure locale)"
            icon={Clock}
          >
            <div className="mt-4 flex flex-col">
              <div className="flex justify-end items-center gap-4 mb-4 text-[10px] text-ls-muted">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm bg-brand/10" /> <span>Faible</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm bg-brand" /> <span>Élevé</span>
                </div>
              </div>

              <div className="relative overflow-x-auto pb-4 custom-scrollbar">
                <div className="min-w-[500px]">
                  {/* Hours Header */}
                  <div className="flex mb-2 ml-10">
                    {[0, 6, 12, 18, 23].map((h) => (
                      <div
                        key={h}
                        className="text-[9px] text-ls-muted font-medium"
                        style={{ marginLeft: h === 0 ? '0' : `calc(${(h / 24) * 100}% - ${h === 23 ? '20px' : '10px'})` }}
                      >
                        {h}h
                      </div>
                    ))}
                  </div>

                  {/* Heatmap Grid */}
                  <div className="space-y-1">
                    {DAYS_SHORT_FR.map((day, dayIdx) => (
                      <div key={day} className="flex items-center">
                        <div className="w-10 text-[10px] font-bold text-ls-muted uppercase tracking-tighter">
                          {day}
                        </div>
                        <div className="flex flex-1 gap-1">
                          {Array.from({ length: 24 }).map((_, hourIdx) => {
                            const count = activityHeatmapMatrix.matrix[dayIdx]?.[hourIdx] || 0;
                            const intensity = activityHeatmapMatrix.maxCount > 0
                              ? (count / activityHeatmapMatrix.maxCount)
                              : 0;

                            return (
                              <motion.div
                                key={hourIdx}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: (dayIdx * 24 + hourIdx) * 0.001 }}
                                title={`${DAYS_FR[dayIdx]} - ${hourIdx}h : ${count.toLocaleString()} activités`}
                                className="flex-1 aspect-square rounded-sm transition-all duration-300 hover:ring-2 hover:ring-brand hover:z-10"
                                style={{
                                  backgroundColor: count === 0
                                    ? 'rgba(255, 182, 71, 0.05)'
                                    : `rgba(255, 182, 71, ${Math.max(0.1, intensity)})`,
                                  border: count > 0 ? '1px solid rgba(255, 182, 71, 0.2)' : 'none'
                                }}
                              />);
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-ls-muted italic">
                <Info className="h-3 w-3" />
                <span>Données ajustées à votre fuseau horaire ({Intl.DateTimeFormat().resolvedOptions().timeZone}).</span>
              </div>
            </div>
          </AnalyticsChartContainer>
        </div>

        {/* Workshop Success & Community Mapping Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workshop Success Metrics */}
          <AnalyticsChartContainer
            title="Succès des Ateliers"
            description="Taux de complétion vs annulation"
            icon={TrendingUp}
          >
            <div className="mt-6 space-y-6">
              <div>
                <Flex>
                  <Text className="text-ls-muted">Taux de Complétion</Text>
                  <Text className="font-bold text-emerald-500">{workshops.completionRate.toFixed(1)}%</Text>
                </Flex>
                <ProgressBar value={workshops.completionRate} color="emerald" className="mt-2" />
              </div>
              <div>
                <Flex>
                  <Text className="text-ls-muted">Taux d'Annulation</Text>
                  <Text className="font-bold text-rose-500">{workshops.cancellationRate.toFixed(1)}%</Text>
                </Flex>
                <ProgressBar value={workshops.cancellationRate} color="rose" className="mt-2" />
              </div>
              <div className="pt-4 border-t border-border/30">
                <Flex>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand" />
                    <Text className="text-ls-muted">Temps moyen de complétion</Text>
                  </div>
                  <Text className="font-bold text-ls-heading">{workshops.averageCompletionTime.toFixed(1)}h</Text>
                </Flex>
              </div>
            </div>
          </AnalyticsChartContainer>

          {/* Community Mapping: Supply vs Demand */}
          <div className="lg:col-span-2">
            <AnalyticsChartContainer
              title="Cartographie Offre vs Demande"
              description="Mentors disponibles vs Ateliers créés par domaine"
              icon={Users}
            >
              <BarChart
                className="mt-4 h-80"
                data={stats.communityMap}
                index="domain"
                categories={["supply", "demand"]}
                colors={["emerald", "blue"]}
                valueFormatter={(number: number) => `${number.toLocaleString()}`}
                showLegend={true}
                showGridLines={false}
              />
            </AnalyticsChartContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workshops by Domain */}
          <AnalyticsChartContainer
            title="Répartition par Domaine"
            description="Classement des secteurs par volume d'ateliers"
            icon={Layout}
          >
            <div className="mt-6">
              <BarList
                data={sortedDomains}
                className="mt-2"
                color="orange"
                valueFormatter={(number: number) => `${number} ateliers`}
              />

              {sortedDomains.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-ls-muted">
                  <Info className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </AnalyticsChartContainer>

          {/* Workshops by Topic Chart */}
          <div className="lg:col-span-2">
            <AnalyticsChartContainer
              title="Workshops par Thématique"
              description="Top des sujets abordés"
              icon={BookOpen}
            >
              <BarChart
                className="mt-4 h-96"
                data={workshops.workshopsByTopic}
                index="topic"
                categories={["count"]}
                colors={["indigo"]}
                layout="vertical"
                showGridLines={false}
                valueFormatter={(number: number) => `${number.toLocaleString()}`}
              />
            </AnalyticsChartContainer>
          </div>
        </div>

        {/* Workshop Status Cards */}
        <AnalyticsChartContainer
          title="Statuts des Workshops"
          description="État actuel de tous les ateliers créés"
          icon={TrendingUp}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {workshops.workshopsStatusDistribution.map((item: AdminBIStats['workshops']['workshopsStatusDistribution'][0]) => (
              <motion.div
                key={item.status}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 rounded-2xl border border-border/50 bg-ls-surface-elevated/5 backdrop-blur-sm group transition-all duration-300"
              >
                <Text className="uppercase text-[10px] font-black tracking-[0.2em] text-ls-muted group-hover:text-brand transition-colors">
                  {item.status}
                </Text>
                <div className="mt-2 text-3xl font-bold text-ls-heading">
                  <RollingNumber value={item.count} />
                </div>
                <div className="mt-3 w-full bg-border/30 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / workshops.totalWorkshops) * 100}%` }}
                    className="bg-brand h-full"
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </AnalyticsChartContainer>
      </motion.div>
    </PageContainer>
  );
}

// Sub-components for better organization and quality
interface MetricCardProps {
  title: string;
  value: number;
  icon: ElementType; // Lucide icon component
  color: "amber" | "blue" | "emerald" | "rose";
  progress?: number;
}

function MetricCard({ title, value, icon: Icon, color, progress }: Readonly<MetricCardProps>) {
  const colors: Record<MetricCardProps["color"], string> = {
    amber: "from-amber-500/20 to-orange-500/20 text-amber-500",
    blue: "from-blue-500/20 to-indigo-500/20 text-blue-500",
    emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-500",
    rose: "from-rose-500/20 to-pink-500/20 text-rose-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative p-6 rounded-3xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden group"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl bg-gradient-to-br ${colors[color]} opacity-30 group-hover:opacity-60 transition-opacity`} />

      <Flex alignItems="start">
        <div className="flex-1">
          <Text className="text-ls-muted font-medium mb-1">{title}</Text>
          <div className="text-3xl font-black text-ls-heading">
            <RollingNumber value={value} />
          </div>
        </div>
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors[color]} shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
      </Flex>

      {progress === undefined ? (
        <div className="mt-6 h-1 w-full bg-border/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className={`absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-${color}-500 to-transparent opacity-50`}
          />
        </div>
      ) : (
        <ProgressBar value={progress} color={color} className="mt-6" />
      )}
    </motion.div>
  );
}

interface AnalyticsChartContainerProps {
  title: string;
  description?: string;
  icon: ElementType; // Lucide icon component
  children: ReactNode;
}

function AnalyticsChartContainer({ title, description, icon: Icon, children }: Readonly<AnalyticsChartContainerProps>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CardContainer>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand/10 text-brand">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-ls-heading text-lg">{title}</h3>
            {description && <Text className="text-xs text-ls-muted">{description}</Text>}
          </div>
        </div>

        {/* Chart Detail Dialog Trigger */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-brand/10 hover:text-brand transition-all">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-[95vw] bg-card/95 backdrop-blur-2xl border-border/50 rounded-3xl p-8">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-brand/10 text-brand">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black text-ls-heading">
                    <ShinyText text={title} />
                  </DialogTitle>
                  {description && <Text className="text-lg text-ls-muted mt-1">{description}</Text>}
                </div>
              </div>
            </DialogHeader>

            <div className="bg-ls-surface-elevated/5 rounded-3xl border border-border/30 p-8 min-h-[500px] flex flex-col justify-center">
              {/* Clone the children but with higher height for the modal */}
              {React.Children.map(children, (child) => {
                if (isValidElement<{ className?: string }>(child) && child.props.className?.includes('h-80')) {
                  return <div key={child.key} className="w-full h-[450px]">{child}</div>
                }
                return child;
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setIsOpen(false)} className="rounded-full px-8 bg-brand text-ls-heading font-bold">
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative">
        {children}
      </div>
    </CardContainer>
  );
}

interface CardContainerProps {
  children: ReactNode;
}

function CardContainer({ children }: Readonly<CardContainerProps>) {
  return (
    <div className="p-8 rounded-[32px] border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl relative group overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}
