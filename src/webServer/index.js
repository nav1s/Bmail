const expressApp = require("./app");
const mongoose = require("mongoose");
const config = require("./utils/config");
const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer(expressApp);

const io = socketIo(server);

expressApp.set("io", io);

io.on('connection', (socket) => {
  console.log('Connection established:', socket.id);

  socket.on('register', (userId) => {
    // Join a room named after their ID
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

(async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("[db] Mongo connected");

    const port = config.PORT;
    server.listen(port, () =>
      console.log(`Server running on port ${port}`),
    );

  } catch (err) {
    console.error("[db] connection error:", err);
    process.exit(1);
  }
})();
