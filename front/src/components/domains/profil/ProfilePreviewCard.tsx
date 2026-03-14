"use client";

import Image from "next/image";
import { User, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfilePreviewCardProps {
  readonly previewPhoto: string | null;
  readonly displayName: string;
  readonly studyDomain: string;
  readonly studyProgram: string;
  readonly bio?: string | null;
  readonly title?: string;
  readonly tags: string[];
  readonly iceBreakers?: string[];
}

export function ProfilePreviewCard({
  previewPhoto,
  displayName,
  studyDomain,
  studyProgram,
  bio,
  title,
  tags,
  iceBreakers = [],
}: ProfilePreviewCardProps) {
  return (
    <aside className="min-w-0 flex justify-center lg:flex-none lg:block lg:col-start-2 lg:row-start-1">
      <div className="w-full max-w-[340px] lg:max-w-full sticky top-8 overflow-hidden rounded-xl lg:rounded-2xl border border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-xl">
        <div className="hidden lg:block h-1.5 w-full bg-linear-to-r from-[#FF8C42]/30 via-[#FF8C42]/50 to-[#FF8C42]/30" />
        <div className="p-3 lg:p-6 flex flex-col items-center text-center">
          <p className="text-[10px] lg:text-xs font-medium text-ls-muted uppercase tracking-wider mb-1 lg:mb-1">
            Aperçu
          </p>
          <p className="hidden lg:block text-xs text-ls-muted mb-4 lg:mb-5">
            Comme les autres te verront
          </p>
          {previewPhoto ? (
            <Image
              src={previewPhoto}
              alt=""
              width={96}
              height={96}
              className="w-12 h-12 lg:w-24 lg:h-24 rounded-full object-cover ring-2 ring-brand/20 ring-offset-2 ring-offset-background mb-2 lg:mb-4 shrink-0"
              unoptimized={previewPhoto.startsWith("data:")}
            />
          ) : (
            <div className="w-12 h-12 lg:w-24 lg:h-24 rounded-full bg-brand/5 flex items-center justify-center ring-2 ring-border/50 ring-offset-2 ring-offset-background mb-2 lg:mb-4 shrink-0">
              <User className="h-6 w-6 lg:h-11 lg:w-11 text-ls-muted" />
            </div>
          )}
          <h3 className="text-xs lg:text-lg font-semibold text-ls-heading wrap-break-word line-clamp-2 lg:line-clamp-none">
            {displayName || "Ton prénom"}
          </h3>
          {title && (
            <Badge
              variant="secondary"
              className="mt-1 lg:mt-2 text-[10px] lg:text-xs bg-brand/10 text-brand border-0 shrink-0 rounded-full"
            >
              {title}
            </Badge>
          )}
          {(studyDomain || studyProgram) && (
            <div className="hidden lg:block mt-3 text-sm text-ls-muted space-y-1">
              {studyDomain && (
                <p className="flex items-center justify-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-brand shrink-0" />
                  {studyDomain}
                </p>
              )}
              {studyProgram && <p className="pl-5">{studyProgram}</p>}
            </div>
          )}
          {bio && (
            <div className="hidden lg:block mt-3 text-sm text-ls-muted italic line-clamp-3">
              "{bio}"
            </div>
          )}
          {iceBreakers.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 lg:gap-1.5 mt-3">
              {iceBreakers.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 lg:px-2 lg:py-0.5 bg-brand/10 text-brand rounded-full text-[9px] lg:text-[11px] font-bold border border-brand/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 lg:gap-1.5 mt-2 lg:mt-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 lg:px-2.5 lg:py-1 bg-brand/10 text-brand rounded-full text-[10px] lg:text-xs font-medium"
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
