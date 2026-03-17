"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import type { SupportRequestDetailed, SupportMessage } from "@ls-app/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, User, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SupportThreadProps {
  readonly requestId: string;
  readonly isAdmin?: boolean;
}

export function SupportThread({ requestId, isAdmin = false }: SupportThreadProps) {
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: request, isLoading, refetch } = trpc.support.getDetailedRequest.useQuery({
    requestId,
  });

  const addMessageMutation = trpc.support.addMessage.useMutation({
    onSuccess: () => {
      setContent("");
      refetch();
      toast.success("Message envoyé");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [request?.messages]);

  const handleSend = () => {
    if (!content.trim()) return;
    addMessageMutation.mutate({
      requestId,
      content: content.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) return <div>Ticket introuvable.</div>;

  return (
    <div className="flex flex-col h-full max-h-[600px] border rounded-xl bg-ls-surface shadow-sm overflow-hidden">
      {/* Header du thread */}
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase">
            Thread #{requestId.slice(-6)}
          </Badge>
          <span className="text-sm font-medium text-ls-muted italic">
            Conversation avec {request.user?.name || request.email}
          </span>
        </div>
      </div>

      {/* Liste des messages */}
      <div className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto">
        <div className="space-y-4">
          {request.messages.map((message: SupportMessage) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col max-w-[85%]",
                message.isAdmin ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                {!message.isAdmin && (
                  <span className="text-[10px] font-bold text-ls-muted">
                    {request.user?.name || "Utilisateur"}
                  </span>
                )}
                {message.isAdmin && (
                  <span className="text-[10px] font-bold text-brand flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </span>
                )}
                <span className="text-[10px] text-ls-muted/60">
                  {format(new Date(message.createdAt), "HH:mm", { locale: fr })}
                </span>
              </div>
              
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                  message.isAdmin
                    ? "bg-brand text-white rounded-tr-none"
                    : "bg-white dark:bg-slate-800 border text-ls-heading rounded-tl-none"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input de réponse */}
      <div className="p-4 border-t bg-white dark:bg-slate-950">
        <div className="flex gap-2">
          <Textarea
            placeholder="Écrire une réponse..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none focus-visible:ring-brand border-ls-border rounded-xl"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="icon"
            className="h-auto px-4 rounded-xl bg-brand hover:bg-brand/90 transition-all"
            disabled={!content.trim() || addMessageMutation.isPending}
            onClick={handleSend}
          >
            {addMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-ls-muted mt-2 text-center">
          Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne.
        </p>
      </div>
    </div>
  );
}
