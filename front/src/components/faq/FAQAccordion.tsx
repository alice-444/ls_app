"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  exclusive?: boolean;
}

export function FAQAccordion({ items, exclusive = true }: FAQAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (exclusive) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isExpanded = expandedIds.has(item.id);
        return (
          <div
            key={item.id}
            className="border-b last:border-b-0 pb-4 last:pb-0"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-start justify-between gap-4 text-left hover:opacity-80 transition-opacity"
              aria-expanded={isExpanded}
            >
              <h3 className="font-semibold text-base flex-1">
                {item.question}
              </h3>
              <div className="flex-shrink-0 mt-1">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>
            {isExpanded && (
              <div className="mt-3 pl-0">
                <p className="text-muted-foreground text-sm">{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
