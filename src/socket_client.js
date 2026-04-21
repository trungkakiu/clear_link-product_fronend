// socket_client.js
class SocketClient {
  constructor() {
    this.socket = null;
    this.callbacks = {};
    this.reconnectTimer = null;
  }

  connect(userData) {
    const socketUrl = "wss://socket-noti.clearlink.io.vn";

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.socket = new WebSocket(socketUrl);

    this.socket.onopen = () => {
      console.log("[6099] Connected via Tunnel!");
      const authData = {
        type: "AUTH_CLIENT",
        isClient: true,
        company_id: userData.company_id || userData.id,
        user_id: userData.id,
        role: userData.role,
        level: userData.level || "level_1",
      };
      this.socket.send(JSON.stringify(authData));
    };

    this.socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.type === "NOTI" && this.callbacks["NOTI"]) {
          this.callbacks["NOTI"](response);
        }

        if (response.type === "AUTH_SUCCESS") {
          console.log("[6099] Auth Success!");
        }
      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    this.socket.onclose = () => {
      console.warn("[6099] Disconnected. Reconnecting in 5s...");
      this.reconnectTimer = setTimeout(() => this.connect(userData), 5000);
    };
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }
}

export default new SocketClient();
