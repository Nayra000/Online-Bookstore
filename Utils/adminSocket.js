const { io } = require("socket.io-client");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
// Replace with your actual server URL
const SOCKET_SERVER_URL = `${process.env.BASH_HOSTNAME}:${process.env.PORT}`;

console.log(`🌍 Connecting to Socket Server at: ${SOCKET_SERVER_URL}`);

// Connect to the socket server
const socket = io(SOCKET_SERVER_URL, {
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

// Emit on successful connection
socket.on("connect", () => {
  console.log(`✅ Connected as Admin - Socket ID: ${socket.id}`);
});

// Handle disconnection
socket.on("disconnect", (reason) => {
  console.warn(`❌ Disconnected from server: ${reason}`);
});

// Handle reconnection attempts
socket.on("reconnect_attempt", (attempt) => {
  console.log(`♻️ Reconnecting... Attempt ${attempt}`);
});

// Handle reconnection success
socket.on("reconnect", (attemptNumber) => {
  console.log(`✅ Successfully reconnected after ${attemptNumber} attempts`);
});

// Handle reconnection failure
socket.on("reconnect_failed", () => {
  console.error("🚨 Reconnection failed. Please check your network.");
});

socket.on("order_created", (data) => {
  console.log("📢 New Order Received:", data);
});
module.exports = socket;
