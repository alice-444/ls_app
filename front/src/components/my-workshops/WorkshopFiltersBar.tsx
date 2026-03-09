"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortField, SortOrder, StatusFilter } from "@/hooks/useMyWorkshops";

interface WorkshopFiltersBarProps {
  readonly searchQuery: string;
  readonly onSearchChange: (value: string) => void;
  readonly statusFilter: StatusFilter;
  readonly onStatusFilterChange: (value: StatusFilter) => void;
  readonly sortField: SortField;
  readonly onSortFieldChange: (value: SortField) => void;
  readonly sortOrder: SortOrder;
  readonly onSortOrderToggle: () => void;
}

export function WorkshopFiltersBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderToggle,
}: WorkshopFiltersBarProps) {
  return (
    <Card className="mb-6 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ls-muted" />
            <Input
              placeholder="Rechercher un atelier par titre ou description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-ls-input-bg border-ls-border text-ls-text rounded-full"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Select
              value={statusFilter}
              onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="PUBLISHED">Publié</SelectItem>
                <SelectItem value="CANCELLED">Annulé</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortField}
              onValueChange={(v) => onSortFieldChange(v as SortField)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
                <SelectItem value="status">Statut</SelectItem>
                <SelectItem value="createdAt">Date de création</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={onSortOrderToggle}
              className="w-full md:w-auto border-ls-border text-ls-heading hover:bg-brand-soft rounded-full"
            >
              {sortOrder === "asc" ? "↑ Croissant" : "↓ Décroissant"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
