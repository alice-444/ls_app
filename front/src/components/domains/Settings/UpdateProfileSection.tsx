"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { User, Upload, X, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { PROFILE_VALIDATION } from "@ls-app/shared";

export function UpdateProfileSection() {
  const { data: titleData } = trpc.user.getTitle.useQuery();
  const { data: profileData, refetch: refetchProfile } =
    trpc.user.getProfile.useQuery();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    photoUrl,
    previewPhoto,
    isUploading,
    handlePhotoChange,
    removePhoto,
    setPhotoFromUrl,
  } = usePhotoUpload();

  const updateProfileMutation = trpc.accountSettings.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated.");
      setIsSaving(false);
      refetchProfile();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to update profile");
      setIsSaving(false);
    },
  });

  useEffect(() => {
    if (profileData) {
      setName(profileData.name || "");
      setBio(profileData.bio || "");
      setPhotoFromUrl(profileData.photoUrl);
    }
  }, [profileData, setPhotoFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    updateProfileMutation.mutate({
      name: name.trim() || undefined,
      bio: bio.trim() || null,
      photoUrl: photoUrl || null,
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-6 px-6 sm:px-8">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <User className="h-5 w-5" />
          Profil public
        </CardTitle>
        <CardDescription className="text-sm">
          Mettez à jour votre photo, nom et bio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="photo">Photo de profil</Label>
            <div className="flex items-center gap-4">
              <Input
                id="photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handlePhotoChange}
                disabled={isUploading}
                className="hidden"
              />
              <Label
                htmlFor="photo"
                className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Upload..." : "Choisir une photo"}
              </Label>
              {previewPhoto && (
                <div className="relative group">
                  <Image
                    src={previewPhoto}
                    alt="Preview"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border-2"
                    unoptimized={previewPhoto.startsWith("data:")}
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Supprimer la photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Formats acceptés : JPG, PNG. Taille max :{" "}
              {PROFILE_VALIDATION.photo.maxSizeMB} Mo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton nom"
              maxLength={120}
              className="w-full h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Décrivez-toi en quelques mots..."
              maxLength={PROFILE_VALIDATION.bio.max}
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              {bio.length}/{PROFILE_VALIDATION.bio.max} caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              Titre
              <Lock className="h-4 w-4 text-gray-400" />
            </Label>
            <div className="relative">
              <Input
                id="title"
                value={titleData?.title || "Explorer"}
                disabled
                className="w-full h-10 bg-gray-100 cursor-not-allowed"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">
              Le titre est géré automatiquement par le système
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full sm:w-auto h-10 px-8"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder le profil"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
