"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  exclusive?: boolean;
}

export function FAQAccordion({
  items,
  exclusive = true,
}: Readonly<FAQAccordionProps>) {
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
      {items.map((item, index) => {
        const isExpanded = expandedIds.has(item.id);
        return (
          <div
            key={item.id}
            className={`
              bg-white dark:bg-[rgba(255,255,255,0.08)] 
              border-2 transition-all duration-300
              ${
                isExpanded
                  ? "border-[#FF8C42] shadow-lg"
                  : "border-[#d6dae4] dark:border-[#d6dae4] hover:border-[#FF8C42]/50 hover:shadow-md"
              }
              rounded-2xl overflow-hidden
            `}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className={`
                w-full flex items-start gap-4 text-left px-6 py-5
                transition-colors duration-200
                ${
                  isExpanded
                    ? "bg-[#FF8C42]/5 dark:bg-[#FF8C42]/10"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                }
              `}
              aria-expanded={isExpanded}
            >
              <div
                className={`
                  shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  text-sm font-bold transition-all duration-300
                  ${
                    isExpanded
                      ? "bg-[#FF8C42] text-white scale-110"
                      : "bg-gray-100 dark:bg-white/10 text-[#26547c] dark:text-[#e6e6e6]"
                  }
                `}
              >
                {index + 1}
              </div>

              {/* Question Text */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`
                    font-bold text-base sm:text-lg transition-colors duration-200
                    ${
                      isExpanded
                        ? "text-[#FF8C42] dark:text-[#FF8C42]"
                        : "text-[#26547c] dark:text-[#e6e6e6]"
                    }
                  `}
                >
                  {item.question}
                </h3>
              </div>

              {/* Chevron Icon */}
              <div className="shrink-0 mt-1">
                <ChevronDown
                  className={`
                    w-6 h-6 transition-all duration-300
                    ${
                      isExpanded
                        ? "rotate-180 text-[#FF8C42]"
                        : "rotate-0 text-[#26547c] dark:text-[#e6e6e6]"
                    }
                  `}
                />
              </div>
            </button>
            {/* Answer Section with Smooth Transition */}
            <div
              className={`
                grid transition-all duration-300 ease-in-out
                ${
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }
              `}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pt-4 border-t border-[#d6dae4] dark:border-[#d6dae4]">
                  {/* Answer Icon/Decorator */}
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      <div className="w-1 h-full bg-[#FF8C42] rounded-full" />
                    </div>
                    <p className="text-[rgba(38,84,124,0.9)] dark:text-[rgba(230,230,230,0.9)] text-sm sm:text-base leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
