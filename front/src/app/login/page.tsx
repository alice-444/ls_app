"use client";

import SignInForm from "@/components/domains/auth/SignInForm";
import SignUpForm from "@/components/domains/auth/SignUpForm";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-server-client";
import Loader from "@/components/shared/Loader";
import { AnimatePresence, motion } from "framer-motion";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const { data: session, isPending } = authClient.useSession();
  const [showSignIn, setShowSignIn] = useState(mode !== "signup");

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    setShowSignIn(mode !== "signup");
  }, [mode]);

  const handleSwitchMode = (newMode: "signin" | "signup") => {
    const params = new URLSearchParams(searchParams.toString());
    if (newMode === "signup") {
      params.set("mode", "signup");
    } else {
      params.delete("mode");
    }
    router.push(`/login?${params.toString()}`);
  };

  if (isPending) return <Loader fullScreen size="lg" />;

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {showSignIn ? (
          <motion.div
            key="signin"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SignInForm onSwitchToSignUp={() => handleSwitchMode("signup")} />
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SignUpForm onSwitchToSignIn={() => handleSwitchMode("signin")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader fullScreen size="lg" />}>
      <LoginContent />
    </Suspense>
  );
}
