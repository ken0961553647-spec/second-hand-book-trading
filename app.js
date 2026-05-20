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
    dateListed: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  },
  {
    id: "book-2",
    title: "Clean Code 程式整潔之道",
    author: "Robert C. Martin",
    price: 380,
    condition: "good", // 良好
    category: "technology",
    sellerName: "林怡君",
    dateListed: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: "book-3",
    title: "被討厭的勇氣：自我啟發之父阿德勒的教導",
    author: "岸見一郎, 古賀史健",
    price: 180,
    condition: "fair", // 輕微使用痕跡
    category: "humanities",
    sellerName: "王大同",
    dateListed: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
  },
  {
    id: "book-4",
    title: "原子習慣：細微改變帶來巨大成就的實證法則",
    author: "James Clear",
    price: 220,
    condition: "new-like",
    category: "business",
    sellerName: "張雅婷",
    dateListed: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
  },
  {
    id: "book-5",
    title: "快思慢想",
    author: "Daniel Kahneman",
    price: 250,
    condition: "poor", // 較多使用痕跡
    category: "business",
    sellerName: "黃建國",
    dateListed: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hours ago
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

// Initialize Data State from LocalStorage or Defaults
let books = JSON.parse(localStorage.getItem('books')) || DEFAULT_BOOKS;
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || DEFAULT_WISHLIST;
let notifications = JSON.parse(localStorage.getItem('notifications')) || DEFAULT_NOTIFICATIONS;

// Utility functions to save state
function saveState() {
  localStorage.setItem('books', JSON.stringify(books));
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  localStorage.setItem('notifications', JSON.stringify(notifications));
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
      
      // If switching to list-book section, clear any success alerts
      if (targetSection === 'list-book') {
        resetSellerForm();
      }
    });
  });
  
  // Search & Filter event listeners
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');
  
  if (searchInput) searchInput.addEventListener('input', handleFilterChange);
  if (categoryFilter) categoryFilter.addEventListener('change', handleFilterChange);
  if (sortFilter) sortFilter.addEventListener('change', handleFilterChange);
  
  function handleFilterChange() {
    const query = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const sortBy = sortFilter.value;
    
    let filtered = books.filter(book => {
      const matchQuery = book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query);
      const matchCategory = category === 'all' || book.category === category;
      return matchQuery && matchCategory;
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
    opt.addEventListener('click', () => {
      conditionOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
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
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-cover-wrapper">
        <span class="book-tag">${formatCategory(book.category)}</span>
        <div class="book-cover-placeholder">
          <i class="fa-solid fa-book"></i>
          <div style="font-size: 0.75rem; margin-top: 5px; opacity: 0.6;">${book.sellerName} 上架</div>
        </div>
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
          <button class="track-quick-btn ${isTracked ? 'active' : ''}" 
                  onclick="quickTrackBook(event, '${escapeHtml(book.title)}', '${escapeHtml(book.author)}', ${book.price})"
                  title="${isTracked ? '已在您的追蹤清單中' : '快速追蹤此書'}">
            <i class="fa-solid fa-heart"></i>
          </button>
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

// Global quickTrack helper exposure
window.quickTrackBook = quickTrackBook;
window.removeWishlistItem = removeWishlistItem;
window.viewMatchedBook = viewMatchedBook;
