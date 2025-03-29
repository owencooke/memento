import { useCallback, useEffect, useRef } from "react";
import { useSession } from "../context/AuthContext";
import { getWsUrl } from "../api-client/config";
import { WebSocketMessage } from "../api-client/generated";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";

export const useWebSocket = () => {
  const { session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);

  const processMessage = (message: WebSocketMessage) => {
    if (message.type === "recommendation") {
      handleRecommendedCollection(message.body as number[]);
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

const handleRecommendedCollection = (mementoIds: number[]) => {
  console.log(
    "Sending in-app notification for recommended collection:",
    mementoIds,
  );
  Notifications.scheduleNotificationAsync({
    content: {
      title: "A new collection, just for you! 🗂️",
      body: "We've curated a special set of memories. Tap to check them out!",
      data: {
        url: `/(app)/(screens)/collection/create?ids=${mementoIds}`,
      },
    },
    trigger: null,
  });
};
