"use client";

import React, { useState, useMemo, isValidElement, type ElementType, type ReactNode, type ReactElement } from "react";
import { trpc } from "@/utils/trpc";
import {
  AreaChart,
  BarChart,
  DonutChart,
  Flex,
  Text,
  BadgeDelta,
  ProgressBar,
} from "@tremor/react";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  CreditCard,
  Calendar,
  Maximize2,
  Clock,
  Layout
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
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

const TIME_RANGES: { value: AdminTimeRange; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: 'all', label: 'Tout' },
];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<AdminTimeRange>('30d');
  const { data: stats, isLoading } = trpc.admin.getAnalytics.useQuery({ timeRange });

  const hourlyActivity = useMemo(() => {
    if (!stats) return [];
    const heatmap = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}h`,
      messages: 0,
      logins: 0,
    }));

    stats.activityHeatmap.forEach((item: AdminBIStats['activityHeatmap'][0]) => {
      if (item.type === 'MESSAGE') heatmap[item.hour].messages += item.count;
      else if (item.type === 'LOGIN') heatmap[item.hour].logins += item.count;
    });
    return heatmap;
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
            title="Pics d'Activité par Heure"
            description="Messages et connexions par heure"
            icon={Clock}
          >
            <BarChart
              className="mt-4 h-80"
              data={hourlyActivity}
              index="hour"
              categories={["messages", "logins"]}
              colors={["blue", "violet"]}
              stack={true}
              valueFormatter={(number: number) => `${number.toLocaleString()}`}
              showGridLines={false}
            />
          </AnalyticsChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workshops by Domain */}
          <AnalyticsChartContainer
            title="Par Domaine"
            description="Répartition sectorielle"
            icon={Layout}
          >
            <DonutChart
              className="mt-4 h-64"
              data={workshops.workshopsByDomain}
              category="count"
              index="domain"
              colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
            />
            <div className="mt-6 space-y-2 overflow-y-auto max-h-32 pr-2 custom-scrollbar">
              {workshops.workshopsByDomain.map((item: AdminBIStats['workshops']['workshopsByDomain'][0]) => (
                <Flex key={item.domain} className="text-sm">
                  <Text className="truncate max-w-[150px]">{item.domain}</Text>
                  <BadgeDelta deltaType="unchanged" size="xs">
                    {item.count}
                  </BadgeDelta>
                </Flex>
              ))}
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
