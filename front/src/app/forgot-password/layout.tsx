import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié | LearnSup",
  description: "Demandez un lien pour réinitialiser votre mot de passe LearnSup.",
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
