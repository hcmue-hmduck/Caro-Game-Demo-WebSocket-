<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=42&pause=1000&color=00B894&center=true&vCenter=true&width=600&lines=C%E1%BB%9C+CARO+ONLINE;NODE.JS+%2B+SOCKET.IO;REALTIME+2+NG%C6%AF%E1%BB%9CI+CH%C6%A0I)](https://git.io/typing-svg)

<img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version" />
<img src="https://img.shields.io/badge/license-ISC-green?style=for-the-badge" alt="License" />
<img src="https://img.shields.io/badge/status-Active-success?style=for-the-badge" alt="Status" />

<br/>

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Game Cờ Caro realtime 2 người chơi, tạo/tham gia phòng nhanh, không cần database.**

</div>

## Deploy (Render)

https://caro-game-demo-websocket.onrender.com/

## Giới thiệu

Đây là dự án Cờ Caro (Gomoku) chạy trên Node.js, giao diện thuần HTML/CSS/JS và đồng bộ trạng thái bằng Socket.IO.

Mục tiêu của dự án:
- Dễ chạy, dễ học, không phụ thuộc framework nặng.
- Realtime mượt giữa 2 client.
- Quản lý phòng đơn giản bằng bộ nhớ RAM trên server.

## Tính năng chính

- **Tạo phòng / tham gia phòng** bằng mã phòng.
- **Rời phòng** linh hoạt, giữ phòng để người mới có thể vào lại.
- **Đồng bộ realtime** nước đi giữa 2 người chơi qua Socket.IO.
- **Kiểm soát lượt chơi**: chưa tới lượt sẽ không được đánh.
- **Check win 5 quân liên tiếp** theo 4 trục (ngang, dọc, 2 đường chéo).
- **Highlight ô thắng** để nhấn mạnh đường chiến thắng.
- **Làm mới ván đấu** nhanh trong phòng.
- **Thông báo đẹp bằng SweetAlert2**.

## Kiến trúc tổng quan

- **Server**: Node.js HTTP server + Socket.IO
- **Client**: HTML + CSS + JavaScript thuần
- **Lưu trạng thái phòng**: In-memory (`Map`) trên server

Lưu ý: vì dùng RAM nên khi restart server, dữ liệu phòng sẽ mất.

## Cấu trúc dự án

```bash
Tic-tac-toe/
├── public/
│   ├── index.html        # Giao diện game
│   ├── style.css         # CSS giao diện
│   └── app.js            # Logic game + Socket client
├── server.js             # HTTP server + Socket.IO server
├── package.json
├── package-lock.json
└── README.md
```

## Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js 18+ (khuyến nghị Node.js 20+)
- npm

### 1. Cài dependencies

```bash
npm install
```

### 2. Chạy server

```bash
npm start
```

Hoặc chạy chế độ dev (auto reload):

```bash
npm run dev
```

### 3. Mở ứng dụng

- URL mặc định: `http://localhost:3000`

Nếu cổng 3000 đang bận:

```bash
PORT=3001 npm start
```

## Cách chơi nhanh

1. Người chơi A bấm **TẠO PHÒNG**.
2. Gửi mã phòng cho người chơi B.
3. Người chơi B bấm **THAM GIA PHÒNG** và nhập mã.
4. Hai bên đánh theo lượt X/O.
5. Đủ 5 quân liên tiếp sẽ thắng.

## Sự kiện Socket.IO đang dùng

- `createRoom`
- `joinRoom`
- `setup`
- `roomReady`
- `makeMove`
- `moveMade`
- `gameOver`
- `restartGame`
- `gameRestarted`
- `leaveRoom`
- `opponentLeft`
- `roomError`

## Hạn chế hiện tại

- Chưa có cơ chế lưu lịch sử trận đấu.
- Chưa có xác thực người dùng.
- Chưa scale nhiều server instance (vì đang dùng RAM local).

## Hướng phát triển

- Thêm bảng điểm và lịch sử trận.
- Thêm bot AI chơi đơn.
- Thêm xác nhận khi reset/rời phòng.
- Dùng Redis Adapter cho Socket.IO khi scale nhiều server.

---

<div align="center">

Xây dựng để học realtime và game logic theo cách đơn giản, rõ ràng, dễ mở rộng.

</div>
