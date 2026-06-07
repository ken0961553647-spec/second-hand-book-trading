"""
二手書交易平台 — Flask App Package

提供 create_app factory 函式，讓 flask run 可以自動偵測。
"""

import os
import sqlite3
from flask import Flask, redirect, url_for


def create_app():
    """建立並設定 Flask 應用程式。"""
    # 專案根目錄（app/ 的上層）
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    app = Flask(
        __name__,
        static_folder='static',
        template_folder='templates',
    )

    # 設定
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 最大上傳 16MB
    app.config['BASE_DIR'] = base_dir

    # 確保 instance 資料夾存在
    instance_path = os.path.join(base_dir, 'instance')
    os.makedirs(instance_path, exist_ok=True)

    # 確保 uploads 資料夾存在
    upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)

    # 初始化資料庫
    _init_db(base_dir)

    # 註冊 Blueprint
    from app.routes.books import books_bp
    app.register_blueprint(books_bp)

    # 首頁重導向到書籍列表
    @app.route('/')
    def home():
        return redirect(url_for('books.index'))

    return app


def _init_db(base_dir):
    """初始化資料庫，執行 schema.sql 建立資料表。"""
    db_path = os.path.join(base_dir, 'instance', 'database.db')
    schema_path = os.path.join(base_dir, 'database', 'schema.sql')

    conn = sqlite3.connect(db_path)
    with open(schema_path, 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    conn.close()
