const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// @route   GET /api/books/search
// @desc    搜尋二手書 (支援關鍵字、價格區間、書況、分類篩選、排序與分頁)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, minPrice, maxPrice, category, condition, sort, page = 1, limit = 12 } = req.query;
    
    // 建立動態查詢條件
    let query = { status: 'available' }; // 預設只顯示還在架上的書

    // 1. 關鍵字模糊搜尋 (書名、作者、描述)
    if (q) {
      // 優先使用 MongoDB 全文檢索，若失敗或想支援中文字元片段模糊，使用 Regex 做為 Fallback
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // 2. 價格篩選
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 3. 分類篩選
    if (category) {
      query.category = category;
    }

    // 4. 書況篩選 (多選時可以傳入陣列或以逗號分隔的字串)
    if (condition) {
      const conditionList = condition.split(',');
      query.condition = { $in: conditionList };
    }

    // 5. 排序條件設定
    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortOptions.price = 1;
          break;
        case 'price-desc':
          sortOptions.price = -1;
          break;
        case 'newest':
        default:
          sortOptions.createdAt = -1;
          break;
      }
    } else {
      sortOptions.createdAt = -1; // 預設最新上架優先
    }

    // 6. 分頁計算
    const skip = (Number(page) - 1) * Number(limit);

    // 執行資料庫查詢
    const books = await Book.find(query)
      .populate('seller', 'name email avatarUrl') // 載入賣家簡要資訊
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // 取得符合條件的總筆數 (用於前端計算總頁數)
    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      data: books,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('搜尋書籍時出錯:', error);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤，無法完成搜尋',
      error: error.message
    });
  }
});

module.exports = router;
