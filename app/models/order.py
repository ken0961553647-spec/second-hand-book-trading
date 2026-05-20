import sqlite3
from datetime import datetime
import os

# 確保對應到正確的資料庫路徑
DB_PATH = os.path.join(os.path.dirname(__file__), '../../instance/database.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class OrderModel:
    @staticmethod
    def create(book_id, buyer_id, seller_id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO orders (book_id, buyer_id, seller_id, status, created_at, updated_at)
            VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ''', (book_id, buyer_id, seller_id))
        order_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return order_id

    @staticmethod
    def get_by_id(order_id):
        conn = get_db_connection()
        order = conn.execute('SELECT * FROM orders WHERE id = ?', (order_id,)).fetchone()
        conn.close()
        return dict(order) if order else None

    @staticmethod
    def get_user_orders(user_id):
        """獲取該使用者買或賣的所有訂單"""
        conn = get_db_connection()
        orders = conn.execute('''
            SELECT * FROM orders 
            WHERE buyer_id = ? OR seller_id = ?
            ORDER BY updated_at DESC
        ''', (user_id, user_id)).fetchall()
        conn.close()
        return [dict(o) for o in orders]

    @staticmethod
    def update_status(order_id, new_status):
        """更新訂單狀態 (pending, accepted, completed, cancelled)"""
        conn = get_db_connection()
        conn.execute('''
            UPDATE orders 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ''', (new_status, order_id))
        conn.commit()
        conn.close()

    @staticmethod
    def update_meet_info(order_id, location, time):
        """更新面交地點與時間"""
        conn = get_db_connection()
        conn.execute('''
            UPDATE orders 
            SET meet_location = ?, meet_time = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ''', (location, time, order_id))
        conn.commit()
        conn.close()


class OrderMessageModel:
    @staticmethod
    def create(order_id, sender_id, content):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO order_messages (order_id, sender_id, content, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', (order_id, sender_id, content))
        message_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return message_id

    @staticmethod
    def get_by_order(order_id):
        """獲取某筆訂單的所有留言"""
        conn = get_db_connection()
        messages = conn.execute('''
            SELECT * FROM order_messages 
            WHERE order_id = ?
            ORDER BY created_at ASC
        ''', (order_id,)).fetchall()
        conn.close()
        return [dict(m) for m in messages]
