"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";

interface CashbackSummaryCardProps {
  totalEarned: number;
  byMonth: { month: string; amount: number }[];
}

export function CashbackSummaryCard({ totalEarned, byMonth }: CashbackSummaryCardProps) {
  return (
    <Card className="border border-[#d6dae4] rounded-[16px] bg-white dark:bg-[#1a1720]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#26547c] dark:text-[#e6e6e6]">
          Gains de cashback (mentor)
        </CardTitle>
        <Coins className="h-4 w-4 text-[#ffb647]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#26547c] dark:text-[#e6e6e6]">
          {totalEarned} <span className="text-sm font-normal">crédits</span>
        </div>
        {byMonth.length > 0 && (
          <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] mt-1">
            Dernière activité: {byMonth[byMonth.length - 1].month}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
