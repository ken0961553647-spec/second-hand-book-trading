// Mock database initial values
const DEFAULT_BOOKS = [
  {
    id: "book-1",
    title: "設計模式：可復用物件導向軟體的基礎",
    author: "Erich Gamma, Richard Helm",
    price: 450,
    condition: "new-like", // 幾近全新
    category: "technology",
    sellerName: "陳小明",
    dateListed: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    isSold: false
  },
  {
    id: "book-2",
    title: "Clean Code 程式整潔之道",
    author: "Robert C. Martin",
    price: 380,
    condition: "good", // 良好
    category: "technology",
    sellerName: "林怡君",
    dateListed: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    isSold: false
  },
  {
    id: "book-3",
    title: "被討厭的勇氣：自我啟發之父阿德勒的教導",
    author: "岸見一郎, 古賀史健",
    price: 180,
    condition: "fair", // 輕微使用痕跡
    category: "humanities",
    sellerName: "王大同",
    dateListed: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    isSold: false
  },
  {
    id: "book-4",
    title: "原子習慣：細微改變帶來巨大成就的實證法則",
    author: "James Clear",
    price: 220,
    condition: "new-like",
    category: "business",
    sellerName: "張雅婷",
    dateListed: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    isSold: true // Coherent with mock order!
  },
  {
    id: "book-5",
    title: "快思慢想",
    author: "Daniel Kahneman",
    price: 250,
    condition: "poor", // 較多使用痕跡
    category: "business",
    sellerName: "黃建國",
    dateListed: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    isSold: false
  }
];

const DEFAULT_WISHLIST = [
  {
    id: "wish-1",
    title: "演算法導論",
    author: "Cormen",
    maxPrice: 600,
    dateAdded: new Date(Date.now() - 3600000 * 10).toISOString(),
    isMatched: false,
    matchedBookId: null
  },
  {
    id: "wish-2",
    title: "原子習慣",
    author: "",
    maxPrice: 200, // atomic habits is 220, so not matched initially
    dateAdded: new Date().toISOString(),
    isMatched: false,
    matchedBookId: null
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "match",
    title: "系統比對成功",
    message: "您追蹤的書籍《Clean Code 程式整潔之道》已被賣家「林怡君」上架，價格為 $380！",
    dateCreated: new Date(Date.now() - 3600000 * 2).toISOString(),
    isRead: false,
    linkBookId: "book-2"
  }
];

