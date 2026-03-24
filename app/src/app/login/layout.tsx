import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion ou Inscription",
  description: "Rejoins la communauté LearnSup. Connecte-toi pour accéder à tes ateliers ou crée un compte pour commencer à apprendre.",
};

export default function LoginLayout({
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
