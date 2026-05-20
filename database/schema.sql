-- 二手書交易平台 — 資料庫 Schema
-- 使用 SQLite

CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,                              -- 書名
    author TEXT NOT NULL,                              -- 作者
    isbn TEXT,                                         -- ISBN
    original_price REAL,                               -- 原價
    selling_price REAL NOT NULL,                       -- 售價
    condition TEXT NOT NULL DEFAULT '良好',             -- 書況：全新/近全新/良好/普通
    category TEXT NOT NULL DEFAULT '其他',              -- 分類：教科書/小說/參考書/漫畫/其他
    description TEXT,                                  -- 描述
    image_filename TEXT,                               -- 封面圖片檔名
    status TEXT NOT NULL DEFAULT 'available',           -- 狀態：available/sold
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),  -- 上架時間
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))   -- 更新時間
);
