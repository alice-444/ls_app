import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Custom hook to manage admin filters with URL persistence.
 */
export function useAdminFilters<
  T extends Record<string, string | null | undefined>,
>(defaultFilters: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Compute current filters from URL, falling back to defaults
  const filters = useMemo(() => {
    const current: Record<string, string> = {
      ...(defaultFilters as Record<string, string>),
    };
    searchParams.forEach((value, key) => {
      if (value) current[key] = value;
    });
    return current as unknown as T;
  }, [searchParams, defaultFilters]);

  // Function to update a single filter and the URL
  const setFilter = useCallback(
    (key: keyof T, value: string | null | undefined) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "ALL") {
        params.set(key as string, value);
      } else {
        params.delete(key as string);
      }

      // Reset cursor/pagination when filters change
      params.delete("cursor");

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Function to clear all filters
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filters,
    setFilter,
    clearFilters,
  };
}
