import {
  User,
  BookOpen,
  GraduationCap,
  Briefcase,
  Share2,
  Eye,
} from "lucide-react";
import type { SidebarItem } from "@/components/shared/layout";

export const PREDEFINED_TOPICS = [
  "Mathématiques",
  "Physique",
  "Chimie",
  "Programmation",
  "Design",
  "Marketing",
  "Finance",
  "Langues",
  "Sciences",
  "Arts",
  "Médecine",
  "Droit",
  "Business",
  "Data Science",
  "Développement Web",
  "Développement Mobile",
  "IA & Machine Learning",
  "Cybersécurité",
  "DevOps",
  "Entrepreneuriat",
] as const;

export type ProfileSection =
  | "informations-base"
  | "domaines-expertise"
  | "sujets-mentorat"
  | "qualifications-experience"
  | "reseaux-sociaux"
  | "publication";

export const SIDEBAR_ITEMS: ReadonlyArray<SidebarItem<ProfileSection>> = [
  { id: "informations-base", label: "Informations de base", icon: User },
  { id: "domaines-expertise", label: "Domaines d'expertise", icon: BookOpen },
  { id: "sujets-mentorat", label: "Sujets de mentorat", icon: GraduationCap },
  {
    id: "qualifications-experience",
    label: "Qualifications & Expérience",
    icon: Briefcase,
  },
  { id: "reseaux-sociaux", label: "Réseaux sociaux", icon: Share2 },
  { id: "publication", label: "Publication", icon: Eye },
];
