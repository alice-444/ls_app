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
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002";

    socketInstance = io(serverUrl, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      setSocket(socketInstance);
    });

    socketInstance.on("disconnect", () => {
      setSocket(null);
    });

    socketInstance.on("error", () => {
      // Error handling without logging
    });

    setSocket(socketInstance);

    return () => {
      // Don't disconnect on unmount, keep connection alive
      // socketInstance?.disconnect();
    };
  }, [session]);

  return socket;
}
