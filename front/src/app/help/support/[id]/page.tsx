"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  MessageSquare,
  Clock,
  Info,
  LifeBuoy
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/shared/back-button";
import { SupportThread } from "@/components/domains/admin/support/support-thread";
import { PageContainer } from "@/components/shared/layout";

export default function SupportRequestDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: request, isLoading } = trpc.support.getDetailedRequest.useQuery({
    requestId: id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En attente</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>;
      case "RESOLVED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Résolu</Badge>;
      case "CLOSED":
        return <Badge variant="secondary">Fermé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <PageContainer className="py-4 sm:py-6 lg:py-8">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      </PageContainer>
    );
  }

  if (!request) {
    return (
      <PageContainer className="py-4 sm:py-6 lg:py-8">
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold">Ticket introuvable</h1>
          <p className="text-ls-muted mt-2">Cette demande de support n'existe pas ou vous n'y avez pas accès.</p>
          <Button asChild className="mt-6 rounded-full bg-brand">
            <BackButton href="/help/support" label="Retour à mes demandes" />
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-4 sm:py-6 lg:py-8">
      <div className="mb-8">
        <BackButton href="/help/support" label="Retour à mes demandes" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-ls-heading">{request.subject}</h1>
              {getStatusBadge(request.status)}
            </div>
            <p className="text-ls-muted flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Ticket #{id.slice(-6)} • Créé le {format(new Date(request.createdAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SupportThread requestId={id} isAdmin={false} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-brand" />
                Détails du ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-ls-muted text-xs uppercase font-semibold">Type de problème</p>
                <p className="font-medium">{request.problemType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-ls-muted text-xs uppercase font-semibold">Dernière mise à jour</p>
                <p className="font-medium">{format(new Date(request.updatedAt), "dd/MM/yyyy HH:mm")}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-ls-muted text-xs mb-2 italic text-center">
                  L'équipe LearnSup traite votre demande dans les plus brefs délais.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-brand/5 border-2 border-brand/20 rounded-2xl p-6 text-center">
            <LifeBuoy className="h-10 w-10 text-brand mx-auto mb-3" />
            <h3 className="font-bold text-ls-heading">Besoin d'autre chose ?</h3>
            <p className="text-xs text-ls-muted mt-2">
              Si votre problème a été résolu ou si vous avez une nouvelle question, n'hésitez pas à nous en faire part.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
