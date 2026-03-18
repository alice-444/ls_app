import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loader from "@/components/shared/loader";

describe("Loader", () => {
  it("renders a spinner container", () => {
    const { container } = render(<Loader />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe("DIV");
  });

  it("contains an element with spin animation", () => {
    const { container } = render(<Loader />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    expect(() => render(<Loader />)).not.toThrow();
  });
});
