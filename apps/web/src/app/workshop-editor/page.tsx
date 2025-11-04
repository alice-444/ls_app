"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export default function WorkshopEditorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Workshop Studio
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Ton espace pour créer tes ateliers.
          </p>
        </div>

        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-indigo-600 rounded-full w-fit mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl mb-2">
              Aucun atelier pour le moment
            </CardTitle>
            <CardDescription className="text-lg">
              Commencez ici 👇
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Créer votre premier atelier
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
