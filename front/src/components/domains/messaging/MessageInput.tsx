"use client";

import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/lib/socket-client";

interface MessageInputProps {
  onSend: (content: string) => void;
  conversationId: string;
}

export function MessageInput({ onSend, conversationId }: Readonly<MessageInputProps>) {
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTypedRef = useRef(false);

  const emitTypingStart = () => {
    if (socket && socket.connected && !hasTypedRef.current) {
      socket.emit("typing-start", { conversationId });
      hasTypedRef.current = true;
    }
  };

  const emitTypingStop = () => {
    if (socket && socket.connected && hasTypedRef.current) {
      socket.emit("typing-stop", { conversationId });
      hasTypedRef.current = false;
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);

    if (value.trim().length > 0) {
      emitTypingStart();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        emitTypingStop();
      }, 3000);
    } else {
      emitTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    emitTypingStop();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsSending(true);
    onSend(message);
    setMessage("");
    setIsSending(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitTypingStop();
    };
  }, []);

  return (
    <div className="flex gap-2 items-end">
      <Textarea
        value={message}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écris ton message..."
        className={cn(
          "min-h-[60px] max-h-[200px] resize-none rounded-2xl border-border",
          "focus:ring-2 focus:ring-brand"
        )}
        rows={1}
        disabled={isSending}
      />
      <Button
        variant="cta"
        size="icon"
        onClick={handleSend}
        disabled={!message.trim() || isSending}
        className="h-[60px] w-[60px] shrink-0"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
