import { useState, useCallback } from "react";

/**
 * Custom hook to manage multi-item selection in admin tables.
 */
export function useBatchSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (items.length === 0) return;
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  }, [items, selectedIds.length]);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );

  const resetSelection = useCallback(() => setSelectedIds([]), []);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    isSelected,
    resetSelection,
    selectedCount: selectedIds.length,
    isAllSelected: items.length > 0 && selectedIds.length === items.length,
  };
}
