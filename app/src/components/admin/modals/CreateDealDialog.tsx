"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

interface CreateDealDialogProps {
  onCreated: () => void;
  createDealMutation: any; // Using simplified type for brevity, but should be a tRPC mutation
  categories: string[];
}

export function CreateDealDialog({
  onCreated,
  createDealMutation,
  categories
}: Readonly<CreateDealDialogProps>) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "FOOD",
    link: "",
    promoCode: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDealMutation.mutate(form, {
      onSuccess: () => {
        onCreated();
        setOpen(false);
        setForm({ title: "", description: "", category: "FOOD", link: "", promoCode: "" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-brand hover:bg-brand/90 text-white rounded-full">
          <Plus className="w-4 h-4 mr-1" /> Ajouter un Bon Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouveau Bon Plan</DialogTitle>
          <DialogDescription>Créez un bon plan directement. Il sera automatiquement approuvé.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="deal-title">Titre</Label>
            <Input
              id="deal-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: -20% sur les outils dev"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deal-desc">Description</Label>
            <Textarea
              id="deal-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Détails de l'offre..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-code">Code Promo</Label>
              <Input
                id="deal-code"
                value={form.promoCode}
                onChange={(e) => setForm({ ...form, promoCode: e.target.value })}
                placeholder="CODE20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deal-link">Lien de l'offre</Label>
            <Input
              id="deal-link"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
              type="url"
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" className="bg-brand text-white" disabled={createDealMutation.isPending}>
              {createDealMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer le Bon Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
