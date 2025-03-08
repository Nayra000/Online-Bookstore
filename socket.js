const { Server } = require("socket.io");
const logger = require("./logger"); // Import the logger

let io; // Declare `io` globally but do not initialize it yet

const initSocket = (server) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      logger("socket").info(`⚡ Admin connected: ${socket.id}`);

      socket.on("disconnect", () => {
        logger("socket").info(`❌ Admin disconnected: ${socket.id}`);
      });
    });

    logger("socket").info("🚀 Socket.IO initialized");
  }
  return io;
};

// Function to get the initialized io instance
const getSocket = () => {
  if (!io) {
    logger("socket").warn("⚠️ Socket.io is not initialized! Returning null.");
    return null; 
  }
  return io;
};
module.exports = { initSocket, getSocket };
