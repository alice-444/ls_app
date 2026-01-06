"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface WorkshopDescriptionProps {
  description?: string | null;
  materialsNeeded?: string | null;
}

export function WorkshopDescription({
  description,
  materialsNeeded,
}: WorkshopDescriptionProps) {
  return (
    <>
      <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
            <FileText className="w-5 h-5" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          {description ? (
            <p className="text-[#161616] dark:text-[#e6e6e6] whitespace-pre-wrap">
              {description}
            </p>
          ) : (
            <p className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] italic">
              Aucune description disponible
            </p>
          )}
        </CardContent>
      </Card>

      {materialsNeeded && (
        <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6]">
              <FileText className="w-5 h-5" />
              Matériel nécessaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#161616] dark:text-[#e6e6e6] whitespace-pre-wrap">
              {materialsNeeded}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
