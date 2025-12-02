"use client";

import { useMemo, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./WorkshopCalendar.css";
import type { WorkshopBasic } from "@/types/workshop";
import { calculateEndTime } from "@/lib/workshop-utils";

const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => {
    return 1;
  },
  getDay,
  locales,
});

interface WorkshopCalendarProps {
  workshops: WorkshopBasic[];
  height?: string;
  onSelectEvent: (workshop: WorkshopBasic) => void;
  showOnlyConfirmed?: boolean;
  userRole?: "MENTOR" | "APPRENANT";
}

export function WorkshopCalendar({
  workshops,
  height = "600px",
  onSelectEvent,
  showOnlyConfirmed = false,
  userRole,
}: WorkshopCalendarProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const events = useMemo(() => {
    return workshops
      .filter((workshop) => {
        if (!workshop.date || !workshop.time) return false;

        if (showOnlyConfirmed && userRole === "APPRENANT") {
          return workshop.status === "PUBLISHED";
        }

        if (userRole === "MENTOR") {
          return workshop.status === "PUBLISHED" || workshop.status === "DRAFT";
        }

        return workshop.status === "PUBLISHED";
      })
      .map((workshop) => {
        try {
          const date = workshop.date!;
          const time = workshop.time!;

          const dateValue = date instanceof Date ? date : new Date(date);

          if (isNaN(dateValue.getTime())) {
            console.warn(`Date invalide pour l'atelier ${workshop.id}:`, date);
            return null;
          }

          const startDate = new Date(dateValue);
          const timeParts = time.split(":");
          if (timeParts.length < 2) {
            console.warn(
              `Format de temps invalide pour l'atelier ${workshop.id}:`,
              time
            );
            return null;
          }

          const [hours, minutes] = timeParts.map(Number);
          if (isNaN(hours) || isNaN(minutes)) {
            console.warn(`Heure invalide pour l'atelier ${workshop.id}:`, time);
            return null;
          }

          startDate.setHours(hours, minutes, 0, 0);

          const endDate =
            calculateEndTime(dateValue, time, workshop.duration || 60) ||
            new Date(startDate.getTime() + (workshop.duration || 60) * 60000);

          return {
            id: workshop.id,
            title: workshop.title,
            start: startDate,
            end: endDate,
            resource: workshop,
          };
        } catch (error) {
          console.error(
            `Erreur lors de la création de l'événement pour l'atelier ${workshop.id}:`,
            error
          );
          return null;
        }
      })
      .filter((event): event is NonNullable<typeof event> => event !== null);
  }, [workshops, showOnlyConfirmed, userRole]);

  const eventStyleGetter = (event: any) => {
    const workshop = event.resource as WorkshopBasic;
    let backgroundColor = "#26547C";

    if (workshop.isVirtual) {
      backgroundColor = "#4A90E2";
    } else {
      backgroundColor = "#26547C";
    }

    if (userRole === "APPRENANT") {
      backgroundColor = "#10B981";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        padding: "2px 4px",
      },
    };
  };

  const handleSelectEvent = (event: any) => {
    if (event.resource) {
      onSelectEvent(event.resource);
    }
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  return (
    <div style={{ height, width: "100%" }} className="rbc-calendar">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        view={view}
        date={date}
        onView={handleViewChange}
        onNavigate={handleNavigate}
        messages={{
          next: "Suivant",
          previous: "Précédent",
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          agenda: "Agenda",
          date: "Date",
          time: "Heure",
          event: "Événement",
          noEventsInRange:
            events.length === 0
              ? workshops.length === 0
                ? "Aucun atelier disponible"
                : "Les ateliers disponibles n'ont pas de date/heure programmée ou ne sont pas publiés"
              : "Aucun atelier programmé pour cette période",
          showMore: (total: number) => `+ ${total} autres`,
        }}
        culture="fr"
        views={["month", "week", "day", "agenda"]}
      />
    </div>
  );
}
