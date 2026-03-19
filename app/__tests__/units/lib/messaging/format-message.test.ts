import { describe, it, expect } from "vitest";
import { formatWorkshopReferencePreview } from "@/lib/messaging/format-message";

describe("formatWorkshopReferencePreview", () => {
  it("should return workshop title with emoji for valid workshop reference", () => {
    const content = JSON.stringify({
      type: "workshop_reference",
      workshopTitle: "Atelier React",
    });
    expect(formatWorkshopReferencePreview(content)).toBe("📚 Atelier React");
  });

  it("should return original content for non-JSON string", () => {
    expect(formatWorkshopReferencePreview("Hello world")).toBe("Hello world");
  });

  it("should return original content for JSON without workshop_reference type", () => {
    const content = JSON.stringify({ type: "other", title: "Test" });
    expect(formatWorkshopReferencePreview(content)).toBe(content);
  });

  it("should return original content for JSON with workshop_reference but no workshopTitle", () => {
    const content = JSON.stringify({ type: "workshop_reference" });
    expect(formatWorkshopReferencePreview(content)).toBe(content);
  });

  it("should return original content for invalid JSON that looks like JSON", () => {
    expect(formatWorkshopReferencePreview("{invalid json}")).toBe(
      "{invalid json}"
    );
  });

  it("should handle content with leading/trailing whitespace", () => {
    const content = `  ${JSON.stringify({
      type: "workshop_reference",
      workshopTitle: "Mon Atelier",
    })}  `;
    expect(formatWorkshopReferencePreview(content)).toBe("📚 Mon Atelier");
  });

  it("should return plain text content as-is", () => {
    expect(formatWorkshopReferencePreview("Bonjour!")).toBe("Bonjour!");
  });

  it("should return empty string as-is", () => {
    expect(formatWorkshopReferencePreview("")).toBe("");
  });
});
