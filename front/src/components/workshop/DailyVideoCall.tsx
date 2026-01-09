"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { DailyVideoCallProps, DailyCallFrame } from "@/types/workshop-components";

export function DailyVideoCall({ workshopId, onLeave }: DailyVideoCallProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const callFrameRef = useRef<DailyCallFrame | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const { data: tokenData, isLoading: isLoadingToken } =
    trpc.workshop.getDailyToken.useQuery(
      { workshopId },
      {
        enabled: !!workshopId,
        retry: false,
      }
    );

  useEffect(() => {
    if (!tokenData || isLoadingToken) return;

    const initializeCall = async () => {
      try {
        if (!videoContainerRef.current) return;

        const callFrame = DailyIframe.createFrame(videoContainerRef.current, {
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

        callFrame.on("joined-meeting", () => {
          setIsJoined(true);
          setIsLoading(false);
        });

        callFrame.on("left-meeting", () => {
          setIsJoined(false);
          if (onLeave) {
            onLeave();
          }
        });

        callFrame.on("error", (error: { errorMsg?: string }) => {
          console.error("Daily.co error:", error);
          setError(error?.errorMsg || "Une erreur est survenue");
          setIsLoading(false);
        });

        await callFrame.join({
          url: tokenData.roomUrl,
          token: tokenData.token,
          userName: "User",
        });
      } catch (err: unknown) {
        console.error("Error initializing Daily.co:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de rejoindre la visioconférence"
        );
        setIsLoading(false);
      }
    };

    initializeCall();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy().catch(console.error);
      }
    };
  }, [tokenData, isLoadingToken, onLeave]);

  const toggleVideo = async () => {
    if (!callFrameRef.current) return;
    try {
      if (isVideoOn) {
        await callFrameRef.current.setLocalVideo(false);
      } else {
        await callFrameRef.current.setLocalVideo(true);
      }
      setIsVideoOn(!isVideoOn);
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const toggleAudio = async () => {
    if (!callFrameRef.current) return;
    try {
      if (isAudioOn) {
        await callFrameRef.current.setLocalAudio(false);
      } else {
        await callFrameRef.current.setLocalAudio(true);
      }
      setIsAudioOn(!isAudioOn);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const leaveCall = async () => {
    if (callFrameRef.current) {
      try {
        await callFrameRef.current.leave();
      } catch (error) {
        console.error("Error leaving call:", error);
      }
    }
    if (onLeave) {
      onLeave();
    }
  };

  if (isLoadingToken || isLoading) {
    return (
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
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur de connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visioconférence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={videoContainerRef}
          className="w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden"
        />

        {isJoined && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={isVideoOn ? "default" : "secondary"}
              size="icon"
              onClick={toggleVideo}
            >
              {isVideoOn ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={isAudioOn ? "default" : "secondary"}
              size="icon"
              onClick={toggleAudio}
            >
              {isAudioOn ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>
            <Button variant="destructive" size="icon" onClick={leaveCall}>
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
