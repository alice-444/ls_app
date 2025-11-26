"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ArrowLeft } from "lucide-react";
import { trpc } from "@/utils/trpc";

export default function BuyCreditsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { data: creditBalance } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // TODO: Intégrer le service de paiement externe (Stripe, etc.)
  // Pour l'instant, c'est une page placeholder
  const handleBuyCredits = (packageId: string) => {
    // Placeholder - à remplacer par l'intégration du service de paiement
    alert(`Intégration du paiement à venir. Package sélectionné: ${packageId}`);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const creditPackages = [
    { id: "small", credits: 50, price: 9.99, popular: false },
    { id: "medium", credits: 100, price: 17.99, popular: true },
    { id: "large", credits: 200, price: 29.99, popular: false },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Acheter des crédits</h1>
          <p className="text-muted-foreground">
            Rechargez votre compte pour continuer à participer aux ateliers
          </p>
          {creditBalance !== undefined && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium w-fit">
              <Coins className="w-4 h-4" />
              <span>Solde actuel: {creditBalance.balance} crédits</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative ${
                pkg.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Populaire
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">
                  {pkg.credits} crédits
                </CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    {pkg.price.toFixed(2)}€
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    / {pkg.credits} crédits
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  onClick={() => handleBuyCredits(pkg.id)}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Acheter {pkg.credits} crédits
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Comment ça marche ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Chaque demande de participation à un atelier coûte 10 crédits
            </p>
            <p>
              • Les crédits sont débités uniquement lorsque votre demande est
              envoyée
            </p>
            <p>• Les crédits non utilisés restent valides indéfiniment</p>
            <p>
              • Vous pouvez consulter votre historique de transactions dans les
              paramètres
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
