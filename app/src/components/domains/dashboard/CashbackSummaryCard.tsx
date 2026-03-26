"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";

interface CashbackSummaryCardProps {
  readonly totalEarned: number;
  readonly byMonth: readonly { month: string; amount: number }[];
}

export function CashbackSummaryCard({ totalEarned, byMonth }: CashbackSummaryCardProps) {
  return (
    <Card className="border border-border/50 rounded-2xl bg-card/95 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-brand/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-ls-heading">
          Gains de cashback (mentor)
        </CardTitle>
        <Coins className="h-4 w-4 text-brand" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-ls-heading">
          {totalEarned} <span className="text-sm font-normal text-ls-muted">crédits</span>
        </div>
        {byMonth.length > 0 && (
          <p className="text-xs text-ls-muted mt-1">
            Dernière activité: {byMonth.at(-1)?.month}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
