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
import { Coins, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { PageContainer } from "@/components/layout";
import { BackButton } from "@/components/back-button";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";

function BuyCreditsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  
  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session,
  });

  const { data: creditBalance, refetch: refetchBalance } =
    trpc.credits.getBalance.useQuery(undefined, {
      enabled: !!session && userRole === "APPRENANT",
    });

  const createCheckoutSession = trpc.credits.createCheckoutSession.useMutation({
    onSuccess: (data: { url?: string }) => {
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
    if (session && userRole && userRole !== "APPRENANT") {
      router.replace("/dashboard");
    }
  }, [session, userRole, router]);

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

  if (isPending || isLoadingRole) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-brand mx-auto mb-4" />
            <p className="text-ls-muted">Chargement...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const creditPackages = [
    { id: "small", credits: 50, price: 9.99, popular: false },
    { id: "medium", credits: 100, price: 17.99, popular: true },
    { id: "large", credits: 200, price: 29.99, popular: false },
  ];

  return (
    <PageContainer className="py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <BackButton onClick={() => router.back()} />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF8C42] via-[#FFB647] to-[#FF8C42] text-white shadow-lg shadow-[#FF8C42]/25">
              <Coins className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <ShinyText text="Acheter des crédits" />
          </h1>
          <p className="text-base sm:text-lg text-ls-muted mt-2">
            Recharge ton compte pour continuer à participer aux ateliers
          </p>
          {creditBalance !== undefined && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-brand/15 border border-brand/30 text-brand font-semibold w-fit">
              <Coins className="w-4 h-4" />
              <span>Solde actuel : {creditBalance.balance} crédits</span>
            </div>
          )}
        </motion.div>
      </div>

        {success === "true" && (
          <Alert className="mb-6 rounded-2xl border-green-500/50 bg-green-500/10 backdrop-blur-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong className="block mb-1">Paiement réussi !</strong>
              Tes crédits ont été ajoutés à ton compte. Merci pour ton achat !
            </AlertDescription>
          </Alert>
        )}

        {canceled === "true" && (
          <Alert className="mb-6 rounded-2xl border-amber-500/50 bg-amber-500/10 backdrop-blur-sm">
            <XCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong className="block mb-1">Paiement annulé</strong>
              Ton paiement a été annulé. Aucun montant n&apos;a été débité.
            </AlertDescription>
          </Alert>
        )}

        {createCheckoutSession.error && (
          <Alert className="mb-6 rounded-2xl border-destructive/50 bg-destructive/10 backdrop-blur-sm">
            <XCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <strong className="block mb-1">Erreur</strong>
              {createCheckoutSession.error.message ||
                "Une erreur est survenue lors de la création de la session de paiement."}
            </AlertDescription>
          </Alert>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-visible"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {creditPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + index * 0.08 }}
              className={`overflow-visible ${pkg.popular ? "md:-mt-2 md:mb-2" : ""}`}
            >
              <Card
                className={`relative rounded-2xl border bg-card/95 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl overflow-visible ${
                  pkg.popular
                    ? "border-brand shadow-brand/20 md:scale-105 ring-2 ring-brand/30"
                    : "border-border/50 shadow-black/5 hover:shadow-brand/10"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="flex items-center gap-1 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      Populaire
                    </span>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-ls-heading">
                    {pkg.credits} crédits
                  </CardTitle>
                  <CardDescription className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-ls-heading">
                      {pkg.price.toFixed(2)} €
                    </span>
                    <span className="text-sm text-ls-muted">
                      / {pkg.credits} crédits
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={pkg.popular ? "cta" : "ctaOutline"}
                    size="cta"
                    className="w-full"
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
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="mt-8 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-xl shadow-black/5 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-ls-heading">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <Sparkles className="h-5 w-5" />
                </span>
                Comment ça marche ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-ls-muted">
              <p>• Chaque demande de participation à un atelier coûte 10 crédits</p>
              <p>• Les crédits sont débités uniquement lorsque ta demande est envoyée</p>
              <p>• Les crédits non utilisés restent valides indéfiniment</p>
              <p>• Tu peux consulter ton historique de transactions dans les paramètres</p>
            </CardContent>
          </Card>
        </motion.div>
    </PageContainer>
  );
}

export default function BuyCreditsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-brand mx-auto mb-4" />
              <p className="text-ls-muted">Chargement...</p>
            </div>
          </div>
        </PageContainer>
      }
    >
      <BuyCreditsContent />
    </Suspense>
  );
}
