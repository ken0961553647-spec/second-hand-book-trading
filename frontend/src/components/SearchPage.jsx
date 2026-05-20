import React, { useState, useEffect } from 'react';

const SEARCH_CATEGORIES = ['全部', '教科書', '文學小說', '商業理財', '電腦資訊', '語言學習', '藝術設計', '考試用書', '其他'];
const BOOK_CONDITIONS = ['全新', '幾乎全新', '狀況良好', '有使用痕跡', '有泛黃摺痕', '有劃記塗改'];

// 當後端 API 未啟動時的模擬測試資料
const MOCK_BOOKS = [
  {
    _id: '1',
    title: '演算法圖鑑：用圖與動畫看懂程式設計核心概念',
    author: '石田保輝',
    price: 320,
    category: '電腦資訊',
    condition: '狀況良好',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=300&auto=format&fit=crop',
    description: '熱門經典電腦書籍，全彩圖解極適合初學者。有少量鉛筆劃記。',
    seller: { name: '陳同學' },
    createdAt: new Date('2026-05-18')
  },
  {
    _id: '2',
    title: '細說 Python 程式設計（第二版）',
    author: '蔡明志',
    price: 250,
    category: '電腦資訊',
    condition: '有使用痕跡',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=300&auto=format&fit=crop',
    description: '大學資工系大一教材。內頁微泛黃但無污漬。',
    seller: { name: '林同學' },
    createdAt: new Date('2026-05-19')
  },
  {
    _id: '3',
    title: '哈利波特：神秘的魔法石',
    author: 'J.K. 羅琳',
    price: 180,
    category: '文學小說',
    condition: '幾乎全新',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop',
    description: '買來僅閱讀過一次便收進書櫃，保存狀況非常良好。',
    seller: { name: '張同學' },
    createdAt: new Date('2026-05-20')
  },
  {
    _id: '4',
    title: '富爸爸，窮爸爸',
    author: '羅勃特‧T‧清崎',
    price: 200,
    category: '商業理財',
    condition: '全新',
    imageUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=300&auto=format&fit=crop',
    description: '全新未拆封，多買了一本故便宜售出。',
    seller: { name: '曾同學' },
    createdAt: new Date('2026-05-15')
  }
];

