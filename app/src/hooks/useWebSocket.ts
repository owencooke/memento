/**
 * @description Hook for establishing WebSocket connection to server for receiving
 *    system recommended collections. When a recommendation received, a in-app notification
 *    is sent to the user, which when tapped, navigates them to the "Create Collection" screen
 *    with the recommended mementos from the algorithm (which they can accept or reject).
 * @requirements FR-39, FR-40
 */

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "../context/AuthContext";
import { getWsUrl } from "../api-client/config";
import { WebSocketMessage } from "../api-client/generated";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";

export const useWebSocket = () => {
  const { session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);

  // Connect a WebSocket to server and manage lifecycle callbacks
  const connect = useCallback(() => {
    const userId = String(session?.user.id);
    if (!userId || wsRef.current) return;

    const ws = new WebSocket(getWsUrl(userId));
    wsRef.current = ws;
    console.log("WS opened");

    ws.onmessage = (event) =>
      handleMessageType(JSON.parse(event.data) as WebSocketMessage);

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

    // Connect when app reopened
    const handleAppStateChange = (state: string) => {
      if (state === "active" && !wsRef.current) {
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

// Maps a generic message from server to a specific client action based on message type
const handleMessageType = (message: WebSocketMessage) => {
  if (message.type === "recommendation") {
    handleRecommendedCollection(message.body as number[]);
  } else {
    console.log("WS received undefined message type:", message);
  }
};

// Sends user an in-app notification with deep link to recommended collection/mementos
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
        url: `/(app)/(screens)/collection/create?ids=${mementoIds}&freshlySelected=true`,
      },
    },
    trigger: null,
  });
};
