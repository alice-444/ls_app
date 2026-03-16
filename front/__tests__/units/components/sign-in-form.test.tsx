import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { assertNoViolations } from "../lib/axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/types/trpc-router";
import SignInForm from "@/components/domains/auth/SignInForm";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const mockSignInEmail = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
    signIn: {
      email: (...args: unknown[]) => mockSignInEmail(...args),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/api-client", () => ({
  getUserRole: vi.fn(() => Promise.resolve("MENTOR")),
}));

// @ts-expect-error - AppRouter type stub doesn't satisfy Router constraint (_def, createCaller); real types from backend
const trpc = createTRPCReact<AppRouter>() as any;
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

function renderSignInForm(onSwitchToSignUp = vi.fn()) {
  return render(
    <trpc.Provider client={getClient()} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SignInForm onSwitchToSignUp={onSwitchToSignUp} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading and form fields", () => {
    renderSignInForm();
    expect(screen.getByRole("heading", { name: /bienvenue/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^se connecter$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pas encore de compte/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mot de passe oublié/i })).toBeInTheDocument();
  });

  it("calls onSwitchToSignUp when Sign Up link is clicked", async () => {
    const user = userEvent.setup();
    const onSwitchToSignUp = vi.fn();
    renderSignInForm(onSwitchToSignUp);
    await user.click(screen.getByRole("button", { name: /pas encore de compte/i }));
    expect(onSwitchToSignUp).toHaveBeenCalledTimes(1);
  });

  it("calls router.push(/forgot-password) when Forgot Password is clicked", async () => {
    const user = userEvent.setup();
    renderSignInForm();
    await user.click(screen.getByRole("button", { name: /mot de passe oublié/i }));
    expect(mockPush).toHaveBeenCalledWith("/forgot-password");
  });

  it("submits with email and password and calls authClient.signIn.email", async () => {
    const user = userEvent.setup();
    mockSignInEmail.mockImplementation((_cred, opts: { onSuccess?: () => void }) => {
      opts?.onSuccess?.();
    });
    renderSignInForm();
    await user.type(screen.getByLabelText(/email/i), "a@b.co");
    await user.type(screen.getByLabelText(/mot de passe/i), "password1");
    await user.click(screen.getByRole("button", { name: /^se connecter$/i }));
    expect(mockSignInEmail).toHaveBeenCalledWith(
      { email: "a@b.co", password: "password1" },
      expect.any(Object)
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = renderSignInForm();
    await assertNoViolations(container);
  });
});
