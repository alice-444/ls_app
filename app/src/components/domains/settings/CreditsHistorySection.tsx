"use client";

import { trpc } from "@/utils/trpc";
import { Coins, History, TrendingDown, TrendingUp, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string | Date;
}

export function CreditsHistorySection() {
  const { data: balanceData, isLoading: isLoadingBalance } = trpc.credits.getBalance.useQuery();
  const { data: historyData, isLoading: isLoadingHistory } = trpc.credits.getTransactionHistory.useQuery({
    limit: 50,
  });

  if (isLoadingBalance || isLoadingHistory) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  const transactions = (historyData?.transactions as Transaction[]) || [];

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            Solde actuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {balanceData?.balance ?? 0} crédits
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Utilisables pour tous les ateliers de la plateforme
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <History className="h-5 w-5" />
          Historique des transactions
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-muted/30">
            <p className="text-muted-foreground text-sm">
              Aucune transaction trouvée.
            </p>
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden divide-y">
            {transactions.map((t) => {
              let typeStyles: string;
              if (t.type === 'TOP_UP') typeStyles = 'bg-green-100 text-green-600';
              else if (t.type === 'REFUND') typeStyles = 'bg-blue-100 text-blue-600';
              else typeStyles = 'bg-orange-100 text-orange-600';

              let TypeIcon: typeof TrendingUp;
              if (t.type === 'TOP_UP') TypeIcon = TrendingUp;
              else if (t.type === 'REFUND') TypeIcon = RefreshCcw;
              else TypeIcon = TrendingDown;

              return (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${typeStyles}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(t.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${t.amount > 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                      {t.amount > 0 ? '+' : ''}{t.amount}
                    </div>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase">
                      {t.type}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
