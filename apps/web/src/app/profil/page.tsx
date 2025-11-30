"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  Save,
  Eye,
  User,
  GraduationCap,
  Tag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { customAuthClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

export default function ProfilPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [localTags, setLocalTags] = useState<string[]>([]);

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const {
    data: identityCard,
    refetch,
    isLoading,
  } = trpc.apprentice.getIdentityCard.useQuery(undefined, {
    enabled: !!session && userRole === "APPRENANT",
  });

  const saveMutation = trpc.apprentice.saveIdentityCard.useMutation({
    onSuccess: () => {
      toast.success("Profil sauvegardé avec succès !");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    },
  });

  const handleBecomeMentor = () => {
    router.push("/onboarding?role=MENTOR&step=confirm-features");
  };

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  useEffect(() => {
    if (userRole && userRole !== "APPRENANT") {
      router.push("/dashboard");
    }
  }, [userRole, router]);

  useEffect(() => {
    if (identityCard?.photoUrl) {
      setPreviewPhoto(identityCard.photoUrl);
    }
    if (identityCard?.iceBreakerTags) {
      setLocalTags(identityCard.iceBreakerTags);
    }
  }, [identityCard]);

  if (isSessionPending || isLoading) {
    return <Loader />;
  }

  if (!session || userRole !== "APPRENANT") {
    return null;
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("Le fichier doit être au format JPG ou PNG");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo ne doit pas dépasser 5 Mo");
        return;
      }

      setIsUploading(true);
      try {
        const uploadResult = await customAuthClient.uploadPhoto(file);
        setPreviewPhoto(uploadResult.photoUrl);
        toast.success("Photo uploadée avec succès");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de l'upload de la photo"
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const displayName = formData.get("displayName") as string;
    const studyDomain = formData.get("studyDomain") as string;
    const studyProgram = formData.get("studyProgram") as string;

    if (!displayName || !studyDomain || !studyProgram) {
      toast.error("Le prénom, le domaine d'étude et le cursus sont requis");
      return;
    }

    await saveMutation.mutateAsync({
      displayName,
      studyDomain,
      studyProgram,
      photoUrl: previewPhoto || null,
      iceBreakerTags: localTags,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && localTags.length < 5) {
      const newTag = tagInput.trim();
      if (!localTags.includes(newTag)) {
        setLocalTags([...localTags, newTag]);
        setTagInput("");
      } else {
        toast.error("Ce tag existe déjà");
      }
    }
  };

  const removeTag = (index: number) => {
    setLocalTags(localTags.filter((_, i) => i !== index));
  };

  const displayName = identityCard?.displayName || identityCard?.userName || "";
  const studyDomain = identityCard?.studyDomain || "";
  const studyProgram = identityCard?.studyProgram || "";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Aperçu
            </CardTitle>
            <CardDescription>
              Voici comment ton profil apparaîtra aux autres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    {displayName || identityCard?.userName || "Ton prénom"}
                  </h3>
                  {(() => {
                    const { data: titleData } = trpc.user.getTitle.useQuery();
                    return titleData?.title ? (
                      <Badge variant="secondary" className="text-xs">
                        {titleData.title}
                      </Badge>
                    ) : null;
                  })()}
                </div>
                {(studyDomain || studyProgram) && (
                  <div className="flex flex-col gap-1 mt-1 text-sm text-gray-600">
                    {studyDomain && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>{studyDomain}</span>
                      </div>
                    )}
                    {studyProgram && (
                      <div className="flex items-center gap-2 ml-6">
                        <span>{studyProgram}</span>
                      </div>
                    )}
                  </div>
                )}
                {localTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {localTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mon Profil</CardTitle>
            <CardDescription>
              Personnalisez votre mini-profil avec vos informations de base et
              vos tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="photo">Photo/Avatar</Label>
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
                      <img
                        src={previewPhoto}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewPhoto(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Supprimer la photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Formats acceptés : JPG, PNG. Taille max : 5 Mo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Prénom *</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={displayName}
                  placeholder="Ton prénom"
                  required
                  minLength={1}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyDomain">Domaine d'étude *</Label>
                <Input
                  id="studyDomain"
                  name="studyDomain"
                  defaultValue={identityCard?.studyDomain || ""}
                  placeholder="Ex: Web Development, Data Science, Design..."
                  required
                  minLength={1}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyProgram">Cursus *</Label>
                <Input
                  id="studyProgram"
                  name="studyProgram"
                  defaultValue={identityCard?.studyProgram || ""}
                  placeholder="Ex: Bachelor - 1ère année, BTS - 2ème année..."
                  required
                  minLength={1}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags Ice Breaker (max 5)</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Ex: Gamer, Night Owl, Football"
                    maxLength={30}
                    disabled={localTags.length >= 5}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={localTags.length >= 5 || !tagInput.trim()}
                    variant="outline"
                  >
                    Ajouter
                  </Button>
                </div>
                {localTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {localTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {localTags.length}/5 tags. Exemples : Gamer, Night Owl,
                  Football, Music Lover...
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saveMutation.isPending || isUploading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {userRole === "APPRENANT" && (
          <Card className="border-indigo-200 bg-linear-to-r from-indigo-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      Envie de partager vos compétences ?
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Devenez mentor et créez votre premier atelier pour aider
                      d'autres apprenants comme toi !
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleBecomeMentor}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Devenir Mentor
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
