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
      <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ls-heading">
            <FileText className="w-5 h-5" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          {description ? (
            <p className="text-ls-text whitespace-pre-wrap">
              {description}
            </p>
          ) : (
            <p className="text-ls-muted italic">
              Aucune description disponible
            </p>
          )}
        </CardContent>
      </Card>

      {materialsNeeded && (
        <Card className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-ls-heading">
              <FileText className="w-5 h-5" />
              Matériel nécessaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ls-text whitespace-pre-wrap">
              {materialsNeeded}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
