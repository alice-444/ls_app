"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const STUDY_DOMAINS = [
  "Développement Web",
  "Développement Mobile",
  "Data Science & AI",
  "Design UI/UX",
  "Marketing Digital",
  "Business & Management",
  "Cybersécurité",
  "Cloud & DevOps",
  "Jeux Vidéo",
  "Autre",
];

interface StudyDomainSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function StudyDomainSelect({
  value,
  onChange,
  error,
}: StudyDomainSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="studyDomain">Domaine d&apos;étude</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id="studyDomain"
          className={`rounded-full border-border ${error ? "border-destructive" : ""}`}
        >
          <SelectValue placeholder="Choisis ton domaine d'étude" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-md">
          {STUDY_DOMAINS.map((domain) => (
            <SelectItem key={domain} value={domain}>
              {domain}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
