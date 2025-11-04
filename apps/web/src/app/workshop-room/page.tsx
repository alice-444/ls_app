"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, GraduationCap } from "lucide-react";

export default function WorkshopRoomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Workshop Room
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            La salle virtuelle où l'apprenant découvre et rejoint l'atelier.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-purple-600 rounded-full w-fit mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl mb-2">
              Bienvenue dans le Workshop Room 👋
            </CardTitle>
            <CardDescription className="text-lg">
              Découvrez les ateliers disponibles et rejoignez ceux qui vous intéressent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">
                Les ateliers seront bientôt disponibles
              </p>
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Rechercher des ateliers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

