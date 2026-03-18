import { describe, it, expect } from "vitest";
import {
  MENTOR_FEATURES,
  APPRENANT_FEATURES,
  ROLE_CONFIG,
  STEP_CONFIG,
} from "@/app/onboarding/constants";

describe("MENTOR_FEATURES", () => {
  it("should have at least one feature", () => {
    expect(MENTOR_FEATURES.length).toBeGreaterThan(0);
  });

  it("each feature should be a non-empty string", () => {
    for (const feature of MENTOR_FEATURES) {
      expect(feature.length).toBeGreaterThan(0);
    }
  });
});

describe("APPRENANT_FEATURES", () => {
  it("should have at least one feature", () => {
    expect(APPRENANT_FEATURES.length).toBeGreaterThan(0);
  });

  it("each feature should be a non-empty string", () => {
    for (const feature of APPRENANT_FEATURES) {
      expect(feature.length).toBeGreaterThan(0);
    }
  });
});

describe("ROLE_CONFIG", () => {
  it("should have MENTOR and APPRENANT roles", () => {
    expect(ROLE_CONFIG).toHaveProperty("MENTOR");
    expect(ROLE_CONFIG).toHaveProperty("APPRENANT");
  });

  it("MENTOR config should have required fields", () => {
    expect(ROLE_CONFIG.MENTOR.label).toBeTruthy();
    expect(ROLE_CONFIG.MENTOR.description).toBeTruthy();
    expect(ROLE_CONFIG.MENTOR.features.length).toBeGreaterThan(0);
    expect(ROLE_CONFIG.MENTOR.color.primary).toBeTruthy();
    expect(ROLE_CONFIG.MENTOR.color.secondary).toBeTruthy();
    expect(ROLE_CONFIG.MENTOR.color.bg).toBeTruthy();
  });

  it("APPRENANT config should have required fields", () => {
    expect(ROLE_CONFIG.APPRENANT.label).toBeTruthy();
    expect(ROLE_CONFIG.APPRENANT.description).toBeTruthy();
    expect(ROLE_CONFIG.APPRENANT.features.length).toBeGreaterThan(0);
    expect(ROLE_CONFIG.APPRENANT.color.primary).toBeTruthy();
    expect(ROLE_CONFIG.APPRENANT.color.secondary).toBeTruthy();
    expect(ROLE_CONFIG.APPRENANT.color.bg).toBeTruthy();
  });

  it("MENTOR features should reference MENTOR_FEATURES", () => {
    expect(ROLE_CONFIG.MENTOR.features).toBe(MENTOR_FEATURES);
  });

  it("APPRENANT features should reference APPRENANT_FEATURES", () => {
    expect(ROLE_CONFIG.APPRENANT.features).toBe(APPRENANT_FEATURES);
  });

  it("roles should have distinct labels", () => {
    expect(ROLE_CONFIG.MENTOR.label).not.toBe(ROLE_CONFIG.APPRENANT.label);
  });

  it("roles should have distinct color schemes", () => {
    expect(ROLE_CONFIG.MENTOR.color.primary).not.toBe(
      ROLE_CONFIG.APPRENANT.color.primary
    );
  });
});

describe("STEP_CONFIG", () => {
  it("should have select, confirm-features, and prof-form steps", () => {
    expect(STEP_CONFIG).toHaveProperty("select");
    expect(STEP_CONFIG).toHaveProperty("confirm-features");
    expect(STEP_CONFIG).toHaveProperty("prof-form");
  });

  it("steps should have sequential numbers", () => {
    expect(STEP_CONFIG.select.number).toBe(1);
    expect(STEP_CONFIG["confirm-features"].number).toBe(2);
    expect(STEP_CONFIG["prof-form"].number).toBe(3);
  });

  it("each step should have a label and key", () => {
    for (const step of Object.values(STEP_CONFIG)) {
      expect(step.label).toBeTruthy();
      expect(step.key).toBeTruthy();
    }
  });
});
