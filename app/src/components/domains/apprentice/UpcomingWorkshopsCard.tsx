"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Clock as ClockIcon,
  Sparkles,
} from "lucide-react";
import {
  formatDate,
  formatTimeRange,
  calculateEndTime,
} from "@/lib/workshop-utils";
import type { WorkshopDetailed } from "@ls-app/shared";

interface UpcomingWorkshopsCardProps {
  readonly workshops: WorkshopDetailed[] | undefined;
  readonly onCancelClick: (workshop: WorkshopDetailed) => void;
}

function getWorkshopStatus(workshop: WorkshopDetailed): "confirmed" | "pending" {
  return workshop.date && workshop.time ? "confirmed" : "pending";
}

function isWorkshopPast(workshop: WorkshopDetailed): boolean {
  if (!workshop.date || !workshop.time) return false;
  const endTime = calculateEndTime(workshop.date, workshop.time, workshop.duration);
  return endTime ? endTime < new Date() : false;
}

export function UpcomingWorkshopsCard({
  workshops,
  onCancelClick,
}: UpcomingWorkshopsCardProps) {
  const router = useRouter();

  return (
    <Card className="border-none shadow-md bg-white dark:bg-slate-950 overflow-hidden">
      <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Mes Ateliers à Venir
            </CardTitle>
            <CardDescription className="mt-1">
              Vos prochaines sessions d&apos;apprentissage
            </CardDescription>
          </div>
          {workshops && workshops.length > 0 && (
            <Badge
              variant="outline"
              className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800"
            >
              {workshops.length} à venir
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {workshops && workshops.length > 0 ? (
          <div className="space-y-4">
            {workshops.map((workshop) => {
              const status = getWorkshopStatus(workshop);
              return (
                <WorkshopItem
                  key={workshop.id}
                  workshop={workshop}
                  status={status}
                  onCancelClick={onCancelClick}
                  onDetailsClick={() => router.push(`/workshop/${workshop.id}`)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState onBrowse={() => router.push("/catalog")} />
        )}
      </CardContent>
    </Card>
  );
}

function WorkshopItem({
  workshop,
  status,
  onCancelClick,
  onDetailsClick,
}: {
  readonly workshop: WorkshopDetailed;
  readonly status: "confirmed" | "pending";
  readonly onCancelClick: (workshop: WorkshopDetailed) => void;
  readonly onDetailsClick: () => void;
}) {
  return (
    <div className="group relative bg-white dark:bg-slate-900 border rounded-xl p-5 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800">
      <div
        className={`absolute top-0 left-0 w-1 h-full rounded-l-xl transition-colors ${status === "confirmed" ? "bg-emerald-500" : "bg-blue-500"
          }`}
      ></div>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pl-2">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between md:justify-start md:gap-3">
            <h3 className="font-semibold text-lg leading-tight text-slate-900 dark:text-slate-100">
              {workshop.title}
            </h3>
            {status === "confirmed" ? (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 shadow-none">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Confirmé
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 shadow-none">
                <ClockIcon className="w-3 h-3 mr-1" />
                En attente
              </Badge>
            )}
          </div>

          {workshop.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {workshop.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
            {status === "confirmed" ? (
              <>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">{formatDate(workshop.date)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>{formatTimeRange(workshop.time, workshop.duration)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  {workshop.isVirtual ? (
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  ) : (
                    <MapPin className="w-4 h-4 text-slate-500" />
                  )}
                  <span>
                    {workshop.isVirtual
                      ? "En ligne"
                      : workshop.location || "Lieu à confirmer"}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md text-sm">
                <ClockIcon className="w-4 h-4" />
                <span>En attente de validation</span>
              </div>
            )}
          </div>

          {workshop.creator?.user?.name && (
            <div className="flex items-center gap-2 pt-1">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                {workshop.creator.user.name.charAt(0)}
              </div>
              <span className="text-sm text-muted-foreground">
                Mentor:{" "}
                <span className="font-medium text-foreground">
                  {workshop.creator.user.name}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col gap-2 mt-2 md:mt-0 md:min-w-[120px]">
          <Button
            size="sm"
            onClick={onDetailsClick}
            className="w-full shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Détails
          </Button>
          {status === "confirmed" && !isWorkshopPast(workshop) && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/30"
              onClick={() => onCancelClick(workshop)}
            >
              Annuler
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onBrowse }: { readonly onBrowse: () => void }) {
  return (
    <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
      <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Aucun atelier programmé
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Découvrez nos ateliers disponibles et commencez votre apprentissage dès
        maintenant !
      </p>
      <Button onClick={onBrowse} className="bg-indigo-600 hover:bg-indigo-700">
        Parcourir le Catalogue
      </Button>
    </div>
  );
}
