"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, Edit, Clock, BookOpen } from "lucide-react";

interface WorkshopStatsCardsProps {
  total: number;
  published: number;
  drafts: number;
  completed: number;
  pendingRequests: number;
}

export function WorkshopStatsCards({
  total,
  published,
  drafts,
  completed,
  pendingRequests,
}: WorkshopStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="border-l-4 border-l-[#26547C]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total
              </p>
              <p className="text-2xl font-bold text-[#26547C]">{total}</p>
            </div>
            <div className="p-2 bg-[#26547C]/10 rounded-full">
              <Calendar className="w-6 h-6 text-[#26547C]" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-[#4A90E2]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Publiés
              </p>
              <p className="text-2xl font-bold text-[#4A90E2]">{published}</p>
            </div>
            <div className="p-2 bg-[#4A90E2]/10 rounded-full">
              <CheckCircle className="w-6 h-6 text-[#4A90E2]" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-[#FF8C42]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Brouillons
              </p>
              <p className="text-2xl font-bold text-[#FF8C42]">{drafts}</p>
            </div>
            <div className="p-2 bg-[#FF8C42]/10 rounded-full">
              <Edit className="w-6 h-6 text-[#FF8C42]" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-[#C9A0DC]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Terminés
              </p>
              <p className="text-2xl font-bold text-[#C9A0DC]">{completed}</p>
            </div>
            <div className="p-2 bg-[#C9A0DC]/10 rounded-full">
              <Clock className="w-6 h-6 text-[#C9A0DC]" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-[#FFB647]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                En attente
              </p>
              <p className="text-2xl font-bold text-[#FFB647]">
                {pendingRequests}
              </p>
            </div>
            <div className="p-2 bg-[#FFB647]/10 rounded-full">
              <BookOpen className="w-6 h-6 text-[#FFB647]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
