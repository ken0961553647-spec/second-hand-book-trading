const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const booksRouter = require('./routes/books');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

// API 路由註冊
app.use('/api/books', booksRouter);

// 基本的首頁健康檢查
app.get('/', (req, res) => {
  res.json({ message: '二手書交易平台 API 運作中' });
});

// 建立 HTTP 伺服器並整合 Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // 在正式環境請限縮為前端網域
    methods: ['GET', 'POST']
  }
});

// Socket.io 即時通訊邏輯
io.on('connection', (socket) => {
  console.log('新使用者已連線:', socket.id);

  // 1. 加入聊天對話房
  socket.on('join_room', ({ chatRoomId, userId }) => {
    socket.join(chatRoomId);
    console.log(`使用者 [${userId}] 加入房間: [${chatRoomId}]`);
  });

  // 2. 處理發送訊息
  socket.on('send_message', async (messageData) => {
    const { chatRoomId, sender, receiver, book, content } = messageData;
    
    try {
      // 將訊息寫入 MongoDB
      const newMessage = new Message({
        chatRoomId,
        sender,
        receiver,
        book,
        content,
        read: false
      });
      await newMessage.save();
      
      // 廣播給房間內的所有人 (包含發送者以進行確認)
      io.to(chatRoomId).emit('receive_message', newMessage);
      console.log(`房間 [${chatRoomId}] 收到新訊息:`, content);
    } catch (err) {
      console.error('儲存或傳送訊息時出錯:', err);
      socket.emit('error_message', { message: '訊息傳送失敗' });
    }
  });

  // 3. 處理「正在輸入中... (Typing)」狀態
  socket.on('typing', ({ chatRoomId, userId, isTyping }) => {
    socket.to(chatRoomId).emit('user_typing', { userId, isTyping });
  });

  // 4. 斷開連線
  socket.on('disconnect', () => {
    console.log('使用者已斷開連線:', socket.id);
  });
});

// 連線至 MongoDB 資料庫
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/used-books';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB 連線成功！');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`伺服器正運行於 Port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB 連線失敗:', err);
  });
