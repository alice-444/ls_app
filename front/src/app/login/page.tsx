"use client";

import SignInForm from "@/components/domains/auth/SignInForm";
import SignUpForm from "@/components/domains/auth/SignUpForm";
import { useState, useEffect, Suspense } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/shared/Loader";
import { AnimatePresence, motion } from "framer-motion";

function LoginContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const { data: session, isPending } = authClient.useSession();
  const [showSignIn, setShowSignIn] = useState(mode === "signin");

  useEffect(() => {
    setShowSignIn(mode === "signin");
  }, [mode]);

  if (isPending) return <Loader fullScreen size="lg" />;
  if (session) redirect("/dashboard");

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
            <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
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
