"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ArrowLeft, Loader2, CheckCircle2, XCircle  } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";

function BuyCreditsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const { data: creditBalance, refetch: refetchBalance } =
    trpc.credits.getBalance.useQuery(undefined, {
      enabled: !!session,
    });

  const createCheckoutSession = trpc.credits.createCheckoutSession.useMutation({
    onSuccess: (data: any) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
  });

  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const checkoutId = searchParams.get("checkout_id") || searchParams.get("session_id");

    if (success === "true" && checkoutId) {
      refetchBalance();
    }
  }, [searchParams, refetchBalance]);

  const handleBuyCredits = async (credits: number, price: number) => {
    setLoadingPackage(`${credits}-${price}`);
    try {
      await createCheckoutSession.mutateAsync({
        credits,
        amount: price,
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoadingPackage(null);
    }
  };

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

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

        {success === "true" && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              <strong className="text-green-800 dark:text-green-200 block mb-1">
                Paiement réussi !
              </strong>
              Vos crédits ont été ajoutés à votre compte. Merci pour votre achat
              !
            </AlertDescription>
          </Alert>
        )}

        {canceled === "true" && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <XCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              <strong className="text-yellow-800 dark:text-yellow-200 block mb-1">
                Paiement annulé
              </strong>
              Votre paiement a été annulé. Aucun montant n'a été débité.
            </AlertDescription>
          </Alert>
        )}

        {createCheckoutSession.error && (
          <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <strong className="text-red-800 dark:text-red-200 block mb-1">
                Erreur
              </strong>
              {createCheckoutSession.error.message ||
                "Une erreur est survenue lors de la création de la session de paiement."}
            </AlertDescription>
          </Alert>
        )}

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
                  onClick={() => handleBuyCredits(pkg.credits, pkg.price)}
                  disabled={
                    createCheckoutSession.isPending ||
                    loadingPackage === `${pkg.credits}-${pkg.price}`
                  }
                >
                  {loadingPackage === `${pkg.credits}-${pkg.price}` ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Acheter {pkg.credits} crédits
                    </>
                  )}
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

export default function BuyCreditsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }
    >
      <BuyCreditsContent />
    </Suspense>
  );
}
