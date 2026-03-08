"use client";

import { User, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudyDomainSelect } from "./StudyDomainSelect";

const MAX_LENGTH = 50;

interface ApprenticeProfileFormProps {
  displayNameVal: string;
  setDisplayNameVal: (val: string) => void;
  bioVal: string;
  setBioVal: (val: string) => void;
  studyDomainVal: string;
  setStudyDomainVal: (val: string) => void;
  studyProgramVal: string;
  setStudyProgramVal: (val: string) => void;
  fieldErrors: Record<string, string>;
  blockCardClass: string;
}

export function ApprenticeProfileForm({
  displayNameVal,
  setDisplayNameVal,
  bioVal,
  setBioVal,
  studyDomainVal,
  setStudyDomainVal,
  studyProgramVal,
  setStudyProgramVal,
  fieldErrors,
  blockCardClass,
}: ApprenticeProfileFormProps) {
  return (
    <>
      <div className={blockCardClass}>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF8C42]/10">
            <User className="h-4 w-4 text-[#FF8C42]" />
          </div>
          <h2 className="text-sm font-semibold text-[#26547c] dark:text-[#e6e6e6] uppercase tracking-wide">
            Identité
          </h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="displayName">Prénom</Label>
              <span className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                {displayNameVal.length}/{MAX_LENGTH}
              </span>
            </div>
            <Input
              id="displayName"
              value={displayNameVal}
              onChange={(e) =>
                setDisplayNameVal(e.target.value.slice(0, MAX_LENGTH))
              }
              placeholder="Ton prénom"
              maxLength={MAX_LENGTH}
              className={fieldErrors.displayName ? "border-destructive" : ""}
              aria-invalid={!!fieldErrors.displayName}
              aria-describedby={
                fieldErrors.displayName ? "displayName-error" : undefined
              }
            />
            {fieldErrors.displayName && (
              <p id="displayName-error" className="text-xs text-destructive" role="alert">
                {fieldErrors.displayName}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="bio">Bio (optionnelle)</Label>
              <span className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                {bioVal.length}/500
              </span>
            </div>
            <textarea
              id="bio"
              value={bioVal}
              onChange={(e) =>
                setBioVal(e.target.value.slice(0, 500))
              }
              placeholder="Quelques mots sur toi, tes objectifs..."
              maxLength={500}
              rows={4}
              className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none ${fieldErrors.bio ? "border-destructive" : ""}`}
              aria-invalid={!!fieldErrors.bio}
              aria-describedby={
                fieldErrors.bio ? "bio-error" : undefined
              }
            />
            {fieldErrors.bio && (
              <p id="bio-error" className="text-xs text-destructive" role="alert">
                {fieldErrors.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={blockCardClass}>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF8C42]/10">
            <GraduationCap className="h-4 w-4 text-[#FF8C42]" />
          </div>
          <h2 className="text-sm font-semibold text-[#26547c] dark:text-[#e6e6e6] uppercase tracking-wide">
            Parcours
          </h2>
        </div>
        <div className="space-y-4">
          <StudyDomainSelect
            value={studyDomainVal}
            onChange={setStudyDomainVal}
            error={fieldErrors.studyDomain}
          />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="studyProgram">Cursus</Label>
              <span className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                {studyProgramVal.length}/{MAX_LENGTH}
              </span>
            </div>
            <Input
              id="studyProgram"
              value={studyProgramVal}
              onChange={(e) =>
                setStudyProgramVal(e.target.value.slice(0, MAX_LENGTH))
              }
              placeholder="Bachelor 1ère année, BTS..."
              maxLength={MAX_LENGTH}
              className={fieldErrors.studyProgram ? "border-destructive" : ""}
              aria-invalid={!!fieldErrors.studyProgram}
              aria-describedby={
                fieldErrors.studyProgram ? "studyProgram-error" : undefined
              }
            />
            {fieldErrors.studyProgram && (
              <p id="studyProgram-error" className="text-xs text-destructive" role="alert">
                {fieldErrors.studyProgram}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
