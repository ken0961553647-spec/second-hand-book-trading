import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// 離線模擬聯絡人與歷史對話
const MOCK_ROOMS = [
  {
    chatRoomId: 'buyer123_seller456_book1',
    opponent: { _id: 'seller456', name: '陳同學', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chen' },
    book: { _id: '1', title: '演算法圖鑑', price: 320 },
    lastMessage: '這本書目前有被劃記過嗎？',
    unread: true,
    history: [
      { sender: 'seller456', content: '您好，這本書目前還在喔！', createdAt: new Date('2026-05-20T10:00:00Z') },
      { sender: 'buyer123', content: '請問這本書目前有被劃記過嗎？', createdAt: new Date('2026-05-20T10:02:00Z') }
    ]
  },
  {
    chatRoomId: 'buyer123_seller789_book3',
    opponent: { _id: 'seller789', name: '張同學', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chang' },
    book: { _id: '3', title: '哈利波特：神秘的魔法石', price: 180 },
    lastMessage: '好的，那我們明天下午兩點在圖書館面交。',
    unread: false,
    history: [
      { sender: 'buyer123', content: '您好，我想買這本哈利波特。可以用面交的嗎？', createdAt: new Date('2026-05-19T08:00:00Z') },
      { sender: 'seller789', content: '可以啊，面交方便！校內都可以。', createdAt: new Date('2026-05-19T08:05:00Z') },
      { sender: 'buyer123', content: '好的，那我們明天下午兩點在圖書館面交。', createdAt: new Date('2026-05-19T08:07:00Z') }
    ]
  }
];

export default function ChatWindow({ activeBookToChat, currentUser = { _id: 'buyer123', name: '我' }, onBackToSearch }) {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  // 1. 初始化 Socket.io 連線
  useEffect(() => {
    // 連線至後端 Socket.io 伺服器
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: false
    });

    socketRef.current.connect();

    socketRef.current.on('connect', () => {
      console.log('即時通訊伺服器連線成功！');
      setIsSocketConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('即時通訊伺服器連線中斷！');
      setIsSocketConnected(false);
    });

    // 監聽接收新訊息事件
    socketRef.current.on('receive_message', (message) => {
      setMessages((prev) => {
        // 防止重複寫入 (若 socket 廣播到發送端自己)
        if (prev.some(m => m._id === message._id || (m.createdAt === message.createdAt && m.content === message.content))) {
          return prev;
        }
        return [...prev, message];
      });
      
      // 更新側邊對話列表中的最後訊息
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.chatRoomId === message.chatRoomId
            ? { ...r, lastMessage: message.content, unread: message.sender !== currentUser._id }
            : r
        )
      );
    });

    // 監聽對方正在輸入的狀態
    socketRef.current.on('user_typing', ({ userId, isTyping }) => {
      if (userId !== currentUser._id) {
        setIsOpponentTyping(isTyping);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // 2. 處理外部傳入要主動私訊的書籍 (由搜尋頁面點擊「私訊買書」觸發)
  useEffect(() => {
    if (activeBookToChat) {
      const roomId = `${currentUser._id}_${activeBookToChat.seller?._id || 'seller_temp'}_${activeBookToChat._id}`;
      const existingRoom = rooms.find(r => r.chatRoomId === roomId);

      if (existingRoom) {
        handleSelectRoom(existingRoom);
      } else {
        // 新增一個暫時的聊天室
        const newRoom = {
          chatRoomId: roomId,
          opponent: {
            _id: activeBookToChat.seller?._id || 'seller_temp',
            name: activeBookToChat.seller?.name || '書籍賣家',
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeBookToChat.seller?.name || 'Seller'}`
          },
          book: {
            _id: activeBookToChat._id,
            title: activeBookToChat.title,
            price: bookPriceFormatter(activeBookToChat.price)
          },
          lastMessage: '您好！我對這本書有興趣。',
          unread: false,
          history: []
        };
        setRooms(prev => [newRoom, ...prev]);
        handleSelectRoom(newRoom);
      }
    } else if (rooms.length > 0 && !activeRoom) {
      handleSelectRoom(rooms[0]); // 預設載入第一個聊天室
    }
  }, [activeBookToChat]);

  // 3. 自動滾動到聊天框最底端
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpponentTyping]);

  // 輔助格式化價格
  const bookPriceFormatter = (price) => {
    return isNaN(price) ? 0 : price;
  };

  // 選擇聊天對話室
  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    setMessages(room.history);
    setIsOpponentTyping(false);

    // 清除未讀狀態
    setRooms(prevRooms =>
      prevRooms.map(r => r.chatRoomId === room.chatRoomId ? { ...r, unread: false } : r)
    );

    // 通知 Socket 加入房間
    if (socketRef.current && isSocketConnected) {
      socketRef.current.emit('join_room', {
        chatRoomId: room.chatRoomId,
        userId: currentUser._id
      });
    }
  };

  // 傳送訊息
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeRoom) return;

    const messageData = {
      chatRoomId: activeRoom.chatRoomId,
      sender: currentUser._id,
      receiver: activeRoom.opponent._id,
      book: activeRoom.book._id,
      content: inputValue.trim(),
      createdAt: new Date()
    };

    if (socketRef.current && isSocketConnected) {
      // 透過 Socket 發送即時訊息給後端
      socketRef.current.emit('send_message', messageData);
    } else {
      console.warn('Socket 伺服器未連線，將模擬傳送訊息（僅本機有效）');
      // 離線模擬本機直接加入
      setMessages(prev => [...prev, messageData]);
      
      // 更新側邊對話列表最後訊息
      setRooms(prevRooms =>
        prevRooms.map(r =>
          r.chatRoomId === activeRoom.chatRoomId
            ? { ...r, lastMessage: messageData.content, history: [...r.history, messageData] }
            : r
        )
      );

      // 模擬對方 1.5 秒後自動回覆 (Demo 特色)
      setTimeout(() => {
        setIsOpponentTyping(true);
        setTimeout(() => {
          setIsOpponentTyping(false);
          const reply = {
            chatRoomId: activeRoom.chatRoomId,
            sender: activeRoom.opponent._id,
            receiver: currentUser._id,
            book: activeRoom.book._id,
            content: `你好，我是${activeRoom.opponent.name}。這本《${activeRoom.book.title}》目前還可以約面交或郵寄喔！`,
            createdAt: new Date()
          };
          setMessages(prev => [...prev, reply]);
          setRooms(prevRooms =>
            prevRooms.map(r =>
              r.chatRoomId === activeRoom.chatRoomId
                ? { ...r, lastMessage: reply.content, history: [...r.history, reply] }
                : r
            )
          );
        }, 1200);
      }, 800);
    }

    setInputValue('');
    
    // 取消輸入狀態
    if (socketRef.current && isSocketConnected) {
      socketRef.current.emit('typing', {
        chatRoomId: activeRoom.chatRoomId,
        userId: currentUser._id,
        isTyping: false
      });
    }
  };

  // 輸入框改變時觸發對方的「輸入狀態提示」
  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    if (socketRef.current && isSocketConnected && activeRoom) {
      const isTyping = e.target.value.length > 0;
      socketRef.current.emit('typing', {
        chatRoomId: activeRoom.chatRoomId,
        userId: currentUser._id,
        isTyping
      });
    }
  };

  return (
    <div className="chat-container">
      {/* 側邊對話清單 */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>💬 即時私訊</h2>
          <button onClick={onBackToSearch} className="back-search-btn">返回市集</button>
        </div>
        <div className="connection-status-badge">
          {isSocketConnected ? (
            <span className="status-online"><span className="status-dot green"></span> 即時連線中</span>
          ) : (
            <span className="status-offline"><span className="status-dot red"></span> 離線展示模式</span>
          )}
        </div>
        <div className="room-list">
          {rooms.map((room) => (
            <div 
              key={room.chatRoomId} 
              onClick={() => handleSelectRoom(room)}
              className={`room-item ${activeRoom?.chatRoomId === room.chatRoomId ? 'active' : ''} ${room.unread ? 'unread' : ''}`}
            >
              <img src={room.opponent.avatar} alt={room.opponent.name} className="room-avatar" />
              <div className="room-details">
                <div className="room-title-row">
                  <span className="opponent-name">{room.opponent.name}</span>
                  {room.unread && <span className="unread-dot"></span>}
                </div>
                <span className="room-book-tag">📖 {room.book.title}</span>
                <p className="room-last-msg">{room.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 右側聊天內容框 */}
      <main className="chat-main">
        {activeRoom ? (
          <>
            {/* 聊天室頂部資訊 */}
            <header className="chat-main-header">
              <div className="chat-header-user">
                <img src={activeRoom.opponent.avatar} alt={activeRoom.opponent.name} className="header-avatar" />
                <div>
                  <h3>{activeRoom.opponent.name}</h3>
                  <span className="header-status">
                    {isSocketConnected ? '線上' : '離線模式模擬'}
                  </span>
                </div>
              </div>
              <div className="chat-header-book-card">
                <span className="header-book-label">詢問書籍：</span>
                <span className="header-book-title">{activeRoom.book.title}</span>
                <span className="header-book-price">${activeRoom.book.price}</span>
              </div>
            </header>

            {/* 訊息對話紀錄區 */}
            <div className="chat-messages-area">
              {messages.length === 0 ? (
                <div className="chat-welcome">
                  <p>開始與 {activeRoom.opponent.name} 的對話吧！</p>
                  <p className="welcome-tip">請注意個人隱私，並建議在校園內公開場所面交書籍。</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender === currentUser._id;
                  return (
                    <div key={index} className={`message-bubble-wrapper ${isMe ? 'me' : 'opponent'}`}>
                      {!isMe && (
                        <img 
                          src={activeRoom.opponent.avatar} 
                          alt={activeRoom.opponent.name} 
                          className="message-avatar" 
                        />
                      )}
                      <div className="message-content-wrapper">
                        <div className="message-bubble">
                          {msg.content}
                        </div>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* 對方輸入中提示 */}
              {isOpponentTyping && (
                <div className="message-bubble-wrapper opponent">
                  <img src={activeRoom.opponent.avatar} alt={activeRoom.opponent.name} className="message-avatar" />
                  <div className="message-content-wrapper">
                    <div className="message-bubble typing">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 訊息發送控制欄 */}
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="輸入訊息..." 
                value={inputValue}
                onChange={handleInputChange}
                className="chat-input-field"
              />
              <button type="submit" className="chat-send-btn" disabled={!inputValue.trim()}>
                傳送
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <span className="no-chat-icon">💬</span>
            <p>請選擇左側對話以開始聊天</p>
          </div>
        )}
      </main>
    </div>
  );
}
