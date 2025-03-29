import { useEffect } from "react";
import { useSession } from "../context/AuthContext";
import { getWsUrl } from "../api-client/config";
import { WebSocketMessage } from "../api-client/generated";

export const useWebSocket = () => {
  const { session } = useSession();

  useEffect(() => {
    const userId = String(session?.user.id);
    if (userId) {
      const ws = new WebSocket(getWsUrl(userId));

      ws.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        if (message.type === "recommendation") {
          console.log("recommendation received");
        } else {
          console.log("WS received undefined message type:", message);
        }
      };

      ws.onerror = (error) => console.error("WebSocket error:", error);
      ws.onclose = () => console.log("WebSocket closed");
      return () => ws.close();
    }
  }, [session?.user.id]);
};
