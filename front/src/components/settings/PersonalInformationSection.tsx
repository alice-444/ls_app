"use client";

import { useState, useEffect } from "react";
import { UserCircle, Save } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProfilePhotoUpload } from "@/components/profil/ProfilePhotoUpload";

export function PersonalInformationSection() {
  const { data: profileData, refetch: refetchProfile } =
    trpc.user.getProfile.useQuery();
  const { data: session } = authClient.useSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateProfileMutation = trpc.accountSettings.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Informations personnelles mises à jour avec succès");
      setIsSaving(false);
      refetchProfile();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
      setIsSaving(false);
    },
  });

  useEffect(() => {
    if (profileData) {
      const fullName = profileData.name || session?.user?.name || "";
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setPhotoUrl(profileData.photoUrl || null);
    }
  }, [profileData, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    updateProfileMutation.mutate({ 
      name: fullName || undefined,
      photoUrl: photoUrl || undefined
    });
  };

  const handlePhotoChange = (url: string | null) => {
    setPhotoUrl(url);
    // Auto-save photo change
    updateProfileMutation.mutate({ photoUrl: url });
  };

  return (
    <div className="flex flex-col gap-[37.5px] w-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <UserCircle className="h-8 w-8 text-ls-heading" />
          <h2 className="text-2xl font-semibold text-ls-heading">
            Informations personnelles
          </h2>
        </div>
        <p className="text-base text-ls-muted tracking-[-0.8px] max-w-[330px]">
          Mets à jour tes informations personnelles
        </p>
      </div>

      <div className="w-full max-w-md">
        <ProfilePhotoUpload
          previewPhoto={photoUrl}
          onPhotoChange={handlePhotoChange}
          blockCard="bg-card/95 rounded-2xl border border-border/50"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex gap-6">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs text-ls-muted">Prénom</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Andréa"
              className="h-10 px-6 py-1.5 border border-border rounded-full text-xs text-ls-heading tracking-[-0.6px]"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs text-ls-muted">Nom</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Begozi"
              className="h-10 px-6 py-1.5 border border-border rounded-full text-xs text-ls-heading tracking-[-0.6px]"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label className="text-xs text-ls-muted">Téléphone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 35 36 90 91"
              className="h-10 px-6 py-1.5 border border-border rounded-full text-xs text-ls-heading tracking-[-0.6px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-center w-full">
          <Button
            type="submit"
            disabled={isSaving}
            variant="cta" size="cta" className="gap-2"
          >
            <span className="text-xs font-semibold text-white tracking-[-0.6px]">
              Sauvegarder les modifications
            </span>
            <Save className="h-[18px] w-[18px] text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
}
