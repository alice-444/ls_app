import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialiser ton Mot de Passe",
  description: "Choisis un nouveau mot de passe sécurisé pour ton compte LearnSup.",
};

export default function ResetPasswordLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden intro-bg-base">
      <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
