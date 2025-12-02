import { QueryCache, QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../back/src/routers";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // Ignore authentication errors - they're expected when user is not logged in
      const isAuthError =
        error.message === "Authentication required" ||
        error.message?.includes("Authentication required") ||
        (error as any)?.data?.code === "UNAUTHORIZED";

      // Don't show toast for auth errors on login/sign-up pages
      if (isAuthError) {
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "";
        if (currentPath === "/login" || currentPath === "/sign-up") {
          return; // Silently ignore auth errors on auth pages
        }
      }

      toast.error(error.message, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
