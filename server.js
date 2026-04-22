const http = require("http");
const fs = require("fs");
const path = require("path");

const { Server } = require("socket.io");


const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const rooms = new Map();

function findRoomBySocketId(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.x === socketId || room.o === socketId) {
      return roomId;
    }
  }

  return null;
}

function removeSocketFromRoom(socket, roomId) {
  const room = rooms.get(roomId);
  if (!room) {
    return;
  }

  socket.leave(roomId);

  let otherSocketId = null;
  if (room.x === socket.id) {
    room.x = null;
    otherSocketId = room.o;
  } else if (room.o === socket.id) {
    room.o = null;
    otherSocketId = room.x;
  }

  if (otherSocketId) {
    io.to(otherSocketId).emit("opponentLeft");
  }

  if (!room.x && !room.o) {
    rooms.delete(roomId);
  }
}

function createRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function contentType(filePath) {
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  return "text/html; charset=utf-8";
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname;

  if (pathname === "/socket.io" || pathname.startsWith("/socket.io/")) {
    return;
  }

  const filePath =
    pathname === "/"
      ? path.join(PUBLIC_DIR, "index.html")
      : path.join(PUBLIC_DIR, pathname);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Không tìm thấy tệp");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType(filePath) });
    res.end(data);
  });
});

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Một người dùng đã kết nối", socket.id);

  socket.on("createRoom", () => {
    const roomId = createRoomId();
    rooms.set(roomId, { x: socket.id, o: null });
    socket.join(roomId);
    socket.emit("setup", { roomId, player: "X" });
    console.log(`Đã tạo phòng: ${roomId} bởi ${socket.id}`);
  });

  socket.on("joinRoom", (roomId) => {
    const normalizedRoomId = String(roomId || "").toUpperCase();
    const room = rooms.get(normalizedRoomId);

    if (!room) {
      socket.emit("roomError", "Phòng không tồn tại");
      return;
    }

    if (room.x && room.o) {
      socket.emit("roomError", "Phòng đã đủ 2 người");
      return;
    }

    const player = !room.x ? "X" : "O";
    room[player.toLowerCase()] = socket.id;
    socket.join(normalizedRoomId);
    socket.emit("setup", { roomId: normalizedRoomId, player });

    if (room.x && room.o) {
      io.to(normalizedRoomId).emit("roomReady", { roomId: normalizedRoomId });
    }

    console.log(`Người dùng ${socket.id} đã vào phòng ${normalizedRoomId} với vai trò ${player}`);
  });

  socket.on("makeMove", (data) => {
    const { roomId, row, col, player, currentPlayer } = data;
    console.log(`Người dùng ${socket.id} đã đánh tại phòng ${roomId}: (${row}, ${col}) bởi người chơi ${player}`);
    socket.to(roomId).emit("moveMade", { row, col, player, currentPlayer });
  });

  socket.on("gameOver", (data) => {
    const { roomId, winner } = data;
    socket.to(roomId).emit("gameOver", { winner });
  });

  socket.on("restartGame", (data) => {
    const { roomId } = data || {};

    if (!roomId || !rooms.has(roomId)) {
      socket.emit("roomError", "Không thể làm mới: phòng không hợp lệ");
      return;
    }

    console.log(`Ván đấu đã được làm mới trong phòng ${roomId} bởi ${socket.id}`);
    socket.to(roomId).emit("gameRestarted");
  });

  socket.on("leaveRoom", (data) => {
    const { roomId } = data || {};

    if (!roomId || !rooms.has(roomId)) {
      return;
    }

    console.log(`Người dùng ${socket.id} đã rời phòng ${roomId}`);
    removeSocketFromRoom(socket, roomId);
  });


  socket.on("disconnect", () => {
    const roomId = findRoomBySocketId(socket.id);
    if (roomId) {
      removeSocketFromRoom(socket, roomId);
    }
    console.log("Một người dùng đã ngắt kết nối", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
