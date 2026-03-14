"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ExternalLink,
  History,
  Coins,
  AlertCircle,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/workshop-utils";
import type { WorkshopDetailed } from "@ls-app/shared";

interface ApprenticeSidebarProps {
  readonly workshopHistory: WorkshopDetailed[] | undefined;
  readonly titleData: { title?: string } | undefined;
}

function getWorkshopFinalStatus(workshop: WorkshopDetailed): string {
  if (workshop.status === "CANCELLED") return "Annulé";
  if (workshop.apprenticeAttendanceStatus === "NO_SHOW") return "Absent";
  return "Terminé";
}

export function ApprenticeSidebar({
  workshopHistory,
  titleData,
}: ApprenticeSidebarProps) {
  const router = useRouter();
  const creditBalance = 999;
  const isLowBalance = false;

  return (
    <div className="lg:col-span-4 space-y-6">
      <CreditCard creditBalance={creditBalance} isLowBalance={isLowBalance} />
      <ProgressionCard
        completedCount={workshopHistory?.length || 0}
        title={titleData?.title ?? "Explorer"}
      />
      <HistoryCard workshopHistory={workshopHistory} router={router} />
      <NetworkCard router={router} />
    </div>
  );
}

function CreditCard({
  creditBalance,
  isLowBalance,
}: {
  readonly creditBalance: number;
  readonly isLowBalance: boolean;
}) {
  return (
    <Card className="bg-linear-to-br from-violet-600 to-indigo-600 text-white border-0 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>
      <CardContent className="pt-6 relative z-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-2 rounded-lg">
              <Coins className="w-6 h-6 text-white" />
            </div>
            {isLowBalance && (
              <Badge
                variant="destructive"
                className="bg-red-500/90 hover:bg-red-500 text-white border-0"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Solde faible
              </Badge>
            )}
          </div>
          <div>
            <p className="text-sm text-violet-100 font-medium mb-1">
              Solde de crédits
            </p>
            <p className="text-4xl font-bold tracking-tight">{creditBalance}</p>
          </div>
          {isLowBalance && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-2 bg-white/20 hover:bg-white/30 text-white border-0"
            >
              Recharger
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressionCard({
  completedCount,
  title,
}: {
  readonly completedCount: number;
  readonly title: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Progression
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {completedCount}
          </span>
          <span className="text-sm text-muted-foreground mb-1.5">
            ateliers terminés
          </span>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">
              Titre selon ta progression
            </span>
            <span className="font-medium">{title}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[25%] rounded-full"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryCard({
  workshopHistory,
  router,
}: {
  readonly workshopHistory: WorkshopDetailed[] | undefined;
  readonly router: ReturnType<typeof useRouter>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <History className="w-4 h-4 text-muted-foreground" />
          Historique récent
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        {workshopHistory && workshopHistory.length > 0 ? (
          <div className="divide-y">
            {workshopHistory.slice(0, 3).map((workshop) => {
              const finalStatus = getWorkshopFinalStatus(workshop);
              return (
                <div
                  key={workshop.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm line-clamp-1 text-slate-900 dark:text-slate-100">
                      {workshop.title}
                    </h4>
                    <Badge
                      variant={
                        finalStatus === "Annulé" || finalStatus === "Absent"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px] h-5 px-1.5"
                    >
                      {finalStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(workshop.date)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        router.push(`/workshop/${workshop.id}`)
                      }
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400 hover:text-indigo-600" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {workshopHistory.length > 3 && (
              <div className="p-3 text-center border-t bg-slate-50/50 dark:bg-slate-900/30">
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs h-auto p-0"
                >
                  Voir tout ({workshopHistory.length})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 px-4 text-muted-foreground">
            <p className="text-sm">Aucun historique</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NetworkCard({
  router,
}: {
  readonly router: ReturnType<typeof useRouter>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Users className="w-4 h-4 text-muted-foreground" />
          Mon Réseau
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connectez-vous avec des mentors et des apprenants
          </p>
          <div className="flex -space-x-2 overflow-hidden py-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-500"
              >
                ?
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => router.push("/catalog")}
          >
            <Users className="w-3 h-3 mr-2" />
            Construire mon réseau
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
