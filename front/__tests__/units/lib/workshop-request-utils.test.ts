import { describe, it, expect } from "vitest";
import {
  getWorkshopRequestStatusLabel,
  getWorkshopRequestStatusColor,
  WORKSHOP_REQUEST_STATUS_LABELS,
  WORKSHOP_REQUEST_STATUS_COLORS,
} from "@/lib/workshop-request-utils";

describe("getWorkshopRequestStatusLabel", () => {
  it("should return 'En attente' for PENDING", () => {
    expect(getWorkshopRequestStatusLabel("PENDING")).toBe("En attente");
  });

  it("should return 'Acceptée' for ACCEPTED", () => {
    expect(getWorkshopRequestStatusLabel("ACCEPTED")).toBe("Acceptée");
  });

  it("should return 'Refusée' for REJECTED", () => {
    expect(getWorkshopRequestStatusLabel("REJECTED")).toBe("Refusée");
  });

  it("should return 'Annulée' for CANCELLED", () => {
    expect(getWorkshopRequestStatusLabel("CANCELLED")).toBe("Annulée");
  });

  it("should return the raw status for unknown status", () => {
    expect(getWorkshopRequestStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});

describe("getWorkshopRequestStatusColor", () => {
  it("should return yellow classes for PENDING", () => {
    const result = getWorkshopRequestStatusColor("PENDING");
    expect(result).toContain("yellow");
  });

  it("should return green classes for ACCEPTED", () => {
    const result = getWorkshopRequestStatusColor("ACCEPTED");
    expect(result).toContain("green");
  });

  it("should return red classes for REJECTED", () => {
    const result = getWorkshopRequestStatusColor("REJECTED");
    expect(result).toContain("red");
  });

  it("should return gray classes for CANCELLED", () => {
    const result = getWorkshopRequestStatusColor("CANCELLED");
    expect(result).toContain("gray");
  });

  it("should fallback to PENDING color for unknown status", () => {
    expect(getWorkshopRequestStatusColor("UNKNOWN")).toBe(
      WORKSHOP_REQUEST_STATUS_COLORS.PENDING
    );
  });
});

describe("WORKSHOP_REQUEST_STATUS_LABELS", () => {
  it("should have all expected statuses", () => {
    expect(Object.keys(WORKSHOP_REQUEST_STATUS_LABELS)).toEqual(
      expect.arrayContaining(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"])
    );
  });
});

describe("WORKSHOP_REQUEST_STATUS_COLORS", () => {
  it("should have all expected statuses", () => {
    expect(Object.keys(WORKSHOP_REQUEST_STATUS_COLORS)).toEqual(
      expect.arrayContaining(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"])
    );
  });

  it("should include dark mode classes", () => {
    for (const color of Object.values(WORKSHOP_REQUEST_STATUS_COLORS)) {
      expect(color).toContain("dark:");
    }
  });
});
