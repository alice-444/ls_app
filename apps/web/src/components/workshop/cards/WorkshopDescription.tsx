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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          {description ? (
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {description}
            </p>
          ) : (
            <p className="text-slate-500 italic">
              Aucune description disponible
            </p>
          )}
        </CardContent>
      </Card>

      {materialsNeeded && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Matériel nécessaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {materialsNeeded}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
