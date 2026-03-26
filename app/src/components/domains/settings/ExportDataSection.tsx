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
      const exportUrl = `${API_BASE_URL}/api/profile/export`;

      const response = await fetch(exportUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la demande d'export");
      }

      const result = await response.json();

      toast.success(result.message || "Un email de téléchargement vous a été envoyé.");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Impossible de demander l'export. Réessaie plus tard.");
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
              Comment fonctionne l'export ?
            </p>
            <p className="text-sm text-ls-muted leading-relaxed">
              Pour ta sécurité, le lien de téléchargement te sera envoyé par email. Ce lien est personnel et expirera après 24 heures.
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
            variant="cta" size="cta" className="px-6 py-2 h-auto"
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
          Note : Par mesure de sécurité, nous vérifions ton identité avant d'autoriser le téléchargement. Vérifie tes emails (et tes spams) après avoir cliqué sur le bouton.
        </p>
      </div>
    </div>
  );
}