const DEFAULT_ORDERS = [
  {
    id: "order-10827364",
    bookId: "book-4",
    bookTitle: "原子習慣：細微改變帶來巨大成就的實證法則",
    bookAuthor: "James Clear",
    bookPrice: 220,
    shippingMethod: "store", // "store" (超商), "home" (宅配), "meet" (面交)
    shippingFee: 60,
    paymentMethod: "credit", // "credit" (信用卡), "atm" (轉帳), "cod" (貨到付款)
    recipientName: "讀書人小明",
    recipientPhone: "0912-345-678",
    recipientAddress: "全家便利商店 台北市南港車站店 (門市代碼：12345)",
    totalAmount: 280,
    dateOrdered: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    status: "delivered", // "processing", "shipped", "delivered", "completed"
    trackingHistory: [
      { status: "processing", title: "訂單已成立", time: new Date(Date.now() - 3600000 * 24 * 3).toISOString() },
      { status: "shipped", title: "賣家已出貨", time: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
      { status: "delivered", title: "商品已送達門市", time: new Date(Date.now() - 3600000 * 24 * 1).toISOString() }
    ]
  }
];

// Initialize Data State from LocalStorage or Defaults
let books = JSON.parse(localStorage.getItem('books')) || DEFAULT_BOOKS;
// Ensure books have 'isSold' property even if loaded from older localStorage
books.forEach(b => { if (b.isSold === undefined) b.isSold = false; });

let wishlist = JSON.parse(localStorage.getItem('wishlist')) || DEFAULT_WISHLIST;
let notifications = JSON.parse(localStorage.getItem('notifications')) || DEFAULT_NOTIFICATIONS;
let orders = JSON.parse(localStorage.getItem('orders')) || DEFAULT_ORDERS;

// Utility functions to save state
function saveState() {
  localStorage.setItem('books', JSON.stringify(books));
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  localStorage.setItem('notifications', JSON.stringify(notifications));
  localStorage.setItem('orders', JSON.stringify(orders));
}

// Format condition string to human-readable
function formatCondition(condition) {
  const mapping = {
    'new-like': '幾近全新',
    'good': '良好',
    'fair': '普通(有使用痕跡)',
    'poor': '較多磨損'
  };
  return mapping[condition] || condition;
}

// Format category string to human-readable
function formatCategory(category) {
  const mapping = {
    'all': '全部類別',
    'technology': '科技資訊',
    'business': '商業理財',
    'humanities': '人文社科',
    'literature': '文學小說',
    'language': '語言學習',
    'other': '其他書籍'
  };
  return mapping[category] || category;
}

// Format Date to relative or readable
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return '剛剛';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

// App Initialization and Event Binding
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderBooks(books);
  renderWishlist();
  renderNotifications();
  renderOrders();
  
  // Navigation tabs switching
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.view-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active nav item
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      // Update active section
      const targetSection = item.getAttribute('data-section');
      sections.forEach(s => {
        if (s.id === targetSection) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
      
      // Section specific logic
      if (targetSection === 'list-book') {
        resetSellerForm();
      } else if (targetSection === 'orders-dashboard') {
        renderOrders();
      } else if (targetSection === 'messages-dashboard') {
        renderChatList();
      }
    });
  });
  
  // Search & Filter event listeners
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');
  const statusFilter = document.getElementById('status-filter');
  
  if (searchInput) searchInput.addEventListener('input', handleFilterChange);
  if (categoryFilter) categoryFilter.addEventListener('change', handleFilterChange);
  if (sortFilter) sortFilter.addEventListener('change', handleFilterChange);
  if (statusFilter) statusFilter.addEventListener('change', handleFilterChange);
  
  function handleFilterChange() {
    const query = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const sortBy = sortFilter.value;
    const showStatus = statusFilter ? statusFilter.value : 'available';
    
    let filtered = books.filter(book => {
      const matchQuery = book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query);
      const matchCategory = category === 'all' || book.category === category;
      const matchStatus = showStatus === 'all' || !book.isSold;
      return matchQuery && matchCategory && matchStatus;
    });
    
    // Sort logic
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      // default: newest first
      filtered.sort((a, b) => new Date(b.dateListed) - new Date(a.dateListed));
    }
    
    renderBooks(filtered);
  }
  
  // Wishlist Form Modal Event Listeners
  const openWishlistModalBtn = document.getElementById('open-wishlist-modal');
  const closeWishlistModalBtn = document.getElementById('close-wishlist-modal');
  const wishlistModal = document.getElementById('wishlist-modal');
  const wishlistForm = document.getElementById('wishlist-form');
  
  if (openWishlistModalBtn && wishlistModal) {
    openWishlistModalBtn.addEventListener('click', () => {
      wishlistModal.classList.add('show');
    });
  }
  
  if (closeWishlistModalBtn && wishlistModal) {
    closeWishlistModalBtn.addEventListener('click', () => {
      wishlistModal.classList.remove('show');
      wishlistForm.reset();
    });
  }
  
  if (wishlistForm) {
    wishlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('wish-title').value.trim();
      const author = document.getElementById('wish-author').value.trim();
      const maxPriceVal = document.getElementById('wish-max-price').value;
      const maxPrice = maxPriceVal ? parseFloat(maxPriceVal) : null;
      
      if (!title) return;
      
      addWishlistItem(title, author, maxPrice);
      
      wishlistModal.classList.remove('show');
      wishlistForm.reset();
    });
  }
  
  // Seller Listing Form Submit
  const sellerForm = document.getElementById('seller-form');
  if (sellerForm) {
    sellerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = document.getElementById('book-title-input').value.trim();
      const author = document.getElementById('book-author-input').value.trim();
      const price = parseFloat(document.getElementById('book-price-input').value);
      const category = document.getElementById('book-category-input').value;
      const description = document.getElementById('book-description-input').value.trim();
      
      const activeConditionEl = document.querySelector('.condition-option.active');
      const condition = activeConditionEl ? activeConditionEl.getAttribute('data-value') : 'good';
      
      if (!title || !author || isNaN(price)) return;
      
      listNewBook(title, author, price, condition, category, description);
    });
  }
  
  // Condition Selector Buttons
  const conditionOptions = document.querySelectorAll('.condition-option');
  conditionOptions.forEach(opt => {
    // Avoid double-binding options that belong to shipping or payment pills
    if (opt.closest('#shipping-pills') || opt.closest('#payment-pills')) return;
    
    opt.addEventListener('click', () => {
      conditionOptions.forEach(o => {
        if (!o.closest('#shipping-pills') && !o.closest('#payment-pills')) {
          o.classList.remove('active');
        }
      });
      opt.classList.add('active');
    });
  });
  
  // Checkout Modal Events Setup
  const closeCheckoutBtn = document.getElementById('close-checkout-modal');
  const cancelCheckoutBtn = document.getElementById('cancel-checkout-btn');
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutForm = document.getElementById('checkout-form');
  const closeReceiptBtn = document.getElementById('close-receipt-btn');
  
  if (closeCheckoutBtn && checkoutModal) {
    closeCheckoutBtn.addEventListener('click', () => {
      checkoutModal.classList.remove('show');
    });
  }
  
  if (cancelCheckoutBtn && checkoutModal) {
    cancelCheckoutBtn.addEventListener('click', () => {
      checkoutModal.classList.remove('show');
    });
  }
  
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', processPayment);
  }
  
  if (closeReceiptBtn) {
    closeReceiptBtn.addEventListener('click', () => {
      if (checkoutModal) checkoutModal.classList.remove('show');
      // Redirect to Orders dashboard
      const ordersTab = document.querySelector('.nav-item[data-section="orders-dashboard"]');
      if (ordersTab) ordersTab.click();
    });
  }
  
  // Checkout Shipping Pills Selection Toggles
  const shippingPills = document.querySelectorAll('#shipping-pills .condition-option');
  shippingPills.forEach(pill => {
    pill.addEventListener('click', () => {
      shippingPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      const value = pill.getAttribute('data-value');
      const addressLabel = document.getElementById('address-label');
      const addressInput = document.getElementById('checkout-address');
      
      if (value === 'store') {
        if (addressLabel) addressLabel.textContent = '超商取件門市名稱 (必要)*';
        if (addressInput) addressInput.placeholder = '例如: 全家便利商店 台北市南港車站店 (門市代碼：12345)';
      } else if (value === 'home') {
        if (addressLabel) addressLabel.textContent = '收件宅配地址 (必要)*';
        if (addressInput) addressInput.placeholder = '例如: 台北市南港區重陽路XXX號X樓';
      } else if (value === 'meet') {
        if (addressLabel) addressLabel.textContent = '面交約定地點與時間 (必要)*';
        if (addressInput) addressInput.placeholder = '例如: 南港捷運站3號出口，平日晚上七點之後';
      }
      
      updateCheckoutPrices();
    });
  });
  
  // Checkout Payment Pills Selection Toggles
  const paymentPills = document.querySelectorAll('#payment-pills .condition-option');
  paymentPills.forEach(pill => {
    pill.addEventListener('click', () => {
      paymentPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      const value = pill.getAttribute('data-value');
      const creditFields = document.getElementById('payment-credit-fields');
      const atmFields = document.getElementById('payment-atm-fields');
      const codFields = document.getElementById('payment-cod-fields');
      
      const cardNum = document.getElementById('checkout-card-num');
      const cardExpiry = document.getElementById('checkout-card-expiry');
      const cardCvc = document.getElementById('checkout-card-cvc');
      
      if (value === 'credit') {
        creditFields.style.display = 'block';
        atmFields.style.display = 'none';
        codFields.style.display = 'none';
        if (cardNum) cardNum.required = true;
        if (cardExpiry) cardExpiry.required = true;
        if (cardCvc) cardCvc.required = true;
      } else if (value === 'atm') {
        creditFields.style.display = 'none';
        atmFields.style.display = 'block';
        codFields.style.display = 'none';
        if (cardNum) cardNum.required = false;
        if (cardExpiry) cardExpiry.required = false;
        if (cardCvc) cardCvc.required = false;
      } else if (value === 'cod') {
        creditFields.style.display = 'none';
        atmFields.style.display = 'none';
        codFields.style.display = 'block';
        if (cardNum) cardNum.required = false;
        if (cardExpiry) cardExpiry.required = false;
        if (cardCvc) cardCvc.required = false;
      }
    });
  });
  
  // Notification Bell Toggle
  const bellContainer = document.getElementById('bell-container');
  const notifDropdown = document.getElementById('notif-dropdown');
  
  if (bellContainer && notifDropdown) {
    bellContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('show');
      
      // Mark all as read when opening notifications
      if (notifDropdown.classList.contains('show')) {
        notifications.forEach(n => n.isRead = true);
        saveState();
        renderNotifications();
      }
    });
    
    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && !bellContainer.contains(e.target)) {
        notifDropdown.classList.remove('show');
      }
    });
  }
  
  // Clear Notifications
  const clearNotifBtn = document.getElementById('clear-notifications');
  if (clearNotifBtn) {
    clearNotifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifications = [];
      saveState();
      renderNotifications();
    });
  }
  
  // Theme toggle click
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update icon
      const icon = themeBtn.querySelector('i');
      if (newTheme === 'light') {
        icon.className = 'fa-regular fa-moon';
      } else {
        icon.className = 'fa-regular fa-sun';
      }
    });
  }
});

