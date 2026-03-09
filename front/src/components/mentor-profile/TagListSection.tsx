"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TagListSectionProps {
  readonly items: string[];
  readonly customValue: string;
  readonly onCustomChange: (value: string) => void;
  readonly onAdd: (value: string) => void;
  readonly onRemove: (value: string) => void;
  readonly placeholder: string;
  readonly hint: string;
  readonly error?: string;
  readonly variant?: "blue" | "orange";
}

const VARIANT_STYLES = {
  blue: {
    tag: "bg-ls-blue-soft text-ls-blue",
    button: "hover:text-ls-blue",
  },
  orange: {
    tag: "bg-brand-soft text-brand",
    button: "hover:text-brand-hover",
  },
} as const;

export function TagListSection({
  items,
  customValue,
  onCustomChange,
  onAdd,
  onRemove,
  placeholder,
  hint,
  error,
  variant = "blue",
}: TagListSectionProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center gap-1 px-3 py-1 ${styles.tag} rounded-full text-sm font-medium`}
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className={`${styles.button} transition-colors`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder={placeholder}
        value={customValue}
        onChange={(e) => onCustomChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && customValue.trim()) {
            e.preventDefault();
            onAdd(customValue.trim());
          }
        }}
        className="border border-ls-border bg-ls-input-bg text-ls-heading rounded-full"
      />
      <p className="text-xs text-ls-muted">{hint}</p>
      {error && <p className="text-sm text-ls-error">{error}</p>}
    </div>
  );
}
