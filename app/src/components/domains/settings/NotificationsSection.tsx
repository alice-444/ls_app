"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

export function NotificationsSection() {
  const { data: profile, isLoading, refetch } = trpc.user.getProfile.useQuery();

  const updateProfileMutation = trpc.accountSettings.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Préférences de notifications mises à jour");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  });

  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (profile) {
      setInAppNotifications(profile.inAppNotifications ?? true);
      setEmailNotifications(profile.emailNotifications ?? true);
    }
  }, [profile]);

  const handleInAppChange = (checked: boolean) => {
    setInAppNotifications(checked);
    updateProfileMutation.mutate({ inAppNotifications: checked });
  };

  const handleEmailChange = (checked: boolean) => {
    setEmailNotifications(checked);
    updateProfileMutation.mutate({ emailNotifications: checked });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-ls-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Bell className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">
          Notifications
        </h2>
      </div>
      <p className="text-base text-ls-muted">
        Gère tes préférences de notifications
      </p>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Notifications push
            </Label>
            <p className="text-sm text-ls-muted">
              Recevoir des notifications dans l&apos;application
            </p>
          </div>
          <Switch
            checked={inAppNotifications}
            onCheckedChange={handleInAppChange}
            disabled={updateProfileMutation.isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Notifications email
            </Label>
            <p className="text-sm text-ls-muted">
              Recevoir des notifications par email
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={handleEmailChange}
            disabled={updateProfileMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
