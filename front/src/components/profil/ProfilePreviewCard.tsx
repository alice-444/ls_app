"use client";

import { User, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfilePreviewCardProps {
  readonly previewPhoto: string | null;
  readonly displayName: string;
  readonly studyDomain: string;
  readonly studyProgram: string;
  readonly title?: string;
  readonly tags: string[];
}

export function ProfilePreviewCard({
  previewPhoto,
  displayName,
  studyDomain,
  studyProgram,
  title,
  tags,
}: ProfilePreviewCardProps) {
  return (
    <aside className="min-w-0 flex justify-center lg:flex-none lg:block lg:col-start-2 lg:row-start-1">
      <div className="w-full max-w-[340px] lg:max-w-full sticky top-8 overflow-hidden rounded-xl lg:rounded-2xl border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[#1a1720] shadow-md lg:shadow-lg">
        <div className="hidden lg:block h-1.5 w-full bg-linear-to-r from-[#FF8C42]/30 via-[#FF8C42]/50 to-[#FF8C42]/30" />
        <div className="p-3 lg:p-6 flex flex-col items-center text-center">
          <p className="text-[10px] lg:text-xs font-medium text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] uppercase tracking-wider mb-1 lg:mb-1">
            Aperçu
          </p>
          <p className="hidden lg:block text-xs text-[rgba(38,84,124,0.5)] dark:text-[rgba(230,230,230,0.5)] mb-4 lg:mb-5">
            Comme les autres te verront
          </p>
          {previewPhoto ? (
            <img
              src={previewPhoto}
              alt=""
              className="w-12 h-12 lg:w-24 lg:h-24 rounded-full object-cover ring-2 ring-[#FF8C42]/20 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1720] mb-2 lg:mb-4 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 lg:w-24 lg:h-24 rounded-full bg-[#e8eaef] dark:bg-white/10 flex items-center justify-center ring-2 ring-[#d6dae4] dark:ring-[rgba(214,218,228,0.32)] ring-offset-2 ring-offset-white dark:ring-offset-[#1a1720] mb-2 lg:mb-4 shrink-0">
              <User className="h-6 w-6 lg:h-11 lg:w-11 text-[#64748b] dark:text-gray-400" />
            </div>
          )}
          <h3 className="text-xs lg:text-lg font-semibold text-[#26547c] dark:text-[#e6e6e6] wrap-break-word line-clamp-2 lg:line-clamp-none">
            {displayName || "Ton prénom"}
          </h3>
          {title && (
            <Badge
              variant="secondary"
              className="mt-1 lg:mt-2 text-[10px] lg:text-xs bg-[#FF8C42]/10 text-[#FF8C42] border-0 shrink-0"
            >
              {title}
            </Badge>
          )}
          {(studyDomain || studyProgram) && (
            <div className="hidden lg:block mt-3 text-sm text-[rgba(38,84,124,0.8)] dark:text-[rgba(230,230,230,0.8)] space-y-1">
              {studyDomain && (
                <p className="flex items-center justify-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-[#FF8C42] shrink-0" />
                  {studyDomain}
                </p>
              )}
              {studyProgram && <p className="pl-5">{studyProgram}</p>}
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 lg:gap-1.5 mt-2 lg:mt-4">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 lg:px-2.5 lg:py-1 bg-[#FF8C42]/10 text-[#FF8C42] rounded-full text-[10px] lg:text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
