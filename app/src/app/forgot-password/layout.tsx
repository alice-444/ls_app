import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de Passe Oublié",
  description: "Récupère l'accès à ton compte LearnSup. Demande un lien de réinitialisation sécurisé.",
};

export default function ForgotPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden intro-bg-base">
      <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
