import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignInForm from "@/components/sign-in-form";

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

function renderSignInForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SignInForm onSwitchToSignUp={vi.fn()} />
    </QueryClientProvider>
  );
}

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading and form fields", () => {
    renderSignInForm();
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /need an account\? sign up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /forgot password\?/i })).toBeInTheDocument();
  });

  it("calls onSwitchToSignUp when Sign Up link is clicked", async () => {
    const user = userEvent.setup();
    const onSwitchToSignUp = vi.fn();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <SignInForm onSwitchToSignUp={onSwitchToSignUp} />
      </QueryClientProvider>
    );
    await user.click(screen.getByRole("button", { name: /need an account\? sign up/i }));
    expect(onSwitchToSignUp).toHaveBeenCalledTimes(1);
  });

  it("calls router.push(/forgot-password) when Forgot Password is clicked", async () => {
    const user = userEvent.setup();
    renderSignInForm();
    await user.click(screen.getByRole("button", { name: /forgot password\?/i }));
    expect(mockPush).toHaveBeenCalledWith("/forgot-password");
  });

  it("submits with email and password and calls authClient.signIn.email", async () => {
    const user = userEvent.setup();
    mockSignInEmail.mockImplementation((_cred, opts: { onSuccess?: () => void }) => {
      opts?.onSuccess?.();
    });
    renderSignInForm();
    await user.type(screen.getByLabelText(/email/i), "a@b.co");
    await user.type(screen.getByLabelText(/password/i), "password1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(mockSignInEmail).toHaveBeenCalledWith(
      { email: "a@b.co", password: "password1" },
      expect.any(Object)
    );
  });
});
