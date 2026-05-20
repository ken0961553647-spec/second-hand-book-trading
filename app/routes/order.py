from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.models.order import OrderModel, OrderMessageModel
import sqlite3
import os

order_bp = Blueprint('order', __name__)

# 測試用：因為還沒有登入系統，我們先假設當前登入的使用者是 user_id = 1 (也就是你)
CURRENT_USER_ID = 1

def get_db_connection():
    # 臨時在 route 裡抓額外資訊用 (例如書名、使用者名字)
    DB_PATH = os.path.join(os.path.dirname(__file__), '../../instance/database.db')
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@order_bp.route('/')
def index():
    return redirect(url_for('order.order_list'))

@order_bp.route('/orders')
def order_list():
    orders = OrderModel.get_user_orders(CURRENT_USER_ID)
    
    # 為了顯示書名跟對方的名字，我們在 view 層面做一下資料合併
    conn = get_db_connection()
    enriched_orders = []
    for o in orders:
        book = conn.execute('SELECT title FROM books WHERE id = ?', (o['book_id'],)).fetchone()
        buyer = conn.execute('SELECT name FROM users WHERE id = ?', (o['buyer_id'],)).fetchone()
        seller = conn.execute('SELECT name FROM users WHERE id = ?', (o['seller_id'],)).fetchone()
        
        o_dict = dict(o)
        o_dict['book_title'] = book['title'] if book else '未知書籍'
        o_dict['buyer_name'] = buyer['name'] if buyer else '未知'
        o_dict['seller_name'] = seller['name'] if seller else '未知'
        
        # 判斷我是買家還是賣家
        o_dict['role'] = '買家' if o['buyer_id'] == CURRENT_USER_ID else '賣家'
        o_dict['other_party'] = o_dict['seller_name'] if o['buyer_id'] == CURRENT_USER_ID else o_dict['buyer_name']
        
        enriched_orders.append(o_dict)
    conn.close()
    
    return render_template('orders/list.html', orders=enriched_orders, current_user_id=CURRENT_USER_ID)

@order_bp.route('/order/<int:order_id>')
def order_detail(order_id):
    order = OrderModel.get_by_id(order_id)
    if not order:
        flash('找不到該筆訂單', 'danger')
        return redirect(url_for('order.order_list'))
        
    messages = OrderMessageModel.get_by_order(order_id)
    
    # 抓取詳細資訊
    conn = get_db_connection()
    book = conn.execute('SELECT title, price FROM books WHERE id = ?', (order['book_id'],)).fetchone()
    buyer = conn.execute('SELECT name FROM users WHERE id = ?', (order['buyer_id'],)).fetchone()
    seller = conn.execute('SELECT name FROM users WHERE id = ?', (order['seller_id'],)).fetchone()
    
    # 把留言者的名字也抓出來
    enriched_messages = []
    for m in messages:
        sender = conn.execute('SELECT name FROM users WHERE id = ?', (m['sender_id'],)).fetchone()
        m_dict = dict(m)
        m_dict['sender_name'] = sender['name'] if sender else '未知'
        m_dict['is_mine'] = (m['sender_id'] == CURRENT_USER_ID)
        enriched_messages.append(m_dict)
        
    conn.close()
    
    o_dict = dict(order)
    o_dict['book_title'] = book['title']
    o_dict['book_price'] = book['price']
    o_dict['buyer_name'] = buyer['name']
    o_dict['seller_name'] = seller['name']
    o_dict['is_buyer'] = (order['buyer_id'] == CURRENT_USER_ID)
    
    return render_template('orders/detail.html', order=o_dict, messages=enriched_messages)

@order_bp.route('/order/<int:order_id>/status', methods=['POST'])
def update_status(order_id):
    new_status = request.form.get('status')
    valid_statuses = ['pending', 'accepted', 'completed', 'cancelled']
    if new_status in valid_statuses:
        OrderModel.update_status(order_id, new_status)
        flash('訂單狀態已更新！', 'success')
    return redirect(url_for('order.order_detail', order_id=order_id))

@order_bp.route('/order/<int:order_id>/message', methods=['POST'])
def add_message(order_id):
    content = request.form.get('content')
    if content and content.strip():
        OrderMessageModel.create(order_id, CURRENT_USER_ID, content.strip())
    return redirect(url_for('order.order_detail', order_id=order_id))
