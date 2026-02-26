"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function NotificationsSection() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Bell className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">
          Notifications
        </h2>
      </div>
      <p className="text-base text-ls-heading">
        Gère tes préférences de notifications
      </p>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Notifications push
            </Label>
            <p className="text-sm text-muted-foreground">
              Recevoir des notifications dans l&apos;application
            </p>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Notifications email
            </Label>
            <p className="text-sm text-muted-foreground">
              Recevoir des notifications par email
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
      </div>
    </div>
  );
}
