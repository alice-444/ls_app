"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar } from "lucide-react";
import { WorkshopCalendar } from "@/components/domains/workshop/calendar/WorkshopCalendar";
import { formatCalendarMonthYear } from "@/lib/dashboard-utils";
import type { WorkshopDetailed } from "@ls-app/shared";

type CalendarView = "month" | "week" | "day" | "agenda";

interface CalendarSectionProps {
  readonly workshops: readonly WorkshopDetailed[];
  readonly calendarDate: Date;
  readonly calendarView: CalendarView;
  readonly onDateChange: (date: Date) => void;
  readonly onViewChange: (view: CalendarView) => void;
  readonly onNavigate: (action: "prev" | "next" | "today") => void;
  readonly onSelectEvent: (workshop: WorkshopDetailed) => void;
}

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: "month", label: "Mois" },
  { value: "week", label: "Semaine" },
  { value: "day", label: "Jour" },
  { value: "agenda", label: "Agenda" },
];

const NAV_ACTION_LABELS: Record<"today" | "prev" | "next", string> = {
  today: "Aujourd'hui",
  prev: "Précédent",
  next: "Suivant",
};

export function CalendarSection({
  workshops,
  calendarDate,
  calendarView,
  onDateChange,
  onViewChange,
  onNavigate,
  onSelectEvent,
}: CalendarSectionProps) {
  return (
    <Card className="mb-6 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:gap-[16px]">
          <div>
            <CardTitle className="flex items-center gap-2 text-ls-heading">
              <Calendar className="w-5 h-5" />
              Vue calendrier
            </CardTitle>
            <CardDescription className="text-ls-muted">
              Visualise tous tes ateliers dans un calendrier
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap gap-2">
              {(["today", "prev", "next"] as const).map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="border border-ls-border rounded-full h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-ls-heading"
                  onClick={() => onNavigate(action)}
                >
                  {NAV_ACTION_LABELS[action]}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {VIEW_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={calendarView === value ? "default" : "outline"}
                  size="sm"
                  className={`${calendarView === value
                      ? "bg-brand border border-brand text-[#161616]"
                      : "border border-brand text-brand"
                    } rounded-full h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold`}
                  onClick={() => onViewChange(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="mb-3 sm:mb-4">
            <p className="text-sm sm:text-base font-semibold text-ls-heading">
              {formatCalendarMonthYear(calendarDate)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {workshops.length > 0 ? (
          <div className="overflow-x-auto">
            <WorkshopCalendar
              workshops={workshops}
              height="600px"
              userRole="MENTOR"
              controlledDate={calendarDate}
              controlledView={calendarView}
              onDateChange={onDateChange}
              onViewChange={(view) => {
                if (["month", "week", "day", "agenda"].includes(view)) {
                  onViewChange(view as CalendarView);
                }
              }}
              onSelectEvent={onSelectEvent}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-ls-muted mb-4" />
            <p className="text-ls-muted">Aucun atelier à afficher</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
