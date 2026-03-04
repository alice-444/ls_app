"use client";

import { useState } from "react";
import { Search, X, MoreVertical, Ban, Flag, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PresenceIndicator } from "./PresenceIndicator";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";

interface SearchResult {
  messageId: string;
  content: string;
  senderName?: string;
  senderDisplayName?: string;
  createdAt: string;
}

interface ChatHeaderProps {
  readonly displayName: string;
  readonly otherUserId?: string;
  readonly searchQuery: string;
  readonly showSearch: boolean;
  readonly searchResults?: SearchResult[];
  readonly isSearching?: boolean;
  readonly onSearchQueryChange: (query: string) => void;
  readonly onToggleSearch: () => void;
  readonly onCloseSearch: () => void;
  readonly onShowBlockDialog: () => void;
  readonly onShowReportDialog: () => void;
}

export function ChatHeader({
  displayName,
  otherUserId,
  searchQuery,
  showSearch,
  searchResults,
  onSearchQueryChange,
  onToggleSearch,
  onCloseSearch,
  onShowBlockDialog,
  onShowReportDialog,
}: ChatHeaderProps) {
  const router = useRouter();
  const { data: presence } = trpc.messaging.getUserPresence.useQuery(
    { userId: otherUserId || "" },
    { enabled: !!otherUserId, refetchInterval: 30000 }
  );

  return (
    <div className="shrink-0 border-b border-[#d6dae4] dark:border-[#d6dae4] p-4 bg-white dark:bg-[#1a1720]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/inbox")}
            className="md:hidden h-8 w-8 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#26547c] dark:text-[#e6e6e6] truncate">
              {displayName}
            </h2>
            {presence && (
              <PresenceIndicator
                isOnline={presence.isOnline}
                lastSeen={presence.lastSeen}
                showText={true}
              />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSearch}
            className="hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <Search className="h-4 w-4 text-gray-600 dark:text-[#e6e6e6]" />
          </Button>
          {otherUserId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <MoreVertical className="h-4 w-4 text-gray-600 dark:text-[#e6e6e6]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white dark:bg-[#1a1720] border border-[#d6dae4]"
              >
                <DropdownMenuItem
                  onClick={onShowBlockDialog}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Bloquer l&apos;utilisateur
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#d6dae4]" />
                <DropdownMenuItem
                  onClick={onShowReportDialog}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Signaler l&apos;utilisateur
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {showSearch && (
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-[rgba(230,230,230,0.64)]" />
            <input
              type="text"
              placeholder="Rechercher dans la conversation..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-[#d6dae4] rounded-lg bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] placeholder:text-gray-500 dark:placeholder:text-[rgba(230,230,230,0.64)] focus:outline-none focus:ring-2 focus:ring-[#26547c] dark:focus:ring-[#e6e6e6]"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={onCloseSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          {searchQuery && searchResults && (
            <SearchResultsList
              results={searchResults}
              onResultClick={() => onCloseSearch()}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SearchResultsList({
  results,
  onResultClick,
}: {
  readonly results: SearchResult[];
  readonly onResultClick: () => void;
}) {
  if (results.length === 0) {
    return (
      <div className="mt-2 max-h-48 overflow-y-auto">
        <p className="text-sm text-gray-600 dark:text-[rgba(230,230,230,0.64)] p-2">
          Aucun résultat trouvé
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 max-h-48 overflow-y-auto">
      <div className="space-y-1">
        {results.map((result) => {
          const handleResultClick = () => {
            const element = document.querySelector(
              `[data-message-id="${result.messageId}"]`
            );
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
              element.classList.add("ring-2", "ring-primary");
              setTimeout(() => {
                element.classList.remove("ring-2", "ring-primary");
              }, 2000);
            }
            onResultClick();
          };

          return (
            <button
              key={result.messageId}
              type="button"
              className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded cursor-pointer text-sm text-[#26547c] dark:text-[#e6e6e6] transition-colors"
              onClick={handleResultClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleResultClick();
                }
              }}
            >
              <p className="font-medium">
                {result.senderDisplayName ||
                  result.senderName ||
                  "Utilisateur"}
              </p>
              <p className="text-muted-foreground truncate">
                {result.content.length > 100
                  ? result.content.substring(0, 100) + "..."
                  : result.content}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
