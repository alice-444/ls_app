import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatSocket, type ChatMessage } from "@/hooks/useChatSocket";

describe("useChatSocket", () => {
  const conversationId = "conv-123";
  const sessionUserId = "user-me";
  const setLocalMessages = vi.fn();
  const setTypingUsers = vi.fn();
  const markAsRead = vi.fn();
  const refetch = vi.fn();

  let socketHandlers: Record<string, Function> = {};
  const mockSocket = {
    emit: vi.fn(),
    on: vi.fn((event, handler) => {
      socketHandlers[event] = handler;
    }),
    off: vi.fn((event) => {
      delete socketHandlers[event];
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    socketHandlers = {};
  });

  it("joins conversation on mount and leaves on unmount", () => {
    const { unmount } = renderHook(() =>
      useChatSocket({
        socket: mockSocket as any,
        conversationId,
        sessionUserId,
        setLocalMessages,
        setTypingUsers,
        markAsRead,
        refetch,
      })
    );

    expect(mockSocket.emit).toHaveBeenCalledWith("join-conversation", conversationId);
    expect(mockSocket.on).toHaveBeenCalled();

    unmount();
    expect(mockSocket.emit).toHaveBeenCalledWith("leave-conversation", conversationId);
    expect(mockSocket.off).toHaveBeenCalled();
  });

  it("handles new-message event", async () => {
    renderHook(() =>
      useChatSocket({
        socket: mockSocket as any,
        conversationId,
        sessionUserId,
        setLocalMessages,
        setTypingUsers,
        markAsRead,
        refetch,
      })
    );

    const newMessage = {
      messageId: "msg-1",
      senderId: "user-other",
      content: "Hello",
      conversationId: conversationId,
      createdAt: new Date().toISOString(),
    };

    // Trigger the handler directly
    await act(async () => {
      socketHandlers["new-message"](newMessage);
    });

    expect(setLocalMessages).toHaveBeenCalled();
    const updater = setLocalMessages.mock.calls[0][0];
    const result = updater([]);
    expect(result).toEqual([newMessage]);
    expect(markAsRead).toHaveBeenCalled();
  });

  it("does not mark as read if message is from self", async () => {
    renderHook(() =>
      useChatSocket({
        socket: mockSocket as any,
        conversationId,
        sessionUserId,
        setLocalMessages,
        setTypingUsers,
        markAsRead,
        refetch,
      })
    );

    const myMessage = {
      messageId: "msg-1",
      senderId: sessionUserId,
      content: "Hello",
      conversationId: conversationId,
      createdAt: new Date().toISOString(),
    };

    await act(async () => {
      socketHandlers["new-message"](myMessage);
    });
    
    expect(markAsRead).not.toHaveBeenCalled();
  });

  it("handles user-typing event", async () => {
    vi.useFakeTimers();
    renderHook(() =>
      useChatSocket({
        socket: mockSocket as any,
        conversationId,
        sessionUserId,
        conversation: {
          otherUserId: "user-other",
          otherUserDisplayName: "John Doe",
        },
        setLocalMessages,
        setTypingUsers,
        markAsRead,
        refetch,
      })
    );

    await act(async () => {
      socketHandlers["user-typing"]({
        userId: "user-other",
        conversationId: conversationId,
      });
    });

    expect(setTypingUsers).toHaveBeenCalled();
    const updater = setTypingUsers.mock.calls[0][0];
    const map = updater(new Map());
    expect(map.get("user-other")).toBe("John Doe");

    vi.useRealTimers();
  });

  it("handles message-updated event", async () => {
    renderHook(() =>
      useChatSocket({
        socket: mockSocket as any,
        conversationId,
        sessionUserId,
        setLocalMessages,
        setTypingUsers,
        markAsRead,
        refetch,
      })
    );

    const updatedData = {
      messageId: "msg-1",
      conversationId: conversationId,
      content: "Updated content",
      editCount: 1,
    };

    await act(async () => {
      socketHandlers["message-updated"](updatedData);
    });

    expect(setLocalMessages).toHaveBeenCalled();
    const updater = setLocalMessages.mock.calls[0][0];
    const initialMessages: ChatMessage[] = [
      { messageId: "msg-1", senderId: "other", content: "Old", createdAt: "now" }
    ];
    const result = updater(initialMessages);
    expect(result[0].content).toBe("Updated content");
  });
});
