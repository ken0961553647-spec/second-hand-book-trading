"""
二手書交易平台 — 啟動腳本

使用方式：
    python run.py
    或
    flask run
"""

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
