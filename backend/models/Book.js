const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '請輸入書籍名稱'],
    trim: true,
  },
  author: {
    type: String,
    required: [true, '請輸入作者名稱'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, '請輸入書籍價格'],
    min: [0, '價格不能小於 0'],
  },
  category: {
    type: String,
    required: [true, '請選擇書籍分類'],
    enum: ['教科書', '文學小說', '商業理財', '電腦資訊', '語言學習', '藝術設計', '考試用書', '其他'],
  },
  condition: {
    type: String,
    required: [true, '請選擇書況說明'],
    enum: ['全新', '幾乎全新', '狀況良好', '有使用痕跡', '有泛黃摺痕', '有劃記塗改'],
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop',
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// 建立全文檢索索引以支援模糊搜尋 (書名、作者、描述)
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);
