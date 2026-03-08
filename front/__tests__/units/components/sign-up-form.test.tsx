import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/types/trpc-router";
import SignUpForm from "@/components/sign-up-form";

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
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /already have an account\? sign in/i })).toBeInTheDocument();
  });

  it("calls onSwitchToSignIn when Sign In link is clicked", async () => {
    const user = userEvent.setup();
    const onSwitchToSignIn = vi.fn();
    renderSignUpForm(onSwitchToSignIn);
    await user.click(screen.getByRole("button", { name: /already have an account\? sign in/i }));
    expect(onSwitchToSignIn).toHaveBeenCalledTimes(1);
  });

  it("submits and calls customAuthClient.signUpEmail then signIn.email on success", async () => {
    const user = userEvent.setup();
    mockSignUpEmail.mockResolvedValue(undefined);
    mockSignInEmail.mockImplementation((_cred, opts: { onSuccess?: () => void }) => {
      opts?.onSuccess?.();
    });
    renderSignUpForm();
    await user.type(screen.getByLabelText("Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Username"), "jane");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));
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
