"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar } from "lucide-react";
import { WorkshopCalendar } from "@/components/domains/workshop/calendar/WorkshopCalendar";
import { formatCalendarMonthYear } from "@/lib/dashboard-utils";
import type { WorkshopDetailed } from "@ls-app/shared";

const CALENDAR_VIEWS = ["month", "week", "day", "agenda"] as const;
type CalendarView = (typeof CALENDAR_VIEWS)[number];

const VIEW_LABELS: Record<CalendarView, string> = {
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Agenda",
};

const VIEW_BUTTON_CLASS =
  "rounded-none h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm";
const VIEW_ACTIVE_CLASS =
  "bg-[#ffb647] border border-[#ffb647] text-[#161616]";
const VIEW_INACTIVE_CLASS =
  "border border-[#ffb647] text-[#ffb647] dark:text-[#ffb647]";

export function MentorDashboardCalendar({
  workshops,
  calendarDate,
  calendarView,
  onDateChange,
  onViewChange,
  onNavigate,
}: Readonly<{
  workshops: WorkshopDetailed[];
  calendarDate: Date;
  calendarView: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (action: "today" | "prev" | "next") => void;
}>) {
  const router = useRouter();
  const hasWorkshops = workshops && workshops.length > 0;

  if (!hasWorkshops) {
    return (
      <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
            <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
              <div className="flex items-center gap-2 sm:gap-[7.5px]">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-brand" />
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ls-heading">
                  Calendrier de mes ateliers
                </h3>
              </div>
              <p className="text-sm sm:text-base text-ls-muted tracking-[-0.8px]">
                Vue d&apos;ensemble de tes ateliers
              </p>
            </div>
            <div className="text-center py-12 bg-card/50 border-2 border-dashed border-border/50 rounded-3xl">
              <Calendar className="h-12 w-12 text-ls-muted/30 mx-auto mb-4" />
              <p className="text-ls-muted italic mb-4">
                Tu n&apos;as pas encore d&apos;ateliers programmés.
              </p>
              <Button
                variant="cta"
                size="cta"
                onClick={() => router.push("/workshop-editor?new=true")}
              >
                Créer mon premier atelier
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px]">
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-[16px]">
            <div className="flex items-center gap-2 sm:gap-[7.5px]">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-brand" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ls-heading">
                Calendrier de mes ateliers
              </h3>
            </div>
            <p className="text-sm sm:text-base text-ls-muted tracking-[-0.8px]">
              Vue d&apos;ensemble de tes ateliers
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ctaOutline"
                size="ctaSm"
                onClick={() => onNavigate("today")}
              >
                Aujourd&apos;hui
              </Button>
              <Button
                variant="ctaOutline"
                size="ctaSm"
                onClick={() => onNavigate("prev")}
              >
                Précédent
              </Button>
              <Button
                variant="ctaOutline"
                size="ctaSm"
                onClick={() => onNavigate("next")}
              >
                Suivant
              </Button>
            </div>
            <div className="flex items-center flex-wrap gap-0">
              {CALENDAR_VIEWS.map((view, i) => (
                <Button
                  key={view}
                  variant={calendarView === view ? "default" : "outline"}
                  size="sm"
                  className={`${VIEW_BUTTON_CLASS} ${calendarView === view ? VIEW_ACTIVE_CLASS : VIEW_INACTIVE_CLASS
                    } ${i === 0 ? "rounded-l-[8px] rounded-r-0" : ""} ${i === CALENDAR_VIEWS.length - 1 ? "rounded-r-[8px] rounded-l-0" : ""
                    }`}
                  onClick={() => onViewChange(view)}
                >
                  {VIEW_LABELS[view]}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-3 sm:mb-4">
            <p className="text-sm sm:text-base font-semibold text-[#26547c] dark:text-[#e6e6e6]">
              {formatCalendarMonthYear(calendarDate)}
            </p>
          </div>

          <div className="overflow-x-auto">
            <WorkshopCalendar
              workshops={workshops}
              height="400px"
              userRole="MENTOR"
              controlledDate={calendarDate}
              controlledView={calendarView}
              onDateChange={onDateChange}
              onViewChange={(view) => {
                if (CALENDAR_VIEWS.includes(view as CalendarView)) {
                  onViewChange(view as CalendarView);
                }
              }}
              onSelectEvent={(workshop) => {
                router.push(`/workshop/${workshop.id}`);
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