// Initialize Theme from LocalStorage or System Preferences
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', theme);
  
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    const icon = themeBtn.querySelector('i');
    if (theme === 'light') {
      icon.className = 'fa-regular fa-moon';
    } else {
      icon.className = 'fa-regular fa-sun';
    }
  }
}

// Render Book Catalog
function renderBooks(booksList) {
  const booksContainer = document.getElementById('books-container');
  if (!booksContainer) return;
  
  if (booksList.length === 0) {
    booksContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-book-open"></i>
        <h3>找不到相符的二手書</h3>
        <p>請更換關鍵字或搜尋其他類別，或直接將此書加入您的追蹤願望清單！</p>
      </div>
    `;
    return;
  }
  
  booksContainer.innerHTML = '';
  
  booksList.forEach(book => {
    const isTracked = wishlist.some(w => !w.isMatched && book.title.toLowerCase().includes(w.title.toLowerCase()));
    
    const card = document.createElement('div');
    card.className = `book-card ${book.isSold ? 'sold' : ''}`;
    card.innerHTML = `
      <div class="book-cover-wrapper">
        <span class="book-tag">${formatCategory(book.category)}</span>
        <div class="book-cover-placeholder">
          <i class="fa-solid fa-book"></i>
          <div style="font-size: 0.75rem; margin-top: 5px; opacity: 0.6;">${book.sellerName} 上架</div>
        </div>
        ${book.isSold ? '<div class="sold-overlay"><span class="sold-stamp">SOLD 已售出</span></div>' : ''}
      </div>
      <div class="book-info">
        <div>
          <div class="book-title" title="${book.title}">${book.title}</div>
          <div class="book-author" title="${book.author}">${book.author}</div>
          <div class="meta-pill" style="font-size: 0.7rem; padding: 0.1rem 0.35rem; margin-bottom: 0.5rem; display: inline-flex;">
            ${formatCondition(book.condition)}
          </div>
        </div>
        <div class="book-footer">
          <div class="book-price">$${book.price}</div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            ${book.isSold 
              ? `<button class="buy-now-btn" disabled style="background: var(--text-muted); cursor: not-allowed; opacity: 0.6; transform: none; box-shadow: none;"><i class="fa-solid fa-ban"></i> 已售出</button>`
              : `<button class="buy-now-btn" onclick="openCheckoutModal('${book.id}')"><i class="fa-solid fa-cart-shopping"></i> 立即購買</button>
                 <button class="btn btn-secondary" onclick="startChat('${book.id}', '${escapeHtml(book.sellerName)}', '${escapeHtml(book.title)}')" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;"><i class="fa-regular fa-comments"></i> 聯絡賣家</button>`
            }
            <button class="track-quick-btn ${isTracked ? 'active' : ''}" 
                    onclick="quickTrackBook(event, '${escapeHtml(book.title)}', '${escapeHtml(book.author)}', ${book.price})"
                    title="${isTracked ? '已在您的追蹤清單中' : '快速追蹤此書'}">
              <i class="fa-solid fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    booksContainer.appendChild(card);
  });
}

