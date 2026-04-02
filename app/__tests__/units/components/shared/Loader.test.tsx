import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Loader from "@/components/shared/Loader";

describe("Loader", () => {
  it("renders a spinner container", () => {
    const { container } = render(<Loader />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe("DIV");
  });

  it("contains a rotating loader element", () => {
    const { container } = render(<Loader />);
    // The core loader is a div with specific border classes and framer-motion animation
    const loader = container.querySelector(".border-b-2.border-r-2.border-ls-blue");
    expect(loader).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    expect(() => render(<Loader />)).not.toThrow();
  });
});
