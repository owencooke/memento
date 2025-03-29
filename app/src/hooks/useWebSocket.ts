import { useCallback, useEffect, useRef } from "react";
import { useSession } from "../context/AuthContext";
import { getWsUrl } from "../api-client/config";
import { WebSocketMessage } from "../api-client/generated";
import { AppState } from "react-native";

export const useWebSocket = () => {
  const { session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);

  const processMessage = (message: WebSocketMessage) => {
    if (message.type === "recommendation") {
      // TODO: add recommendatione event handler
      console.log("Received recommendation:", message.body);
    } else {
      console.log("WS received undefined message type:", message);
    }
  };

  const connect = useCallback(() => {
    const userId = String(session?.user.id);
    if (!userId || wsRef.current) return;

    const ws = new WebSocket(getWsUrl(userId));
    wsRef.current = ws;
    console.log("WS opened");

    ws.onmessage = (event) =>
      processMessage(JSON.parse(event.data) as WebSocketMessage);

    ws.onclose = () => {
      console.log("WS closed");
      wsRef.current = null;
      // Reconnect if server reloaded
      if (AppState.currentState === "active") {
        console.log("Attempting reconnection in 3s...");
        setTimeout(connect, 3000);
      }
    };

    ws.onerror = (error) => console.error("WS error:", error);
  }, [session?.user.id]);

  useEffect(() => {
    // Connect on mount
    connect();

    const handleAppStateChange = (state: string) => {
      if (state === "active" && !wsRef.current) {
        // Connect when app reopened
        connect();
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      sub.remove();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);
};
