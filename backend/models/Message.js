const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatRoomId: {
    type: String,
    required: true,
    index: true, // 加快特定對話室的訊息查詢
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  content: {
    type: String,
    required: [true, '訊息內容不能為空'],
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// 為時間排序建立索引以優化聊天歷史查詢效能
messageSchema.index({ chatRoomId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
