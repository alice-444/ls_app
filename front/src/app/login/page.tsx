"use client";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const { data: session, isPending } = authClient.useSession();
  const [showSignIn, setShowSignIn] = useState(mode === "signin");

  useEffect(() => {
    setShowSignIn(mode === "signin");
  }, [mode]);

  useEffect(() => {
    if (session && !isPending) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <Loader />;
  }

  if (session) {
    return <Loader />;
  }

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
