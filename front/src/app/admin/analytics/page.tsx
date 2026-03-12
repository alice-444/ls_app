"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import {
  Card,
  Title,
  Text,
  AreaChart,
  BarChart,
  DonutChart,
  Grid,
  Col,
  TabGroup,
  TabList,
  Tab,
  Flex,
  Metric,
  BadgeDelta,
  ProgressBar,
} from "@tremor/react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Users, BookOpen, CreditCard } from "lucide-react";
import type { AdminBIStats, AdminTimeRange } from "@ls-app/shared";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<AdminTimeRange>('30d');
  const { data: stats, isLoading } = trpc.admin.getAnalytics.useQuery({ timeRange });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Grid numItemsLg={4} className="gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </Grid>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!stats) return <div>Erreur lors du chargement des statistiques.</div>;

  const { credits, workshops, activityHeatmap } = stats;

  // Post-process heatmap for display
  // We'll show message activity by hour (summed across days in the range)
  const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    messages: 0,
    logins: 0,
  }));

  activityHeatmap.forEach((item: AdminBIStats['activityHeatmap'][0]) => {
    if (item.type === 'MESSAGE') hourlyActivity[item.hour].messages += item.count;
    else if (item.type === 'LOGIN') hourlyActivity[item.hour].logins += item.count;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ls-heading flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-brand" />
            Analyses de la Plateforme
          </h1>
          <p className="text-ls-muted mt-1">
            Analyse détaillée de l'activité et des performances de LearnSup.
          </p>
        </div>

        <TabGroup index={['7d', '30d', '90d', 'all'].indexOf(timeRange)} onIndexChange={(i) => setTimeRange(['7d', '30d', '90d', 'all'][i] as AdminTimeRange)}>
          <TabList variant="solid">
            <Tab>7 jours</Tab>
            <Tab>30 jours</Tab>
            <Tab>90 jours</Tab>
            <Tab>Tout</Tab>
          </TabList>
        </TabGroup>
      </div>

      {/* KPI Cards */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="orange">
          <Flex alignItems="start">
            <div>
              <Text>Total Crédits en Circulation</Text>
              <Metric>{credits.totalBalance.toLocaleString()}</Metric>
            </div>
            <CreditCard className="h-6 w-6 text-orange-500" />
          </Flex>
          <ProgressBar value={100} color="orange" className="mt-4" />
        </Card>

        <Card decoration="top" decorationColor="blue">
          <Flex alignItems="start">
            <div>
              <Text>Workshops Créés</Text>
              <Metric>{workshops.totalWorkshops}</Metric>
            </div>
            <BookOpen className="h-6 w-6 text-blue-500" />
          </Flex>
          <ProgressBar value={100} color="blue" className="mt-4" />
        </Card>

        <Card decoration="top" decorationColor="green">
          <Flex alignItems="start">
            <div>
              <Text>Flux Entrant (Top-ups)</Text>
              <Metric>{credits.totalTopUps.toLocaleString()}</Metric>
            </div>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </Flex>
          <ProgressBar value={credits.totalTopUps > 0 ? (credits.totalTopUps / (credits.totalTopUps + credits.totalUsage) * 100) : 0} color="green" className="mt-4" />
        </Card>

        <Card decoration="top" decorationColor="red">
          <Flex alignItems="start">
            <div>
              <Text>Flux Sortant (Usage)</Text>
              <Metric>{credits.totalUsage.toLocaleString()}</Metric>
            </div>
            <Users className="h-6 w-6 text-red-500" />
          </Flex>
          <ProgressBar value={credits.totalUsage > 0 ? (credits.totalUsage / (credits.totalTopUps + credits.totalUsage) * 100) : 0} color="red" className="mt-4" />
        </Card>
      </Grid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Credits Evolution */}
        <Card>
          <Title>Évolution des Crédits</Title>
          <Text>Historique des transactions (Top-up vs Usage)</Text>
          <AreaChart
            className="mt-6 h-80"
            data={credits.transactionsOverTime}
            index="date"
            categories={["amount"]}
            colors={["amber"]}
            valueFormatter={(number: number) => `${number.toLocaleString()} credits`}
            showLegend={false}
          />
        </Card>

        {/* Activity Heatmap (Hourly) */}
        <Card>
          <Title>Pics d'Activité par Heure</Title>
          <Text>Distribution des messages et connexions par heure de la journée</Text>
          <BarChart
            className="mt-6 h-80"
            data={hourlyActivity}
            index="hour"
            categories={["messages", "logins"]}
            colors={["blue", "violet"]}
            stack={true}
            valueFormatter={(number: number) => `${number.toLocaleString()} actions`}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workshops by Domain */}
        <Card>
          <Title>Workshops par Domaine</Title>
          <DonutChart
            className="mt-6"
            data={workshops.workshopsByDomain}
            category="count"
            index="domain"
            colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
          />
          <div className="mt-6 space-y-2">
            {workshops.workshopsByDomain.map((item: AdminBIStats['workshops']['workshopsByDomain'][0]) => (
              <Flex key={item.domain} className="text-sm">
                <Text>{item.domain}</Text>
                <BadgeDelta deltaType="unchanged" size="xs">
                  {item.count}
                </BadgeDelta>
              </Flex>
            ))}
          </div>
        </Card>

        {/* Workshops by Topic */}
        <Card className="lg:col-span-2">
          <Title>Workshops par Thématique</Title>
          <BarChart
            className="mt-6 h-80"
            data={workshops.workshopsByTopic}
            index="topic"
            categories={["count"]}
            colors={["blue"]}
            layout="vertical"
            valueFormatter={(number: number) => `${number.toLocaleString()}`}
          />
        </Card>
      </div>

      {/* Workshop Status Distribution */}
      <Card>
        <Title>Distribution des Statuts de Workshops</Title>
        <Grid numItemsMd={2} numItemsLg={4} className="mt-6 gap-4">
          {workshops.workshopsStatusDistribution.map((item: AdminBIStats['workshops']['workshopsStatusDistribution'][0]) => (
            <div key={item.status} className="p-4 border border-ls-border rounded-xl bg-ls-surface-elevated/5">
              <Text className="uppercase text-xs font-semibold tracking-wider">{item.status}</Text>
              <Metric className="mt-1">{item.count}</Metric>
            </div>
          ))}
        </Grid>
      </Card>
    </div>
  );
}
