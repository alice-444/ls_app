"use client";

import { cn } from "@/lib/utils";

export interface SidebarItem<T extends string> {
  readonly id: T;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

interface SectionSidebarProps<T extends string> {
  readonly items: ReadonlyArray<SidebarItem<T>>;
  readonly activeSection: T;
  readonly onSelect: (section: T) => void;
}

export function SectionSidebar<T extends string>({
  items,
  activeSection,
  onSelect,
}: SectionSidebarProps<T>) {
  return (
    <div className="w-full lg:w-[300px] mb-6 lg:mb-0">
      <div className="bg-ls-surface border border-ls-border rounded-2xl overflow-hidden">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-full flex items-center gap-2 h-12 px-8 py-4 transition-colors text-sm",
                isFirst && "rounded-tl-2xl rounded-tr-2xl",
                isLast && "rounded-bl-2xl rounded-br-2xl",
                isActive
                  ? "bg-brand text-white"
                  : "bg-ls-surface text-ls-heading border-t border-ls-border-soft",
                !isFirst && !isActive && "border-t border-ls-border-soft"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
