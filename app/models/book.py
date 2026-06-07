"""
Book Model — 書籍資料的 CRUD 操作

使用 sqlite3 連接 SQLite 資料庫，提供書籍的新增、查詢、更新、刪除功能。
資料庫路徑：instance/database.db
"""

import sqlite3
import os


def get_db_connection():
    """取得資料庫連線。

    Returns:
        sqlite3.Connection: 資料庫連線物件，row_factory 設為 sqlite3.Row
    """
    # app/models/book.py -> app/models -> app -> project root
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    db_path = os.path.join(base_dir, 'instance', 'database.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def create(data):
    """新增一筆書籍記錄。

    Args:
        data (dict): 書籍資料，包含 title, author, isbn, original_price,
                     selling_price, condition, category, description, image_filename

    Returns:
        int: 新增書籍的 id

    Raises:
        Exception: 資料庫操作失敗時拋出例外
    """
    try:
        conn = get_db_connection()
        cursor = conn.execute(
            '''INSERT INTO books (title, author, isbn, original_price, selling_price,
               condition, category, description, image_filename)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                data.get('title'),
                data.get('author'),
                data.get('isbn'),
                data.get('original_price'),
                data.get('selling_price'),
                data.get('condition', '良好'),
                data.get('category', '其他'),
                data.get('description'),
                data.get('image_filename'),
            )
        )
        conn.commit()
        book_id = cursor.lastrowid
        conn.close()
        return book_id
    except Exception as e:
        raise Exception(f'新增書籍失敗：{e}')


def get_all():
    """取得所有書籍記錄，按上架時間由新到舊排序。

    Returns:
        list[sqlite3.Row]: 所有書籍記錄的列表
    """
    try:
        conn = get_db_connection()
        books = conn.execute(
            'SELECT * FROM books ORDER BY created_at DESC'
        ).fetchall()
        conn.close()
        return books
    except Exception as e:
        raise Exception(f'取得書籍列表失敗：{e}')


def get_by_id(book_id):
    """取得單筆書籍記錄。

    Args:
        book_id (int): 書籍 id

    Returns:
        sqlite3.Row or None: 書籍記錄，找不到時回傳 None
    """
    try:
        conn = get_db_connection()
        book = conn.execute(
            'SELECT * FROM books WHERE id = ?', (book_id,)
        ).fetchone()
        conn.close()
        return book
    except Exception as e:
        raise Exception(f'取得書籍失敗：{e}')


def update(book_id, data):
    """更新書籍記錄。

    Args:
        book_id (int): 書籍 id
        data (dict): 要更新的書籍資料

    Returns:
        bool: 更新成功回傳 True
    """
    try:
        conn = get_db_connection()
        conn.execute(
            '''UPDATE books SET title = ?, author = ?, isbn = ?, original_price = ?,
               selling_price = ?, condition = ?, category = ?, description = ?,
               image_filename = ?, updated_at = datetime('now', 'localtime')
               WHERE id = ?''',
            (
                data.get('title'),
                data.get('author'),
                data.get('isbn'),
                data.get('original_price'),
                data.get('selling_price'),
                data.get('condition'),
                data.get('category'),
                data.get('description'),
                data.get('image_filename'),
                book_id,
            )
        )
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        raise Exception(f'更新書籍失敗：{e}')


def delete(book_id):
    """刪除書籍記錄。

    Args:
        book_id (int): 書籍 id

    Returns:
        bool: 刪除成功回傳 True
    """
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM books WHERE id = ?', (book_id,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        raise Exception(f'刪除書籍失敗：{e}')
