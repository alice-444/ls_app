"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { authClient } from "./auth-client";

let socketInstance: Socket | null = null;
let runtimeSocketUrlPromise: Promise<string | null> | null = null;

const getRuntimeSocketUrl = async (): Promise<string | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!runtimeSocketUrlPromise) {
    runtimeSocketUrlPromise = fetch("/api/runtime-config", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as { socketUrl?: string | null };
        return data.socketUrl?.trim() || null;
      })
      .catch(() => null);
  }

  return runtimeSocketUrlPromise;
};

export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      setSocket(null);
      return;
    }

    if (socketInstance?.connected) {
      setSocket(socketInstance);
      return;
    }

    let isCancelled = false;

    const setupSocket = async () => {
      const runtimeSocketUrl = await getRuntimeSocketUrl();
      if (isCancelled) return;

      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

      const serverUrl =
        runtimeSocketUrl ||
        (isLocalhost
          ? "http://localhost:4500"
          : typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:4500");

      console.log(`Connecting to WebSocket at: ${serverUrl}`);

      socketInstance = io(serverUrl, {
        path: "/socket.io",
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on("connect", () => {
        console.log("WebSocket connected successfully");
        setSocket(socketInstance);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error.message);
        setSocket(null);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("WebSocket disconnected:", reason);
        setSocket(null);
      });

      setSocket(socketInstance);
    };

    void setupSocket();

    return () => {
      isCancelled = true;
      // Don't disconnect on unmount, keep connection alive
      // socketInstance?.disconnect();
    };
  }, [session]);

  return socket;
}
