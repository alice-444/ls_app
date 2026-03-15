"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { authClient } from "./auth-client";

let socketInstance: Socket | null = null;

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

    const serverUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_SERVER_URL || "https://api.learnsup.fr";

    console.log(`Connecting to WebSocket at: ${serverUrl}`);

    socketInstance = io(serverUrl, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"], // Tenter WebSocket d'abord pour éviter l'upgrade fragile
      forceNew: true, // Éviter de réutiliser une connexion mal fermée
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      closeOnBeforeunload: false, // Garder la connexion ouverte pendant le rechargement si possible
    });

    socketInstance.on("connect", () => {
      console.log("WebSocket connected successfully with transport:", socketInstance?.io.engine.transport.name);
      setSocket(socketInstance);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
      // Tenter le polling si websocket échoue
      if (socketInstance && socketInstance.io.opts.transports?.includes("websocket")) {
        console.log("Retrying with polling...");
      }
      setSocket(null);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      if (reason === "io server disconnect" || reason === "transport close") {
        console.warn("Possible proxy/timeout issue or session expired.");
      }
      setSocket(null);
    });

    setSocket(socketInstance);

    return () => {
      // Don't disconnect on unmount, keep connection alive
      // socketInstance?.disconnect();
    };
  }, [session]);

  return socket;
}
