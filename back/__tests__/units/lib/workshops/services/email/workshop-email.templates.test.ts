import { describe, it, expect } from "vitest";
import { WorkshopEmailTemplates } from "../../../../../../src/lib/workshops/services/email/workshop-email.templates";

describe("WorkshopEmailTemplates.cancellation", () => {
  const data = {
    recipientName: "Alice",
    apprenticeName: "Bob",
    workshopTitle: "React Basics",
    workshopDate: new Date(2026, 2, 15),
    workshopTime: "14:00",
    workshopId: "ws-123",
  };

  it("sets a relevant subject", () => {
    const result = WorkshopEmailTemplates.cancellation(data);
    expect(result.subject).toContain("React Basics");
    expect(result.subject).toContain("Annulation");
  });

  it("includes recipient and apprentice names in html", () => {
    const result = WorkshopEmailTemplates.cancellation(data);
    expect(result.html).toContain("Alice");
    expect(result.html).toContain("Bob");
  });

  it("includes workshop title in text", () => {
    const result = WorkshopEmailTemplates.cancellation(data);
    expect(result.text).toContain("React Basics");
  });

  it("includes cancellation reason when provided", () => {
    const result = WorkshopEmailTemplates.cancellation({
      ...data,
      cancellationReason: "Conflit d'horaire",
    });
    expect(result.html).toContain("Conflit d'horaire");
    expect(result.text).toContain("Conflit d'horaire");
  });

  it("handles null workshopDate", () => {
    const result = WorkshopEmailTemplates.cancellation({
      ...data,
      workshopDate: null,
    });
    expect(result.html).toContain("non définie");
  });

  it("handles null workshopTime", () => {
    const result = WorkshopEmailTemplates.cancellation({
      ...data,
      workshopTime: null,
    });
    expect(result.html).toContain("Heure non définie");
  });
});

describe("WorkshopEmailTemplates.requestAccepted", () => {
  const data = {
    recipientName: "Alice",
    mentorName: "Dr. Smith",
    workshopTitle: "Node.js Advanced",
    workshopDate: new Date(2026, 2, 20),
    workshopTime: "10:00",
    workshopDuration: 90,
    workshopLocation: "Salle 101",
    isVirtual: false,
    workshopId: "ws-456",
  };

  it("sets a relevant subject", () => {
    const result = WorkshopEmailTemplates.requestAccepted(data);
    expect(result.subject).toContain("acceptée");
    expect(result.subject).toContain("Node.js Advanced");
  });

  it("includes mentor name and workshop details in html", () => {
    const result = WorkshopEmailTemplates.requestAccepted(data);
    expect(result.html).toContain("Dr. Smith");
    expect(result.html).toContain("Salle 101");
    expect(result.html).toContain("1h30");
  });

  it("shows virtual location for virtual workshops", () => {
    const result = WorkshopEmailTemplates.requestAccepted({
      ...data,
      isVirtual: true,
    });
    expect(result.html).toContain("virtuel");
  });

  it("handles null duration", () => {
    const result = WorkshopEmailTemplates.requestAccepted({
      ...data,
      workshopDuration: null,
    });
    expect(result.html).toContain("Durée à confirmer");
  });

  it("handles null time", () => {
    const result = WorkshopEmailTemplates.requestAccepted({
      ...data,
      workshopTime: null,
    });
    expect(result.html).toContain("Heure à confirmer");
  });
});

describe("WorkshopEmailTemplates.feedbackWarning", () => {
  const data = {
    recipientName: "Bob",
    mentorName: "Prof. Jones",
    workshopTitle: "Python Intro",
  };

  it("sets a warning subject", () => {
    const result = WorkshopEmailTemplates.feedbackWarning(data);
    expect(result.subject).toContain("Avertissement");
  });

  it("includes recipient and mentor names", () => {
    const result = WorkshopEmailTemplates.feedbackWarning(data);
    expect(result.html).toContain("Bob");
    expect(result.html).toContain("Prof. Jones");
    expect(result.html).toContain("Python Intro");
  });

  it("includes community rules in text", () => {
    const result = WorkshopEmailTemplates.feedbackWarning(data);
    expect(result.text).toContain("Règles de la communauté");
  });
});

describe("WorkshopEmailTemplates.reschedule", () => {
  const data = {
    recipientName: "Alice",
    workshopTitle: "Vue.js Basics",
    oldDate: new Date(2026, 2, 10),
    oldTime: "09:00",
    newDate: new Date(2026, 2, 15),
    newTime: "14:00",
    workshopLocation: "Salle B",
    workshopDuration: 60,
    workshopId: "ws-789",
  };

  it("sets a reschedule subject", () => {
    const result = WorkshopEmailTemplates.reschedule(data);
    expect(result.subject).toContain("horaire");
    expect(result.subject).toContain("Vue.js Basics");
  });

  it("includes old and new times", () => {
    const result = WorkshopEmailTemplates.reschedule(data);
    expect(result.html).toContain("09:00");
    expect(result.html).toContain("14:00");
  });

  it("includes location and duration", () => {
    const result = WorkshopEmailTemplates.reschedule(data);
    expect(result.html).toContain("Salle B");
    expect(result.html).toContain("1h");
  });

  it("handles null oldDate", () => {
    const result = WorkshopEmailTemplates.reschedule({
      ...data,
      oldDate: null,
    });
    expect(result.html).toContain("non définie");
  });

  it("handles null oldTime", () => {
    const result = WorkshopEmailTemplates.reschedule({
      ...data,
      oldTime: null,
    });
    expect(result.html).toContain("Heure non définie");
  });
});

describe("WorkshopEmailTemplates.requestRejected", () => {
  const data = {
    recipientName: "Charlie",
    mentorName: "Dr. Brown",
    workshopTitle: "TypeScript Deep Dive",
  };

  it("sets a rejection subject", () => {
    const result = WorkshopEmailTemplates.requestRejected(data);
    expect(result.subject).toContain("rejetée");
    expect(result.subject).toContain("TypeScript Deep Dive");
  });

  it("includes encouragement text", () => {
    const result = WorkshopEmailTemplates.requestRejected(data);
    expect(result.html).toContain("Ne vous découragez pas");
    expect(result.text).toContain("Ne vous découragez pas");
  });

  it("includes all names", () => {
    const result = WorkshopEmailTemplates.requestRejected(data);
    expect(result.html).toContain("Charlie");
    expect(result.html).toContain("Dr. Brown");
  });
});