export default function SearchPage({ onContactSeller }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 搜尋與篩選狀態
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 觸發搜尋的 Effects
  useEffect(() => {
    fetchBooks();
  }, [selectedCategory, selectedConditions, sortBy, currentPage]);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const conditionParam = selectedConditions.length > 0 
        ? `&condition=${selectedConditions.join(',')}` 
        : '';
      const categoryParam = selectedCategory !== '全部' 
        ? `&category=${encodeURIComponent(selectedCategory)}` 
        : '';
      const minPriceParam = minPrice ? `&minPrice=${minPrice}` : '';
      const maxPriceParam = maxPrice ? `&maxPrice=${maxPrice}` : '';

      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(searchTerm)}&sort=${sortBy}&page=${currentPage}&limit=8${categoryParam}${conditionParam}${minPriceParam}${maxPriceParam}`
      );
      
      if (!response.ok) {
        throw new Error('無法連線到搜尋服務');
      }
      
      const result = await response.json();
      if (result.success) {
        setBooks(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (err) {
      console.warn('API 連線失敗，啟動離線模擬測試資料：', err.message);
      // Fallback 模擬本機過濾邏輯
      let filtered = [...MOCK_BOOKS];
      
      // 關鍵字
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        filtered = filtered.filter(b => 
          b.title.toLowerCase().includes(query) || 
          b.author.toLowerCase().includes(query) ||
          (b.description && b.description.toLowerCase().includes(query))
        );
      }
      // 分類
      if (selectedCategory !== '全部') {
        filtered = filtered.filter(b => b.category === selectedCategory);
      }
      // 書況
      if (selectedConditions.length > 0) {
        filtered = filtered.filter(b => selectedConditions.includes(b.condition));
      }
      // 價格
      if (minPrice) filtered = filtered.filter(b => b.price >= Number(minPrice));
      if (maxPrice) filtered = filtered.filter(b => b.price <= Number(maxPrice));
      
      // 排序
      if (sortBy === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else {
        filtered.sort((a, b) => b.createdAt - a.createdAt);
      }

      setBooks(filtered);
      setTotalPages(Math.ceil(filtered.length / 8) || 1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks();
  };

  const handleConditionChange = (cond) => {
    setSelectedConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('全部');
    setSelectedConditions([]);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="search-container">
      {/* 搜尋頂欄 */}
      <header className="search-header">
        <h1 className="logo-text">📚 二手書交易市場</h1>
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="搜尋書名、作者、關鍵字..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">搜尋</button>
        </form>
      </header>

      <div className="search-content">
        {/* 左側篩選面板 */}
        <aside className="filter-sidebar">
          <div className="filter-section-header">
            <h3>篩選條件</h3>
            <button onClick={resetFilters} className="reset-link">重設全部</button>
          </div>

          {/* 分類 */}
          <div className="filter-group">
            <h4>書籍分類</h4>
            <ul className="category-list">
              {SEARCH_CATEGORIES.map(cat => (
                <li key={cat}>
                  <button 
                    className={`category-item-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 價格區間 */}
          <div className="filter-group">
            <h4>價格區間</h4>
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="最低" 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)}
                className="price-input"
              />
              <span className="price-separator">至</span>
              <input 
                type="number" 
                placeholder="最高" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)}
                className="price-input"
              />
            </div>
            <button onClick={fetchBooks} className="price-apply-btn">套用價格</button>
          </div>

          {/* 書況 */}
          <div className="filter-group">
            <h4>書況篩選</h4>
            {BOOK_CONDITIONS.map(cond => (
              <label key={cond} className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={selectedConditions.includes(cond)}
                  onChange={() => handleConditionChange(cond)}
                />
                <span className="checkbox-custom"></span>
                {cond}
              </label>
            ))}
          </div>
        </aside>

        {/* 右側結果展示區 */}
        <main className="results-main">
          <div className="results-header">
            <p className="results-count">找到 {books.length} 本上架書籍</p>
            <div className="sort-wrapper">
              <label htmlFor="sort-select">排序：</label>
              <select 
                id="sort-select"
                value={sortBy} 
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="sort-select"
              >
                <option value="newest">最新上架</option>
                <option value="price-asc">價格：由低到高</option>
                <option value="price-desc">價格：由高到高</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
              <p>載入書籍列表中...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="empty-results">
              <span className="empty-icon">🔍</span>
              <p>找不到符合條件的書籍，請重新調整篩選條件。</p>
            </div>
          ) : (
            <div className="books-grid">
              {books.map(book => (
                <div key={book._id} className="book-card">
                  <div className="book-card-image-wrapper">
                    <img src={book.imageUrl} alt={book.title} className="book-card-image" />
                    <span className="book-card-category">{book.category}</span>
                  </div>
                  <div className="book-card-info">
                    <h3 className="book-card-title" title={book.title}>{book.title}</h3>
                    <p className="book-card-author">作者：{book.author}</p>
                    <div className="book-card-badge-row">
                      <span className="condition-badge">{book.condition}</span>
                      <span className="seller-badge">👤 {book.seller?.name || '二手賣家'}</span>
                    </div>
                    <p className="book-card-description">{book.description || '無書籍詳細說明。'}</p>
                    <div className="book-card-footer">
                      <span className="book-card-price">${book.price}</span>
                      <button 
                        onClick={() => onContactSeller(book)}
                        className="contact-seller-btn"
                      >
                        💬 私訊買書
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分頁器 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="page-nav-btn"
              >
                上一頁
              </button>
              <span className="page-indicator">第 {currentPage} 頁，共 {totalPages} 頁</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="page-nav-btn"
              >
                下一頁
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
