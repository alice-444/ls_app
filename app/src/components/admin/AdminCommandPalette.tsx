"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Users, BookOpen, LifeBuoy, X } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Fetch results only when query is long enough
  const { data: results, isLoading } = trpc.admin.searchGlobal.useQuery(
    { query },
    { enabled: query.length >= 2, staleTime: 1000 }
  );

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-[640px] overflow-hidden rounded-2xl border border-white/20 bg-ls-surface/90 shadow-2xl backdrop-blur-md"
          >
            <Command label="Global Search" className="flex flex-col">
              <div className="flex items-center border-b border-border/50 px-4">
                <Search className="h-5 w-5 text-ls-muted" />
                <Command.Input
                  autoFocus
                  placeholder="Chercher un utilisateur, un atelier, un ticket..."
                  className="h-14 w-full bg-transparent px-4 text-sm outline-none placeholder:text-ls-muted"
                  onValueChange={setQuery}
                />
                <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-border bg-ls-surface-elevated px-1.5 font-mono text-[10px] font-medium text-ls-muted opacity-100">
                  ESC
                </kbd>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-4 rounded-full p-1 text-ls-muted hover:bg-red-500/20 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <Command.List className="max-h-[450px] overflow-y-auto p-4 custom-scrollbar">
                {isLoading && (
                  <div className="flex items-center justify-center p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  </div>
                )}

                <Command.Empty className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-ls-muted">Aucun résultat trouvé.</p>
                </Command.Empty>

                {results?.users && results.users.length > 0 && (
                  <Command.Group heading="Utilisateurs" className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-ls-muted">
                    {results.users.map((user: { id: string; name: string | null; email: string; role: string | null }) => (
                      <Command.Item
                        key={user.id}
                        onSelect={() => runCommand(() => router.push(`/admin/users/${user.id}`))}
                        className="flex items-center gap-3 rounded-xl p-3 text-sm text-ls-heading hover:bg-brand/10 hover:text-brand cursor-pointer transition-all duration-200"
                      >
                        <Users size={18} />
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-[10px] text-ls-muted">{user.email}</span>
                        </div>
                        <span className="ml-auto text-[10px] bg-ls-surface-elevated px-2 py-0.5 rounded-full border border-border">
                          {user.role}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {results?.workshops && results.workshops.length > 0 && (
                  <Command.Group heading="Ateliers" className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-ls-muted">
                    {results.workshops.map((workshop: { id: string; title: string; status: string }) => (
                      <Command.Item
                        key={workshop.id}
                        onSelect={() => runCommand(() => router.push(`/admin/workshop/${workshop.id}`))}
                        className="flex items-center gap-3 rounded-xl p-3 text-sm text-ls-heading hover:bg-indigo-500/10 hover:text-indigo-500 cursor-pointer transition-all duration-200"
                      >
                        <BookOpen size={18} />
                        <span>{workshop.title}</span>
                        <span className="ml-auto text-[10px] bg-indigo-500/20 text-indigo-500 px-2 py-0.5 rounded-full">
                          {workshop.status}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {results?.support && results.support.length > 0 && (
                  <Command.Group heading="Support" className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-ls-muted">
                    {results.support.map((req: { id: string; subject: string; status: string }) => (
                      <Command.Item
                        key={req.id}
                        onSelect={() => runCommand(() => router.push(`/admin/support/${req.id}`))}
                        className="flex items-center gap-3 rounded-xl p-3 text-sm text-ls-heading hover:bg-blue-500/10 hover:text-blue-500 cursor-pointer transition-all duration-200"
                      >
                        <LifeBuoy size={18} />
                        <span>{req.subject}</span>
                        <span className="ml-auto text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full">
                          {req.status}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading="Navigation Rapide" className="text-xs font-black uppercase tracking-[0.2em] text-ls-muted">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/admin/analytics"))}
                    className="flex items-center gap-3 rounded-xl p-3 text-sm text-ls-heading hover:bg-brand/10 hover:text-brand cursor-pointer"
                  >
                    <Search size={18} />
                    <span>Aller aux Statistiques</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="flex items-center gap-4 border-t border-border/50 p-4 text-[10px] text-ls-muted">
                <div className="flex items-center gap-1">
                  <kbd className="rounded bg-ls-surface-elevated px-1.5 py-0.5 border border-border">↑↓</kbd>
                  <span>Naviguer</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded bg-ls-surface-elevated px-1.5 py-0.5 border border-border">Enter</kbd>
                  <span>Sélectionner</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
