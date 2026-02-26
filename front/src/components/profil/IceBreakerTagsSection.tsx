"use client";

import { useCallback, useState } from "react";
import { Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_TAGS = 5;
const TAG_SUGGESTIONS = [
  "Gamer",
  "Night Owl",
  "Football",
  "Musique",
  "Sport",
  "Lecture",
];

interface IceBreakerTagsSectionProps {
  readonly tags: string[];
  readonly onTagsChange: (tags: string[]) => void;
  readonly blockCard: string;
}

export function IceBreakerTagsSection({
  tags,
  onTagsChange,
  blockCard,
}: IceBreakerTagsSectionProps) {
  const [tagInput, setTagInput] = useState("");

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.length >= MAX_TAGS) return;
    if (tags.includes(trimmed)) {
      toast.error("Ce tag existe déjà");
      return;
    }
    onTagsChange([...tags, trimmed]);
    setTagInput("");
  }, [tagInput, tags, onTagsChange]);

  const addTagFromSuggestion = useCallback(
    (tag: string) => {
      if (tags.length >= MAX_TAGS || tags.includes(tag)) return;
      onTagsChange([...tags, tag]);
    },
    [tags, onTagsChange]
  );

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className={blockCard}>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF8C42]/10">
          <Tag className="h-4 w-4 text-[#FF8C42]" />
        </div>
        <div className="flex-1 flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-[#26547c] dark:text-[#e6e6e6] uppercase tracking-wide">
            Tags Ice Breaker
          </h2>
          <Badge
            variant="secondary"
            className="text-xs bg-[#FF8C42]/10 text-[#FF8C42] border-0"
          >
            {tags.length}/{MAX_TAGS}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Ex: Gamer, Football..."
          maxLength={30}
          disabled={tags.length >= MAX_TAGS}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addTag}
          disabled={tags.length >= MAX_TAGS || !tagInput.trim()}
          variant="outline"
          className="sm:shrink-0 border-[#26547c]/50 text-[#26547c] hover:bg-[#26547c]/10 hover:border-[#26547c] dark:border-[#26547c]/60 dark:text-[#e6e6e6] dark:hover:bg-[#26547c]/20"
        >
          Ajouter
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {TAG_SUGGESTIONS.map((suggestion) => {
          const added = tags.includes(suggestion);
          return (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTagFromSuggestion(suggestion)}
              disabled={added || tags.length >= MAX_TAGS}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                added
                  ? "bg-[#FF8C42]/20 text-[#FF8C42] cursor-default"
                  : "bg-[#FF8C42]/10 text-[#FF8C42] hover:bg-[#FF8C42]/20 disabled:opacity-50"
              )}
            >
              {suggestion}
              {added && " \u2713"}
            </button>
          );
        })}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FF8C42]/10 text-[#FF8C42] rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="rounded-full p-0.5 hover:bg-[#FF8C42]/20 focus:ring-2 focus:ring-[#FF8C42]"
                aria-label={`Retirer ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