// Render Wishlist Table / List
function renderWishlist() {
  const wishlistContainer = document.getElementById('wishlist-container');
  if (!wishlistContainer) return;
  
  // Update stats counters
  const totalTrackedEl = document.getElementById('total-tracked-count');
  const totalMatchedEl = document.getElementById('total-matched-count');
  
  const activeTracks = wishlist.filter(w => !w.isMatched).length;
  const matchedTracks = wishlist.filter(w => w.isMatched).length;
  
  if (totalTrackedEl) totalTrackedEl.textContent = activeTracks;
  if (totalMatchedEl) totalMatchedEl.textContent = matchedTracks;
  
  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-heart-crack"></i>
        <h3>您的願望清單還是空的</h3>
        <p>新增想要尋找的二手書籍。當有賣家上架時，系統會第一時間通知您！</p>
        <button class="btn btn-primary" onclick="document.getElementById('wishlist-modal').classList.add('show')">
          <i class="fa-solid fa-plus"></i> 新增追蹤書籍
        </button>
      </div>
    `;
    return;
  }
  
  wishlistContainer.innerHTML = '';
  
  wishlist.forEach(item => {
    const card = document.createElement('div');
    card.className = 'wishlist-item-card';
    
    let statusBadge = '';
    let itemDetails = '';
    
    if (item.isMatched) {
      const matchedBook = books.find(b => b.id === item.matchedBookId);
      statusBadge = `<span class="wishlist-status status-matched"><i class="fa-solid fa-circle-check"></i> 比對成功</span>`;
      itemDetails = matchedBook 
        ? `<div class="meta-pill price" style="margin-top: 0.25rem;">
             已上架：$${matchedBook.price} (賣家：${matchedBook.sellerName}) - 
             <a href="#" onclick="viewMatchedBook('${matchedBook.id}')" style="color: inherit; text-decoration: underline; font-weight: 600;">點此查看</a>
           </div>`
        : `<div class="meta-pill" style="margin-top: 0.25rem; color: var(--text-muted);">上架書籍已被售出或下架</div>`;
    } else {
      statusBadge = `<span class="wishlist-status status-tracking"><i class="fa-solid fa-radar"></i> 追蹤比對中</span>`;
    }
    
    card.innerHTML = `
      <div class="wishlist-item-main">
        <div class="wishlist-item-icon">
          <i class="fa-solid ${item.isMatched ? 'fa-bell' : 'fa-magnifying-glass'}"></i>
        </div>
        <div class="wishlist-item-details">
          <div class="wishlist-item-title">${item.title}</div>
          <div class="wishlist-item-meta">
            ${item.author ? `<span class="meta-pill"><i class="fa-solid fa-user"></i> ${item.author}</span>` : ''}
            ${item.maxPrice ? `<span class="meta-pill price"><i class="fa-solid fa-tags"></i> 預算上限 $${item.maxPrice}</span>` : '<span class="meta-pill"><i class="fa-solid fa-tags"></i> 無價格限制</span>'}
            <span class="meta-pill"><i class="fa-solid fa-clock"></i> ${timeAgo(item.dateAdded)}新增</span>
          </div>
          ${itemDetails}
        </div>
      </div>
      <div class="wishlist-item-actions">
        ${statusBadge}
        <button class="btn btn-danger" style="padding: 0.4rem; border-radius: 50%;" onclick="removeWishlistItem('${item.id}')" title="刪除此追蹤">
          <i class="fa-regular fa-trash-can" style="font-size: 0.95rem; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"></i>
        </button>
      </div>
    `;
    wishlistContainer.appendChild(card);
  });
}

// Render Notifications
function renderNotifications() {
  const notifList = document.getElementById('notif-list');
  const badge = document.getElementById('notif-badge');
  if (!notifList || !badge) return;
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
  
  if (notifications.length === 0) {
    notifList.innerHTML = `
      <div class="notif-empty">
        <i class="fa-regular fa-bell-slash" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
        沒有任何通知訊息
      </div>
    `;
    return;
  }
  
  notifList.innerHTML = '';
  
  // Sort notifications: newest first
  const sortedNotifs = [...notifications].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  
  sortedNotifs.forEach(notif => {
    const item = document.createElement('div');
    item.className = `notif-item ${notif.isRead ? '' : 'unread'}`;
    item.onclick = () => {
      if (notif.linkBookId) {
        viewMatchedBook(notif.linkBookId);
      }
    };
    
    item.innerHTML = `
      <div class="notif-icon">
        <i class="fa-solid fa-bell"></i>
      </div>
      <div class="notif-content">
        <div class="notif-text">${notif.message}</div>
        <div class="notif-time">${timeAgo(notif.dateCreated)}</div>
      </div>
    `;
    notifList.appendChild(item);
  });
}

// Add Wishlist Item (Book Tracking)
function addWishlistItem(title, author, maxPrice) {
  // Check duplicate tracking
  const duplicate = wishlist.find(w => !w.isMatched && w.title.toLowerCase() === title.toLowerCase());
  if (duplicate) {
    showToast("提示資訊", `您已在追蹤《${title}》了！`, "info");
    return;
  }
  
  const newWishItem = {
    id: 'wish-' + Date.now(),
    title,
    author,
    maxPrice,
    dateAdded: new Date().toISOString(),
    isMatched: false,
    matchedBookId: null
  };
  
  wishlist.push(newWishItem);
  
  // Check if any existing listed book matches the new wishlist tracking criteria
  checkSingleWishlistMatch(newWishItem);
  
  saveState();
  renderWishlist();
  renderBooks(books);
  
  showToast("新增追蹤成功", `系統已開始為您持續比對《${title}》的賣家上架資訊！`, "success");
}

// Helper to check match when a new wishlist item is added
function checkSingleWishlistMatch(wishItem) {
  // Find matching book listed
  const matchedBook = books.find(book => {
    const titleMatch = book.title.toLowerCase().includes(wishItem.title.toLowerCase()) || 
                       wishItem.title.toLowerCase().includes(book.title.toLowerCase());
    
    let authorMatch = true;
    if (wishItem.author) {
      authorMatch = book.author.toLowerCase().includes(wishItem.author.toLowerCase()) || 
                    wishItem.author.toLowerCase().includes(book.author.toLowerCase());
    }
    
    let priceMatch = true;
    if (wishItem.maxPrice) {
      priceMatch = book.price <= wishItem.maxPrice;
    }
    
    return titleMatch && authorMatch && priceMatch;
  });
  
  if (matchedBook) {
    wishItem.isMatched = true;
    wishItem.matchedBookId = matchedBook.id;
    
    // Send Notification
    const notifMsg = `找到符合條件的書籍！您追蹤的《${wishItem.title}》目前已有上架，價格為 $${matchedBook.price}。`;
    const newNotif = {
      id: 'notif-' + Date.now(),
      type: "match",
      title: "追蹤圖書比對成功",
      message: notifMsg,
      dateCreated: new Date().toISOString(),
      isRead: false,
      linkBookId: matchedBook.id
    };
    
    notifications.unshift(newNotif);
    
    // Trigger instant Toast notification
    setTimeout(() => {
      showToast("找到追蹤書籍了！", notifMsg, "match");
    }, 800);
  }
}

// Remove Wishlist Item
function removeWishlistItem(id) {
  wishlist = wishlist.filter(w => w.id !== id);
  saveState();
  renderWishlist();
  renderBooks(books); // Re-render to update tracking icons
  showToast("已取消追蹤", "已將該書移出您的追蹤名單。", "info");
}

// Quick Track from Book Card
function quickTrackBook(event, title, author, price) {
  event.stopPropagation();
  
  // If already tracking, remove it. Otherwise add.
  const existingIndex = wishlist.findIndex(w => !w.isMatched && w.title.toLowerCase() === title.toLowerCase());
  
  if (existingIndex > -1) {
    // Remove
    const item = wishlist[existingIndex];
    removeWishlistItem(item.id);
  } else {
    // Add (limit price to current price + 50 as a smart budget helper, or null)
    addWishlistItem(title, author, null);
  }
}

// Sell Simulator - List New Book
function listNewBook(title, author, price, condition, category, description) {
  const newBook = {
    id: 'book-' + Date.now(),
    title,
    author,
    price,
    condition,
    category,
    sellerName: "我的模擬店鋪",
    dateListed: new Date().toISOString()
  };
  
  // Add to books database
  books.unshift(newBook);
  
  // Core matching algorithm: Check if this new book triggers notifications for any tracked wishlist item
  let matchTriggered = false;
  
  wishlist.forEach(wishItem => {
    if (wishItem.isMatched) return; // Skip already matched items
    
    // Check match criteria
    const titleMatch = newBook.title.toLowerCase().includes(wishItem.title.toLowerCase()) || 
                       wishItem.title.toLowerCase().includes(newBook.title.toLowerCase());
    
    let authorMatch = true;
    if (wishItem.author) {
      authorMatch = newBook.author.toLowerCase().includes(wishItem.author.toLowerCase()) ||
                    wishItem.author.toLowerCase().includes(newBook.author.toLowerCase());
    }
    
    let priceMatch = true;
    if (wishItem.maxPrice) {
      priceMatch = newBook.price <= wishItem.maxPrice;
    }
    
    if (titleMatch && authorMatch && priceMatch) {
      // Mark as matched
      wishItem.isMatched = true;
      wishItem.matchedBookId = newBook.id;
      matchTriggered = true;
      
      // Create system notification
      const notifMsg = `二手書上架提醒！您追蹤的書籍《${wishItem.title}》剛被上架，價格只需 $${newBook.price}！(書況：${formatCondition(newBook.condition)})`;
      
      const newNotif = {
        id: 'notif-' + Date.now() + '-' + wishItem.id,
        type: 'match',
        title: '追蹤書籍上架通知',
        message: notifMsg,
        dateCreated: new Date().toISOString(),
        isRead: false,
        linkBookId: newBook.id
      };
      
      notifications.unshift(newNotif);
      
      // Trigger instant animated Toast window
      showToast("追蹤書籍已上架！", notifMsg, "match");
    }
  });
  
  saveState();
  
  // Show successful listing message
  const successMessage = document.getElementById('seller-success-alert');
  if (successMessage) {
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Reset form inputs
  resetSellerForm();
  
  // Refresh views
  renderBooks(books);
  renderWishlist();
  renderNotifications();
  
  if (!matchTriggered) {
    showToast("商品上架成功", `您的二手書《${title}》已成功在平台上架。`, "success");
  }
}

function bookTitlePreProcess(title) {
  return title.trim().toLowerCase();
}

function resetSellerForm() {
  const sellerForm = document.getElementById('seller-form');
  if (sellerForm) sellerForm.reset();
  
  // Reset condition pills
  const conditionOptions = document.querySelectorAll('.condition-option');
  conditionOptions.forEach((o, idx) => {
    if (idx === 1) o.classList.add('active'); // default to Good
    else o.classList.remove('active');
  });
}

// Redirect and focus on matching book in directory
function viewMatchedBook(bookId) {
  // Close notification dropdown
  const notifDropdown = document.getElementById('notif-dropdown');
  if (notifDropdown) notifDropdown.classList.remove('show');
  
  // Switch tab to market
  const marketTab = document.querySelector('.nav-item[data-section="market-dashboard"]');
  if (marketTab) marketTab.click();
  
  // Highlight the book card
  setTimeout(() => {
    // Find the book card element
    // Let's filter book listing to show all to ensure the book is visible
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = 'all';
    
    renderBooks(books);
    
    // Scroll to the book card or find it
    const bookCards = document.querySelectorAll('.book-card');
    let targetCard = null;
    
    // We can match by titles or inspect catalog. For simulation, let's flash a color on the book card if it's there
    // A simple find of the book
    const bookObj = books.find(b => b.id === bookId);
    if (!bookObj) return;
    
    bookCards.forEach(card => {
      const titleEl = card.querySelector('.book-title');
      if (titleEl && titleEl.textContent === bookObj.title) {
        targetCard = card;
      }
    });
    
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetCard.style.outline = '3px solid var(--accent)';
      targetCard.style.transform = 'scale(1.05)';
      
      setTimeout(() => {
        targetCard.style.outline = 'none';
        targetCard.style.transform = 'none';
      }, 3000);
    }
  }, 100);
}

// Instant Notification Toast System implementation
function showToast(title, message, type = "success") {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let iconClass = 'fa-solid fa-circle-check';
  if (type === 'match') {
    iconClass = 'fa-solid fa-bell-on';
    toast.style.borderColor = 'var(--accent)';
    toast.style.borderLeftColor = 'var(--accent)';
  } else if (type === 'info') {
    iconClass = 'fa-solid fa-circle-info';
    toast.style.borderColor = 'var(--primary)';
    toast.style.borderLeftColor = 'var(--primary)';
  }
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="${iconClass}"></i>
    </div>
    <div class="toast-body">
      <div class="toast-header">
        <span>${title}</span>
        <button class="toast-close">&times;</button>
      </div>
      <div class="toast-text">${message}</div>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Close action
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.onclick = () => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  };
  
  // Auto remove
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, 6000);
}

// Helper to escape HTML tags in strings to prevent injection
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

// --- ONLINE TRANSACTION SYSTEM LOGIC ---
let activeCheckoutBookId = null;

function openCheckoutModal(bookId) {
  activeCheckoutBookId = bookId;
  const book = books.find(b => b.id === bookId);
  if (!book) return;
  
  // Populate book card details in modal
  const titleEl = document.getElementById('checkout-book-title');
  const authorEl = document.getElementById('checkout-book-author');
  const conditionEl = document.getElementById('checkout-book-condition');
  const priceEl = document.getElementById('checkout-book-price');
  
  if (titleEl) titleEl.textContent = book.title;
  if (authorEl) authorEl.textContent = book.author;
  if (conditionEl) {
    conditionEl.textContent = formatCondition(book.condition);
    conditionEl.className = 'meta-pill';
  }
  if (priceEl) priceEl.textContent = `$${book.price}`;
  
  // Reset pills to default: store delivery, credit card payment
  const defaultShipping = document.querySelector('#shipping-pills .condition-option[data-value="store"]');
  if (defaultShipping) defaultShipping.click();
  
  const defaultPayment = document.querySelector('#payment-pills .condition-option[data-value="credit"]');
  if (defaultPayment) defaultPayment.click();
  
  // Set default placeholder matching address
  const addressInput = document.getElementById('checkout-address');
  if (addressInput) addressInput.value = '全家便利商店 台北市南港車站店 (門市代碼：12345)';
  
  // Update calculations
  updateCheckoutPrices();
  
  // Show form view & hide loading/success views
  const formStep = document.getElementById('checkout-form-step');
  const formFooter = document.getElementById('checkout-form-footer');
  const processingStep = document.getElementById('checkout-processing-step');
  const successStep = document.getElementById('checkout-success-step');
  
  if (formStep) formStep.style.display = 'block';
  if (formFooter) formFooter.style.display = 'flex';
  if (processingStep) processingStep.style.display = 'none';
  if (successStep) successStep.style.display = 'none';
  
  // Open modal
  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutModal) checkoutModal.classList.add('show');
}

function updateCheckoutPrices() {
  if (!activeCheckoutBookId) return;
  const book = books.find(b => b.id === activeCheckoutBookId);
  if (!book) return;
  
  const activeShipping = document.querySelector('#shipping-pills .condition-option.active');
  const shippingFee = activeShipping ? parseInt(activeShipping.getAttribute('data-fee')) : 60;
  
  const subtotal = book.price;
  const total = subtotal + shippingFee;
  
  const calcPrice = document.getElementById('checkout-calc-price');
  const calcShipping = document.getElementById('checkout-calc-shipping');
  const calcTotal = document.getElementById('checkout-calc-total');
  
  if (calcPrice) calcPrice.textContent = `$${subtotal}`;
  if (calcShipping) calcShipping.textContent = `$${shippingFee}`;
  if (calcTotal) calcTotal.textContent = `$${total}`;
}

function processPayment(e) {
  if (e) e.preventDefault();
  
  if (!activeCheckoutBookId) return;
  const book = books.find(b => b.id === activeCheckoutBookId);
  if (!book) return;
  
  const name = document.getElementById('checkout-name').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const address = document.getElementById('checkout-address').value.trim();
  
  if (!name || !phone || !address) {
    showToast("輸入錯誤", "請完整填寫收件人姓名、電話及配送地址資訊！", "info");
    return;
  }
  
  // Transition to processing loading view
  const formStep = document.getElementById('checkout-form-step');
  const formFooter = document.getElementById('checkout-form-footer');
  const processingStep = document.getElementById('checkout-processing-step');
  
  if (formStep) formStep.style.display = 'none';
  if (formFooter) formFooter.style.display = 'none';
  if (processingStep) processingStep.style.display = 'block';
  
  // Simulated 2-second SSL payment loading animation
  const loadingText = document.getElementById('checkout-loading-text');
  const progressBar = document.getElementById('checkout-progress-bar');
  
  let progress = 0;
  if (progressBar) progressBar.style.width = '0%';
  
  const progressInterval = setInterval(() => {
    progress += 12.5; // 8 steps to reach 100% over 2 seconds (250ms interval)
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    if (loadingText) {
      if (progress === 12.5) loadingText.textContent = "正在建立 256-bit SSL 安全連線加密...";
      else if (progress === 37.5) loadingText.textContent = "驗證買家付款憑證與信用授權中...";
      else if (progress === 62.5) loadingText.textContent = "通過 VISA/MasterCard 3D Secure 驗證...";
      else if (progress === 87.5) loadingText.textContent = "向賣家資料庫傳送訂單建立請求與通知備份...";
    }
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      completeCheckoutTransaction(book, name, phone, address);
    }
  }, 250);
}

function completeCheckoutTransaction(book, recipientName, recipientPhone, recipientAddress) {
  // Mark book as sold
  book.isSold = true;
  
  // Get shipping details
  const activeShipping = document.querySelector('#shipping-pills .condition-option.active');
  const shippingMethod = activeShipping ? activeShipping.getAttribute('data-value') : 'store';
  const shippingFee = activeShipping ? parseInt(activeShipping.getAttribute('data-fee')) : 60;
  
  // Get payment details
  const activePayment = document.querySelector('#payment-pills .condition-option.active');
  const paymentMethod = activePayment ? activePayment.getAttribute('data-value') : 'credit';
  
  let shippingName = '超商取貨';
  if (shippingMethod === 'home') shippingName = '黑貓宅配';
  if (shippingMethod === 'meet') shippingName = '面交自取';
  
  let paymentName = '信用卡線上刷卡';
  if (paymentMethod === 'atm') paymentName = 'ATM 轉帳';
  if (paymentMethod === 'cod') paymentName = '貨到付款';
  
  // Create order
  const orderId = "order-" + Math.floor(10000000 + Math.random() * 90000000);
  const totalAmount = book.price + shippingFee;
  
  const newOrder = {
    id: orderId,
    bookId: book.id,
    bookTitle: book.title,
    bookAuthor: book.author,
    bookPrice: book.price,
    shippingMethod,
    shippingFee,
    paymentMethod,
    recipientName,
    recipientPhone,
    recipientAddress,
    totalAmount,
    dateOrdered: new Date().toISOString(),
    status: "processing", // "processing", "shipped", "delivered", "completed"
    trackingHistory: [
      { status: "processing", title: "訂單已成立，安全第三方支付代收成功", time: new Date().toISOString() }
    ]
  };
  
  orders.unshift(newOrder);
  
  // Sync wishlist matches (if user bought a book that matches active wishes)
  wishlist.forEach(w => {
    if (!w.isMatched && book.title.toLowerCase().includes(w.title.toLowerCase())) {
      w.isMatched = true;
      w.matchedBookId = book.id;
    }
  });
  
  // Create system notification
  const notifMsg = `交易成功！您已成功購買《${book.title}》，訂單編號為 ${orderId}。點擊此通知可前往訂單管理查看配送進度。`;
  const newNotif = {
    id: 'notif-' + Date.now(),
    type: "match",
    title: "訂單交易成立",
    message: notifMsg,
    dateCreated: new Date().toISOString(),
    isRead: false,
    linkBookId: book.id
  };
  notifications.unshift(newNotif);
  
  // Persist State
  saveState();
  
  // Render Receipt fields
  const receiptDate = document.getElementById('receipt-date');
  const receiptId = document.getElementById('receipt-id');
  const receiptBookTitle = document.getElementById('receipt-book-title');
  const receiptBookPrice = document.getElementById('receipt-book-price');
  const receiptShippingName = document.getElementById('receipt-shipping-name');
  const receiptShippingFee = document.getElementById('receipt-shipping-fee');
  const receiptTotal = document.getElementById('receipt-total');
  const receiptRecipientName = document.getElementById('receipt-recipient-name');
  const receiptRecipientPhone = document.getElementById('receipt-recipient-phone');
  const receiptRecipientAddress = document.getElementById('receipt-recipient-address');
  const receiptPaymentMethod = document.getElementById('receipt-payment-method');
  
  const pad = (n) => n < 10 ? '0' + n : n;
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  
  if (receiptDate) receiptDate.textContent = `發票日期: ${dateStr}`;
  if (receiptId) receiptId.textContent = `訂單編號: ${orderId}`;
  if (receiptBookTitle) receiptBookTitle.textContent = book.title;
  if (receiptBookPrice) receiptBookPrice.textContent = `$${book.price}`;
  if (receiptShippingName) receiptShippingName.textContent = shippingMethod === 'store' ? '超商運費' : (shippingMethod === 'home' ? '宅配運費' : '面交運費');
  if (receiptShippingFee) receiptShippingFee.textContent = `$${shippingFee}`;
  if (receiptTotal) receiptTotal.textContent = `$${totalAmount}`;
  if (receiptRecipientName) receiptRecipientName.textContent = recipientName;
  if (receiptRecipientPhone) receiptRecipientPhone.textContent = recipientPhone;
  if (receiptRecipientAddress) receiptRecipientAddress.textContent = recipientAddress;
  if (receiptPaymentMethod) receiptPaymentMethod.textContent = paymentName;
  
  // Transition loading view to success receipt view
  const processingStep = document.getElementById('checkout-processing-step');
  const successStep = document.getElementById('checkout-success-step');
  
  if (processingStep) processingStep.style.display = 'none';
  if (successStep) successStep.style.display = 'block';
  
  // Pop a success Toast
  showToast("交易結帳成功", `訂單 ${orderId} 成立，請查收電子發票！`, "success");
  
  // Refresh page data renderings
  renderBooks(books);
  renderWishlist();
  renderNotifications();
  renderOrders();
}

function renderOrders() {
  const container = document.getElementById('orders-container');
  if (!container) return;
  
  // Update orders dashboard statistics
  const totalOrdersEl = document.getElementById('total-orders-count');
  const totalSpentEl = document.getElementById('total-spent-amount');
  const activeDeliveryEl = document.getElementById('active-delivery-count');
  
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeDeliveries = orders.filter(o => o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered').length;
  
  if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
  if (totalSpentEl) totalSpentEl.textContent = `$${totalSpent}`;
  if (activeDeliveryEl) activeDeliveryEl.textContent = activeDeliveries;
  
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-receipt"></i>
        <h3>您目前沒有任何交易訂單</h3>
        <p>去二手書市集逛逛，尋找您喜愛的好書並體驗線上安全交易吧！</p>
        <button class="btn btn-primary" onclick="document.querySelector('.nav-item[data-section=\\'market-dashboard\\']').click()">
          <i class="fa-solid fa-store"></i> 瀏覽二手書市集
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  orders.forEach(order => {
    // Generate status badge HTML
    let statusBadge = '';
    if (order.status === 'processing') {
      statusBadge = `<span class="wishlist-status status-tracking" style="background: rgba(99, 102, 241, 0.1); color: var(--primary); border-color: rgba(99, 102, 241, 0.2);"><i class="fa-solid fa-spinner fa-spin" style="margin-right: 4px;"></i> 訂單處理中</span>`;
    } else if (order.status === 'shipped') {
      statusBadge = `<span class="wishlist-status status-tracking" style="background: rgba(249, 115, 22, 0.1); color: var(--accent); border-color: rgba(249, 115, 22, 0.2);"><i class="fa-solid fa-truck" style="margin-right: 4px;"></i> 賣家已出貨</span>`;
    } else if (order.status === 'delivered') {
      statusBadge = `<span class="wishlist-status status-tracking" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: rgba(59, 130, 246, 0.2); animation: pulse 2s infinite;"><i class="fa-solid fa-box" style="margin-right: 4px;"></i> 商品已送達</span>`;
    } else if (order.status === 'completed') {
      statusBadge = `<span class="wishlist-status status-matched" style="animation: none;"><i class="fa-solid fa-circle-check" style="margin-right: 4px;"></i> 交易已完成</span>`;
    }
    
    // Map payment method name
    let paymentName = '信用卡線上刷卡';
    if (order.paymentMethod === 'atm') paymentName = 'ATM 轉帳';
    if (order.paymentMethod === 'cod') paymentName = '貨到付款';
    
    // Milestones tracking history HTML
    const milestones = [
      { status: 'processing', title: '訂單已成立，安全第三方支付代收成功' },
      { status: 'shipped', title: '賣家已出貨，物流配送中' },
      { status: 'delivered', title: '商品已送達，等待收件人領取' },
      { status: 'completed', title: '交易完成，已撥付書款予賣家' }
    ];
    
    const statusOrder = ['processing', 'shipped', 'delivered', 'completed'];
    const currentIndex = statusOrder.indexOf(order.status);
    
    let timelineNodesHtml = '';
    milestones.forEach((milestone, idx) => {
      const historyEntry = order.trackingHistory.find(h => h.status === milestone.status);
      const isCompleted = idx < currentIndex;
      const isActive = idx === currentIndex;
      
      let nodeClass = 'timeline-node';
      if (isActive) nodeClass = 'timeline-node active';
      else if (isCompleted || historyEntry) nodeClass = 'timeline-node completed';
      
      let displayTitle = milestone.title;
      let displayTime = '';
      
      if (historyEntry) {
        displayTitle = historyEntry.title;
        displayTime = `<div class="timeline-time">${new Date(historyEntry.time).toLocaleString()}</div>`;
      } else {
        if (milestone.status === 'shipped') displayTitle = '等待賣家出貨';
        if (milestone.status === 'delivered') displayTitle = '等待物流送達';
        if (milestone.status === 'completed') displayTitle = '買家確認收貨後，訂單即完成';
      }
      
      timelineNodesHtml += `
        <div class="${nodeClass}">
          <div class="timeline-title" style="font-size: 0.75rem;">${displayTitle}</div>
          ${displayTime}
        </div>
      `;
    });
    
    const card = document.createElement('div');
    card.className = 'order-item-card';
    card.innerHTML = `
      <div class="order-header-row">
        <div>
          <span style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem; margin-right: 0.75rem;">
            訂單編號: <span style="font-family: monospace;">${order.id}</span>
          </span>
          <span class="meta-pill"><i class="fa-solid fa-clock"></i> ${new Date(order.dateOrdered).toLocaleDateString()}</span>
        </div>
        <div>
          ${statusBadge}
        </div>
      </div>
      
      <div class="order-details-body">
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <div style="width: 44px; height: 60px; background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary)); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); flex-shrink: 0;">
              <i class="fa-solid fa-book" style="font-size: 1.1rem; opacity: 0.5;"></i>
            </div>
            <div>
              <h4 style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.15rem;">${order.bookTitle}</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary);">${order.bookAuthor}</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: 0.75rem; margin-top: 0.25rem;">
            <div>
              <span style="color: var(--text-muted); display: block; margin-bottom: 0.15rem;">收件人姓名</span>
              <span style="font-weight: 600; color: var(--text-primary);">${order.recipientName}</span>
            </div>
            <div>
              <span style="color: var(--text-muted); display: block; margin-bottom: 0.15rem;">聯絡電話</span>
              <span style="font-weight: 600; color: var(--text-primary);">${order.recipientPhone}</span>
            </div>
            <div style="grid-column: 1 / -1;">
              <span style="color: var(--text-muted); display: block; margin-bottom: 0.15rem;">收件地址 / 配送資訊</span>
              <span style="font-weight: 600; color: var(--text-primary); word-break: break-all;">${order.recipientAddress}</span>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-glass); border: 1px solid var(--border-color); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-top: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-size: 0.75rem; color: var(--text-secondary);">
              <span>書籍 $${order.bookPrice} + 運費 $${order.shippingFee} (${paymentName})</span>
            </div>
            <div style="font-size: 0.95rem; font-weight: 800; color: var(--secondary);">
              交易總計: <span style="font-size: 1.1rem;">$${order.totalAmount}</span>
            </div>
          </div>
          
          ${order.status === 'delivered' 
            ? `<div style="margin-top: 0.5rem;">
                 <button class="btn btn-primary" style="width: 100%; justify-content: center; background: var(--secondary); box-shadow: none; padding: 0.5rem;" onclick="confirmOrderReceived('${order.id}')">
                   <i class="fa-solid fa-circle-check"></i> 確認收到商品 (完成交易)
                 </button>
               </div>` 
            : ''
          }
        </div>
        
        <div>
          <h5 style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.35rem;">物流狀態時間軸</h5>
          <div class="order-timeline">
            ${timelineNodesHtml}
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function confirmOrderReceived(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  order.status = 'completed';
  order.trackingHistory.push({
    status: 'completed',
    title: '買家已確認收貨，本筆二手書交易安全完成，款項已匯予賣家',
    time: new Date().toISOString()
  });
  
  // Create system notification
  const notifMsg = `交易順利完成！您購買的書籍《${order.bookTitle}》(訂單編號: ${order.id}) 款項已撥付給賣家，感謝您的信任！`;
  const newNotif = {
    id: 'notif-' + Date.now(),
    type: "match",
    title: "二手交易安全完成",
    message: notifMsg,
    dateCreated: new Date().toISOString(),
    isRead: false,
    linkBookId: order.bookId
  };
  notifications.unshift(newNotif);
  
  saveState();
  
  showToast("交易順利完成", "款項已安全轉交給賣家，感謝您的訂購！", "success");
  
  renderOrders();
  renderNotifications();
}

// Global helper exposures
window.quickTrackBook = quickTrackBook;
window.removeWishlistItem = removeWishlistItem;
window.viewMatchedBook = viewMatchedBook;
window.openCheckoutModal = openCheckoutModal;
window.confirmOrderReceived = confirmOrderReceived;
window.updateCheckoutPrices = updateCheckoutPrices;

/* =========================================
   Chat & Real-time Messaging System (Socket.io)
   ========================================= */

// Define current mock user ID since we don't have a real login system yet
const CURRENT_USER_ID = "user_me"; 

// Local chat state
let chatRooms = JSON.parse(localStorage.getItem('chatRooms')) || [];
let currentActiveChatId = null;

let socket;
try {
  // If socket.io is loaded
  if (typeof io !== 'undefined') {
    socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('已成功連線至 Socket.io 伺服器');
      // Join all existing rooms
      chatRooms.forEach(room => {
        socket.emit('join_room', { chatRoomId: room.id, userId: CURRENT_USER_ID });
      });
    });

    socket.on('receive_message', (msg) => {
      console.log('收到新訊息', msg);
      // Find room
      const room = chatRooms.find(r => r.id === msg.chatRoomId);
      if (room) {
        room.messages.push({
          id: 'msg-' + Date.now(),
          sender: msg.sender,
          content: msg.content,
          time: new Date().toISOString()
        });
        room.lastUpdated = new Date().toISOString();
        saveChatState();
        
        // If we are currently viewing this room, render the message
        if (currentActiveChatId === room.id) {
          renderChatMessages(room);
        } else {
          // Show Toast Notification
          if (msg.sender !== CURRENT_USER_ID) {
            showToast("收到新訊息", `${room.sellerName}: ${msg.content}`, "info");
          }
        }
        renderChatList();
      }
    });

    socket.on('user_typing', ({ userId, isTyping }) => {
      const typingIndicator = document.getElementById('chat-typing-indicator');
      if (typingIndicator && userId !== CURRENT_USER_ID) {
        typingIndicator.style.display = isTyping ? 'inline-block' : 'none';
      }
    });
  }
} catch (err) {
  console.warn('Socket.io 連線失敗，可能尚未啟動 Node.js 伺服器。將退回純本地端模式。', err);
}

function saveChatState() {
  localStorage.setItem('chatRooms', JSON.stringify(chatRooms));
}

function startChat(bookId, sellerName, bookTitle) {
  // Switch to messages tab
  const messagesTab = document.querySelector('.nav-item[data-section="messages-dashboard"]');
  if (messagesTab) messagesTab.click();

  // Find or create room
  const roomId = `room-${bookId}-${sellerName}`;
  let room = chatRooms.find(r => r.id === roomId);
  
  if (!room) {
    room = {
      id: roomId,
      bookId: bookId,
      bookTitle: bookTitle,
      sellerName: sellerName,
      messages: [],
      lastUpdated: new Date().toISOString()
    };
    chatRooms.push(room);
    saveChatState();
    
    // Join socket room
    if (socket && socket.connected) {
      socket.emit('join_room', { chatRoomId: roomId, userId: CURRENT_USER_ID });
    }
  }

  openChatRoom(roomId);
  renderChatList();
}

function renderChatList() {
  const container = document.getElementById('chat-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (chatRooms.length === 0) {
    container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">目前沒有任何通訊紀錄</div>`;
    return;
  }

  // Sort by last updated
  const sortedRooms = [...chatRooms].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  sortedRooms.forEach(room => {
    const item = document.createElement('div');
    item.className = `chat-item ${currentActiveChatId === room.id ? 'active' : ''}`;
    
    const lastMsg = room.messages.length > 0 ? room.messages[room.messages.length - 1].content : '尚未有對話';
    
    item.innerHTML = `
      <div class="chat-item-name"><i class="fa-solid fa-user-circle"></i> ${room.sellerName}</div>
      <div class="chat-item-book">關於：${room.bookTitle}</div>
      <div class="chat-item-preview">${lastMsg}</div>
    `;
    
    item.onclick = () => openChatRoom(room.id);
    container.appendChild(item);
  });
}

