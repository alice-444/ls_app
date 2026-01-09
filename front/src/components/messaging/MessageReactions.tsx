"use client";

import { useState } from "react";
import { Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";
import { toast } from "sonner";

interface MessageReactionsProps {
  messageId: string;
  currentUserId: string;
  conversationId: string;
}

export function MessageReactions({
  messageId,
  currentUserId,
  conversationId,
}: MessageReactionsProps) {
  const socket = useSocket();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { data: reactions, refetch } =
    trpc.messaging.getMessageReactions.useQuery(
      { messageId },
      {
        refetchInterval: 5000,
      }
    );

  const addReactionMutation = trpc.messaging.addReaction.useMutation({
    onSuccess: () => {
      refetch();
      setIsPickerOpen(false);
    },
    onError: (error: any) => {
      toast.error("Erreur", {
        description: error.message,
      });
    },
  });

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (socket && socket.connected) {
      socket.emit("add-reaction", {
        messageId,
        emoji: emojiData.emoji,
      });
    } else {
      addReactionMutation.mutate({
        messageId,
        emoji: emojiData.emoji,
      });
    }
  };

  const handleReactionClick = (emoji: string) => {
    const userReaction = reactions?.find(
      (r: any) => r.emoji === emoji && r.userReacted
    );

    if (userReaction) {
      if (socket && socket.connected) {
        socket.emit("remove-reaction", {
          messageId,
          emoji,
        });
      }
    } else {
      if (socket && socket.connected) {
        socket.emit("add-reaction", {
          messageId,
          emoji,
        });
      } else {
        addReactionMutation.mutate({
          messageId,
          emoji,
        });
      }
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {reactions && reactions.length > 0 && (
        <div className="flex items-center gap-1">
          {reactions.map((reaction: any) => (
            <Button
              key={reaction.emoji}
              size="sm"
              variant={reaction.userReacted ? "default" : "outline"}
              className={cn(
                "h-6 px-2 text-xs rounded-full",
                reaction.userReacted && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleReactionClick(reaction.emoji)}
            >
              <span className="mr-1">{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </Button>
          ))}
        </div>
      )}

      <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 rounded-full"
          >
            <Smile className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            skinTonesDisabled
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
