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
      process.env.NEXT_PUBLIC_SOCKET_URL || 
      process.env.NEXT_PUBLIC_SERVER_URL || 
      "http://localhost:5050";

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

    return () => {
      // Don't disconnect on unmount, keep connection alive
      // socketInstance?.disconnect();
    };
  }, [session]);

  return socket;
}
