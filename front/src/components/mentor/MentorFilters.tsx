"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { PREDEFINED_TOPICS } from "@/components/mentor-profile/constants";

interface MentorFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  domainFilter: string;
  onDomainFilterChange: (domain: string) => void;
  topicFilter: string;
  onTopicFilterChange: (topic: string) => void;
}

export function MentorFilters({
  searchQuery,
  onSearchChange,
  domainFilter,
  onDomainFilterChange,
  topicFilter,
  onTopicFilterChange,
}: MentorFiltersProps) {
  return (
    <Card className="mb-8 border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ls-muted" />
            <Input
              placeholder="Rechercher un mentor par nom ou expertise..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 rounded-full border-border bg-card/80 focus:ring-brand"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={domainFilter === "" ? "all" : domainFilter}
              onValueChange={(value) =>
                onDomainFilterChange(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-48 rounded-full border-border bg-card/80">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3" />
                  <SelectValue placeholder="Domaine" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-md">
                <SelectItem value="all">Tous les domaines</SelectItem>
                {/* We could dynamically get domains, but let's use some common ones or leave as search for now */}
                <SelectItem value="Informatique">Informatique</SelectItem>
                <SelectItem value="Gestion">Gestion</SelectItem>
                <SelectItem value="Santé">Santé</SelectItem>
                <SelectItem value="Droit">Droit</SelectItem>
                <SelectItem value="Ingénierie">Ingénierie</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={topicFilter === "" ? "all" : topicFilter}
              onValueChange={(value) =>
                onTopicFilterChange(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-48 rounded-full border-border bg-card/80">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3" />
                  <SelectValue placeholder="Sujet" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-md">
                <SelectItem value="all">Tous les sujets</SelectItem>
                {PREDEFINED_TOPICS.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
