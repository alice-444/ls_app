import axe from "axe-core";
import type { RunOptions } from "axe-core";

/**
 * Run axe-core on a container and return results.
 * Use in tests: expect((await axe(container)).violations).toHaveLength(0)
 * or use assertNoViolations() helper.
 */
export async function runA11y(
  container: Element | null,
  options?: RunOptions
): Promise<axe.AxeResults> {
  if (!container) {
    throw new Error("Container is required for axe.run()");
  }
  return new Promise((resolve, reject) => {
    axe.run(container, options ?? {}, (err, results) => {
      if (err) reject(err);
      else if (results) resolve(results as axe.AxeResults);
      else reject(new Error("axe.run returned no results"));
    });
  });
}

/**
 * Assert no accessibility violations. Use in tests:
 * await assertNoViolations(container);
 */
export async function assertNoViolations(
  container: Element | null,
  options?: RunOptions
): Promise<void> {
  const results = await runA11y(container, options);
  const { violations } = results;
  if (violations.length > 0) {
    const msg = violations
      .map(
        (v) =>
          `[${v.id}] ${v.help}\n  ${v.nodes.map((n) => n.html).join("\n  ")}`
      )
      .join("\n\n");
    throw new Error(`Accessibility violations found:\n\n${msg}`);
  }
}
