import { describe, beforeEach, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "@/components/domains/messaging/MessageInput";

const mockEmit = vi.fn();
vi.mock("@/lib/socket-client", () => ({
  useSocket: () => ({
    connected: true,
    emit: mockEmit,
  }),
}));

describe("MessageInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders textarea and send button", () => {
    render(
      <MessageInput onSend={vi.fn()} conversationId="conv-1" />
    );
    expect(screen.getByPlaceholderText("Écris ton message...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("send button is disabled when message is empty", () => {
    render(
      <MessageInput onSend={vi.fn()} conversationId="conv-1" />
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("updates input value when typing", async () => {
    const user = userEvent.setup();
    render(
      <MessageInput onSend={vi.fn()} conversationId="conv-1" />
    );
    const textarea = screen.getByPlaceholderText("Écris ton message...");
    await user.type(textarea, "Hello");
    expect(textarea).toHaveValue("Hello");
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("calls onSend with message when send button is clicked", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(
      <MessageInput onSend={onSend} conversationId="conv-1" />
    );
    await user.type(screen.getByPlaceholderText("Écris ton message..."), "Hi");
    await user.click(screen.getByRole("button"));
    expect(onSend).toHaveBeenCalledWith("Hi");
  });

  it("clears input after send", async () => {
    const user = userEvent.setup();
    render(
      <MessageInput onSend={vi.fn()} conversationId="conv-1" />
    );
    const textarea = screen.getByPlaceholderText("Écris ton message...");
    await user.type(textarea, "Hi");
    await user.click(screen.getByRole("button"));
    expect(textarea).toHaveValue("");
  });
});
