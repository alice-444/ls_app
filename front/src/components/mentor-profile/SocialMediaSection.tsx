"use client";

import { Linkedin, Twitter, Youtube, Github, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseFormRegister } from "react-hook-form";
import type { MentorProfileFormData } from "./schema";

const SOCIAL_FIELDS = [
  {
    id: "linkedin" as const,
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/in/votre-profil",
  },
  {
    id: "twitter" as const,
    label: "Twitter",
    icon: Twitter,
    placeholder: "https://twitter.com/votre-profil",
  },
  {
    id: "github" as const,
    label: "GitHub",
    icon: Github,
    placeholder: "https://github.com/votre-profil",
  },
  {
    id: "youtube" as const,
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://youtube.com/@votre-chaine",
  },
] as const;

interface SocialMediaSectionProps {
  readonly register: UseFormRegister<MentorProfileFormData>;
}

export function SocialMediaSection({ register }: SocialMediaSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Share2 className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">
          Réseaux sociaux
        </h2>
      </div>
      <p className="text-base text-ls-muted">
        Ajoutez vos liens vers vos réseaux sociaux
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_FIELDS.map(({ id, label, icon: Icon, placeholder }) => (
          <div key={id} className="space-y-2">
            <Label
              htmlFor={id}
              className="flex items-center gap-2 text-ls-heading"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Label>
            <Input
              id={id}
              {...register(`socialMediaLinks.${id}`)}
              placeholder={placeholder}
              type="url"
              className="border border-ls-border bg-ls-input-bg text-ls-heading rounded-[32px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
