"use client";

import { Card } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatWorkshopDate } from "@/lib/dashboard-utils";
import { StatusBadge } from "./StatusBadge";

interface CashbackItem {
  id: string;
  workshopTitle: string;
  participantName: string;
  cashbackAmount: number;
  status: string;
  processedAt: Date | string | null;
  createdAt: Date | string;
}

interface CashbackHistoryListProps {
  readonly items: readonly CashbackItem[];
}

export function CashbackHistoryList({ items }: CashbackHistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-ls-muted">
        Aucun historique de cashback disponible.
      </div>
    );
  }

  return (
    <Card className="border border-border/50 rounded-2xl overflow-hidden bg-card/95 backdrop-blur-sm shadow-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold text-ls-heading">Atelier</TableHead>
            <TableHead className="font-semibold text-ls-heading">Participant</TableHead>
            <TableHead className="font-semibold text-ls-heading">Montant</TableHead>
            <TableHead className="font-semibold text-ls-heading">Statut</TableHead>
            <TableHead className="font-semibold text-ls-heading">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-brand-soft/20 transition-colors">
              <TableCell className="font-medium text-ls-heading">
                {item.workshopTitle}
              </TableCell>
              <TableCell className="text-ls-heading">
                {item.participantName}
              </TableCell>
              <TableCell className="text-ls-heading font-semibold">
                {item.cashbackAmount}
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-ls-muted text-sm">
                {formatWorkshopDate(item.processedAt || item.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
