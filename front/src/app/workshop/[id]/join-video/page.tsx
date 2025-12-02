"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DailyIframe from "@daily-co/daily-js";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function JoinVideoPage() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.id as string;
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<any>(null);

  const {
    data: tokenData,
    isLoading,
    error,
  } = trpc.workshop.getDailyToken.useQuery(
    { workshopId },
    {
      enabled: !!workshopId,
      retry: false,
    }
  );

  useEffect(() => {
    if (!tokenData || isLoading || !videoContainerRef.current) return;

    const initializeCall = async () => {
      try {
        const callFrame = DailyIframe.createFrame(videoContainerRef.current!, {
          showLeaveButton: true,
          iframeStyle: {
            position: "relative",
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "8px",
          },
        });

        callFrameRef.current = callFrame;

        callFrame.on("left-meeting", () => {
          router.push(`/workshop/${workshopId}`);
        });

        callFrame.on("error", (error: any) => {
          console.error("Daily.co error:", error);
        });

        await callFrame.join({
          url: tokenData.roomUrl,
          token: tokenData.token,
          userName: "User",
        });
      } catch (err: any) {
        console.error("Error initializing Daily.co:", err);
      }
    };

    initializeCall();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy().catch(console.error);
      }
    };
  }, [tokenData, isLoading, router, workshopId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Connexion à la visioconférence...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive mb-4">
              {error.message || "Impossible de rejoindre la visioconférence"}
            </p>
            <button
              onClick={() => router.push(`/workshop/${workshopId}`)}
              className="text-sm text-primary hover:underline"
            >
              Retour à l'atelier
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div
        ref={videoContainerRef}
        className="w-full h-screen rounded-lg overflow-hidden"
      />
    </div>
  );
}
