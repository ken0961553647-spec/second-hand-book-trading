import sqlite3
import os

DB_DIR = 'instance'
DB_PATH = os.path.join(DB_DIR, 'database.db')
SCHEMA_PATH = 'database/schema.sql'

if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR)

print("正在初始化資料庫...")
conn = sqlite3.connect(DB_PATH)

# 讀取並執行 Schema
with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
    conn.executescript(f.read())

# 插入假資料
cursor = conn.cursor()

# 檢查是否已經有資料，避免重複插入
cursor.execute("SELECT COUNT(*) FROM users")
if cursor.fetchone()[0] == 0:
    print("正在插入假資料...")
    # 建立三個使用者
    cursor.execute("INSERT INTO users (name, email) VALUES ('楊啟源 (測試帳號)', 'me@edu.tw')")
    cursor.execute("INSERT INTO users (name, email) VALUES ('賣家小明', 'seller@edu.tw')")
    cursor.execute("INSERT INTO users (name, email) VALUES ('買家小華', 'buyer@edu.tw')")
    
    # 建立書籍
    cursor.execute("INSERT INTO books (title, price, owner_id) VALUES ('計算機概論 (二手 9成新)', 500, 2)")
    cursor.execute("INSERT INTO books (title, price, owner_id) VALUES ('微積分原文書 (第七版)', 850, 1)")
    cursor.execute("INSERT INTO books (title, price, owner_id) VALUES ('線性代數', 400, 3)")
    
    # 建立訂單 (我跟小明買書 - 我是買家)
    cursor.execute('''
        INSERT INTO orders (book_id, buyer_id, seller_id, status)
        VALUES (1, 1, 2, 'accepted')
    ''')
    order1_id = cursor.lastrowid
    
    # 建立訂單 (小華跟我買書 - 我是賣家)
    cursor.execute('''
        INSERT INTO orders (book_id, buyer_id, seller_id, status)
        VALUES (2, 3, 1, 'pending')
    ''')
    order2_id = cursor.lastrowid
    
    # 插入第一筆訂單的留言
    cursor.execute("INSERT INTO order_messages (order_id, sender_id, content) VALUES (?, ?, '您好，請問這本書還有嗎？我這學期修計概很需要！')", (order1_id, 1))
    cursor.execute("INSERT INTO order_messages (order_id, sender_id, content) VALUES (?, ?, '有的！可以直接約在總圖書館門口面交喔！')", (order1_id, 2))
    cursor.execute("INSERT INTO order_messages (order_id, sender_id, content) VALUES (?, ?, '太好了，那明天下午兩點可以嗎？')", (order1_id, 1))
    
    conn.commit()
    print("✅ 假資料插入完成！")
else:
    print("✅ 資料庫已有資料，跳過假資料插入。")

conn.close()
print("--------------------------------------------------")
print(f"資料庫建立於: {DB_PATH}")
print("恭喜！準備工作完成，請在終端機輸入以下指令啟動網站：")
print("flask run")
print("然後開啟瀏覽器進入 http://127.0.0.1:5000/orders 查看你的成果！")
print("--------------------------------------------------")
