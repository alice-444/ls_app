"use client";

import { useState } from "react";
import { Download, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api-client";

export function ExportDataSection() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Direct download via window.location.href or a hidden link
      // This works well for GET endpoints that return attachment
      const exportUrl = `${API_BASE_URL}/api/profile/export`;
      
      // Using fetch to handle errors better before triggering download
      const response = await fetch(exportUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        // Better auth might need credentials
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération de l'export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Get filename from header if possible
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "learnsup-export.json";
      if (contentDisposition && contentDisposition.indexOf("filename=") !== -1) {
        filename = contentDisposition.split("filename=")[1].replace(/"/g, "");
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Ton export a été généré avec succès.");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Impossible de générer l'export. Réessaie plus tard.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-(--primary-orange)/10 text-(--primary-orange)">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ls-heading">Portabilité des données</h2>
          <p className="text-sm text-ls-text opacity-70">RGPD Article 20</p>
        </div>
      </div>

        <div className="bg-card/80 border border-border/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-ls-heading">
              Qu'est-ce que l'export de données ?
            </p>
            <p className="text-sm text-ls-muted leading-relaxed">
              Conformément au Règlement Général sur la Protection des Données (RGPD), tu as le droit de récupérer tes données personnelles dans un format structuré, couramment utilisé et lisible par machine.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm text-ls-muted mb-4">
            L'archive contiendra tes informations de profil, tes messages, tes ateliers, tes demandes ainsi que ton historique de crédits.
          </p>
          
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-brand hover:bg-brand-hover text-white rounded-full px-6 py-2 h-auto flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exporter mes données (JSON)
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-border/50 bg-card/50">
        <p className="text-xs text-ls-muted">
          Note : La génération de l'export peut prendre quelques instants si tu as beaucoup de données. Une fois prêt, le téléchargement commencera automatiquement dans ton navigateur.
        </p>
      </div>
    </div>
  );
}