function openChatRoom(roomId) {
  currentActiveChatId = roomId;
  
  const room = chatRooms.find(r => r.id === roomId);
  if (!room) return;

  const emptyState = document.getElementById('chat-empty-state');
  const activeView = document.getElementById('chat-active-view');
  
  if (emptyState) emptyState.style.display = 'none';
  if (activeView) activeView.style.display = 'flex';
  
  const nameEl = document.getElementById('chat-active-name');
  const bookEl = document.getElementById('chat-active-book');
  
  if (nameEl) nameEl.innerHTML = `<i class="fa-solid fa-user-circle"></i> ${room.sellerName}`;
  if (bookEl) bookEl.textContent = `關於：${room.bookTitle}`;

  renderChatMessages(room);
  renderChatList(); // Update active state in sidebar
}

function renderChatMessages(room) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (room.messages.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: 2rem; font-size: 0.85rem;">開始與 ${room.sellerName} 的對話吧！</div>`;
  } else {
    room.messages.forEach(msg => {
      const isMine = msg.sender === CURRENT_USER_ID;
      const wrap = document.createElement('div');
      wrap.className = `message-wrapper ${isMine ? 'mine' : 'theirs'}`;
      wrap.innerHTML = `
        <div class="message-bubble">${escapeHtml(msg.content)}</div>
        <div class="message-time">${timeAgo(msg.time)}</div>
      `;
      container.appendChild(wrap);
    });
  }
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// Bind chat form submit
document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const content = chatInput.value.trim();
      if (!content || !currentActiveChatId) return;
      
      const room = chatRooms.find(r => r.id === currentActiveChatId);
      if (!room) return;
      
      // Emit via Socket.io
      if (socket && socket.connected) {
        socket.emit('send_message', {
          chatRoomId: room.id,
          sender: CURRENT_USER_ID,
          receiver: room.sellerName, // Mock receiver ID
          book: room.bookId,
          content: content
        });
      } else {
        // Fallback local mock simulation
        const newMsg = {
          id: 'msg-' + Date.now(),
          sender: CURRENT_USER_ID,
          content: content,
          time: new Date().toISOString()
        };
        room.messages.push(newMsg);
        room.lastUpdated = new Date().toISOString();
        saveChatState();
        renderChatMessages(room);
        renderChatList();
        
        // Mock auto-reply
        setTimeout(() => {
          room.messages.push({
            id: 'msg-' + Date.now(),
            sender: room.sellerName,
            content: `【自動回覆】我目前不在線上，晚點回覆您關於「${room.bookTitle}」的問題喔！`,
            time: new Date().toISOString()
          });
          room.lastUpdated = new Date().toISOString();
          saveChatState();
          if (currentActiveChatId === room.id) renderChatMessages(room);
          renderChatList();
          showToast("收到新訊息", `${room.sellerName}: 【自動回覆】...`, "info");
        }, 1500);
      }
      
      chatInput.value = '';
    });
    
    // Typing indicator emit
    let typingTimer;
    chatInput.addEventListener('input', () => {
      if (socket && socket.connected && currentActiveChatId) {
        socket.emit('typing', { chatRoomId: currentActiveChatId, userId: CURRENT_USER_ID, isTyping: true });
        
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          socket.emit('typing', { chatRoomId: currentActiveChatId, userId: CURRENT_USER_ID, isTyping: false });
        }, 1000);
      }
    });
  }
});

window.startChat = startChat;
window.openChatRoom = openChatRoom;

