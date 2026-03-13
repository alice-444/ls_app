import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/types/trpc-router";
import SignUpForm from "@/components/domains/auth/sign-up-form";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSignUpEmail = vi.fn();
const mockSignInEmail = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
    signIn: {
      email: (...args: unknown[]) => mockSignInEmail(...args),
    },
  },
  customAuthClient: {
    signUpEmail: (...args: unknown[]) => mockSignUpEmail(...args),
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// @ts-expect-error - AppRouter type stub doesn't satisfy Router constraint (_def, createCaller); real types from backend
const trpc = createTRPCReact<AppRouter>();
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});
const getClient = () =>
  trpc.createClient({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/api/trpc",
        fetch: () => Promise.resolve({ ok: true, json: () => ({}) } as Response),
      }),
    ],
  });

function renderSignUpForm(onSwitchToSignIn = vi.fn()) {
  return render(
    <trpc.Provider client={getClient()} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SignUpForm onSwitchToSignIn={onSwitchToSignIn} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading and form fields", () => {
    renderSignUpForm();
    expect(screen.getByRole("heading", { name: /créer un compte/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
    expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /créer mon compte/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /déjà un compte/i })).toBeInTheDocument();
  });

  it("calls onSwitchToSignIn when Sign In link is clicked", async () => {
    const user = userEvent.setup();
    const onSwitchToSignIn = vi.fn();
    renderSignUpForm(onSwitchToSignIn);
    await user.click(screen.getByRole("button", { name: /déjà un compte/i }));
    expect(onSwitchToSignIn).toHaveBeenCalledTimes(1);
  });

  it("submits and calls customAuthClient.signUpEmail then signIn.email on success", async () => {
    const user = userEvent.setup();
    mockSignUpEmail.mockResolvedValue(undefined);
    mockSignInEmail.mockImplementation((_cred, opts: { onSuccess?: () => void }) => {
      opts?.onSuccess?.();
    });
    renderSignUpForm();
    await user.type(screen.getByLabelText("Nom"), "Jane Doe");
    await user.type(screen.getByLabelText(/nom d'utilisateur/i), "jane");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/mot de passe/i), "password123");
    await user.click(screen.getByRole("button", { name: /créer mon compte/i }));
    await vi.waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith(
        "jane@example.com",
        "password123",
        "Jane Doe",
        "jane"
      );
    });
    await vi.waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/onboarding");
    });
  });
});
