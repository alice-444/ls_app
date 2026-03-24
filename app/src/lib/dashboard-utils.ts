// Format date helper
export const formatWorkshopDate = (date: Date | string | null) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Format calendar month/year display
export const formatCalendarMonthYear = (date: Date) => {
  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
};

// Calendar navigation helper
export const createNavigateCalendar = (
  currentDate: Date,
  currentView: "month" | "week" | "day" | "agenda",
  setDate: (date: Date) => void
) => {
  return (direction: "prev" | "next" | "today") => {
    const newDate = new Date(currentDate);

    if (direction === "today") {
      setDate(new Date());
    } else if (direction === "prev") {
      if (currentView === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (currentView === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else if (currentView === "day") {
        newDate.setDate(newDate.getDate() - 1);
      }
      setDate(newDate);
    } else if (direction === "next") {
      if (currentView === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (currentView === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else if (currentView === "day") {
        newDate.setDate(newDate.getDate() + 1);
      }
      setDate(newDate);
    }
  };
};
