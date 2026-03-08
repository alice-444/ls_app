"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  items: CashbackItem[];
}

export function CashbackHistoryList({ items }: CashbackHistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
        Aucun historique de cashback disponible.
      </div>
    );
  }

  return (
    <div className="border border-[#d6dae4] rounded-[16px] overflow-hidden bg-white dark:bg-[#1a1720]">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#f8f9fc] dark:bg-[rgba(255,255,255,0.04)]">
            <TableHead className="font-semibold text-[#26547c] dark:text-[#e6e6e6]">Atelier</TableHead>
            <TableHead className="font-semibold text-[#26547c] dark:text-[#e6e6e6]">Participant</TableHead>
            <TableHead className="font-semibold text-[#26547c] dark:text-[#e6e6e6]">Montant</TableHead>
            <TableHead className="font-semibold text-[#26547c] dark:text-[#e6e6e6]">Statut</TableHead>
            <TableHead className="font-semibold text-[#26547c] dark:text-[#e6e6e6]">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium text-[#26547c] dark:text-[#e6e6e6]">
                {item.workshopTitle}
              </TableCell>
              <TableCell className="text-[#26547c] dark:text-[#e6e6e6]">
                {item.participantName}
              </TableCell>
              <TableCell className="text-[#26547c] dark:text-[#e6e6e6] font-semibold">
                {item.cashbackAmount}
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] text-sm">
                {formatWorkshopDate(item.processedAt || item.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
