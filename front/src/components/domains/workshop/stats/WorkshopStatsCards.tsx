"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, Edit, Clock, BookOpen } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface WorkshopStatsCardsProps {
  total: number;
  published: number;
  drafts: number;
  completed: number;
  pendingRequests: number;
}

const statCards = [
  { key: "total", color: "#26547C", icon: Calendar, label: "Total" },
  { key: "published", color: "#4A90E2", icon: CheckCircle, label: "Publiés" },
  { key: "drafts", color: "#FF8C42", icon: Edit, label: "Brouillons" },
  { key: "completed", color: "#C9A0DC", icon: Clock, label: "Terminés" },
  { key: "pendingRequests", color: "#FFB647", icon: BookOpen, label: "En attente" },
] as const;

export function WorkshopStatsCards({
  total,
  published,
  drafts,
  completed,
  pendingRequests,
}: WorkshopStatsCardsProps) {
  const prefersReducedMotion = useReducedMotion();
  const values = { total, published, drafts, completed, pendingRequests };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {statCards.map(({ key, color, icon: Icon, label }, index) => (
        <motion.div
          key={key}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : index * 0.05 }}
          whileHover={prefersReducedMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
        >
          <Card
            className="border-l-4 border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-lg transition-shadow duration-200 hover:shadow-xl"
            style={{ borderLeftColor: color }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="text-2xl font-bold" style={{ color }}>
                    {values[key]}
                  </p>
                </div>
                <div
                  className="p-2 rounded-full"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
