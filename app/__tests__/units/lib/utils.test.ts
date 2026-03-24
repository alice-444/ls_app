import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("should merge single class", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("should merge multiple classes", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("should resolve tailwind conflicts (last wins)", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("should handle undefined and null values", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("should handle empty string", () => {
    expect(cn("")).toBe("");
  });

  it("should handle array of classes", () => {
    expect(cn(["px-2", "py-1"])).toBe("px-2 py-1");
  });

  it("should handle object syntax", () => {
    expect(cn({ "text-red-500": true, "bg-blue-500": false })).toBe(
      "text-red-500"
    );
  });
});
