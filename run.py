"""
二手書交易平台 — Flask 入口點

初始化 Flask app、註冊 Blueprint、提供資料庫初始化功能。
"""

import os
import sqlite3
from flask import Flask, redirect, url_for


def create_app():
    """建立並設定 Flask 應用程式。"""
    app = Flask(
        __name__,
        static_folder='app/static',
        template_folder='app/templates',
    )

    # 設定
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 最大上傳 16MB

    # 確保 instance 資料夾存在
    instance_path = os.path.join(os.path.dirname(__file__), 'instance')
    os.makedirs(instance_path, exist_ok=True)

    # 確保 uploads 資料夾存在
    upload_folder = os.path.join(os.path.dirname(__file__), 'app', 'static', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)

    # 初始化資料庫
    init_db(app)

    # 註冊 Blueprint
    from app.routes.books import books_bp
    app.register_blueprint(books_bp)

    # 首頁重導向到書籍列表
    @app.route('/')
    def home():
        return redirect(url_for('books.index'))

    return app


def init_db(app=None):
    """初始化資料庫，執行 schema.sql 建立資料表。"""
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'database.db')
    schema_path = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')

    conn = sqlite3.connect(db_path)
    with open(schema_path, 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    conn.close()
    print(f'[OK] Database initialized: {db_path}')


# 建立 app 實例供 flask run 使用
app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
