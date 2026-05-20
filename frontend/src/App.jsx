import React, { useState } from 'react';
import SearchPage from './components/SearchPage';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const [view, setView] = useState('search'); // 'search' 或 'chat'
  const [selectedBook, setSelectedBook] = useState(null);

  // 買家基本資料 (測試用)
  const currentUser = {
    _id: 'buyer123',
    name: '李同學'
  };

  const handleContactSeller = (book) => {
    setSelectedBook(book);
    setView('chat');
  };

  const handleBackToSearch = () => {
    setSelectedBook(null); // 清除暫存
    setView('search');
  };

  return (
    <div className="app-harness">
      <nav className="nav-navigation-tabs">
        <button 
          className={`nav-tab-btn ${view === 'search' ? 'active' : ''}`}
          onClick={handleBackToSearch}
        >
          🔍 書籍搜尋市集
        </button>
        <button 
          className={`nav-tab-btn ${view === 'chat' ? 'active' : ''}`}
          onClick={() => setView('chat')}
        >
          💬 即時聊聊房
        </button>
      </nav>

      <main className="app-view-container">
        {view === 'search' ? (
          <SearchPage onContactSeller={handleContactSeller} />
        ) : (
          <ChatWindow 
            activeBookToChat={selectedBook} 
            currentUser={currentUser}
            onBackToSearch={handleBackToSearch} 
          />
        )}
      </main>

      <style jsx="true">{`
        .app-harness {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .nav-navigation-tabs {
          display: flex;
          justify-content: center;
          gap: 16px;
          padding: 12px;
          background: #131a26;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-tab-btn {
          background: transparent;
          color: #94a3b8;
          border: 1px solid transparent;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .nav-tab-btn:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.04);
        }
        .nav-tab-btn.active {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .app-view-container {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
