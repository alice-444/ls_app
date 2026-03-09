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
    <div className="w-full lg:w-[280px] shrink-0 mb-6 lg:mb-0">
      <div className="bg-card/95 dark:bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden">
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
                "w-full flex items-center gap-3 h-12 px-6 py-4 transition-all duration-200 text-sm",
                isFirst && "rounded-tl-2xl rounded-tr-2xl",
                isLast && "rounded-bl-2xl rounded-br-2xl",
                isActive
                  ? "bg-brand text-ls-heading font-semibold shadow-sm"
                  : "bg-transparent text-ls-heading hover:bg-brand/10 border-t border-border/30",
                !isFirst && !isActive && "border-t border-border/30"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="text-sm font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
