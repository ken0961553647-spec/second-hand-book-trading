# 系統架構設計 (Architecture)

本文件依據 PRD 所列之功能需求，規劃「校園二手書交易平台」的系統架構，並特別針對**訂單管理與追蹤**模組進行設計。

## 1. 技術架構說明

本專案採用**傳統的伺服器渲染 (Server-Side Rendering)** 架構，並非前後端分離。
- **後端與路由控制 (Controller)**：使用 Python + Flask。負責處理商業邏輯、資料庫互動與表單驗證。
- **前端樣板渲染 (View)**：使用 Jinja2 模板引擎。由 Flask 將資料傳遞給 Jinja2 渲染成完整的 HTML 後再回傳給瀏覽器。
- **資料庫 (Model)**：使用 SQLite。適合中小型專案，輕量且不需額外架設伺服器。

## 2. 專案資料夾結構

```text
second-hand-book-trading/
│
├── app/                        # 應用程式主目錄
│   ├── __init__.py             # Flask app 初始化設定
│   │
│   ├── models/                 # 資料庫模型 (Model)
│   │   ├── __init__.py
│   │   ├── user.py             # 使用者模型
│   │   ├── book.py             # 書籍模型
│   │   └── order.py            # 訂單模型 (⭐ 你的負責項目)
│   │
│   ├── routes/                 # 路由與商業邏輯 (Controller)
│   │   ├── __init__.py
│   │   ├── auth.py             # 登入註冊路由
│   │   ├── book.py             # 書籍上架與搜尋路由
│   │   └── order.py            # 訂單管理與追蹤路由 (⭐ 你的負責項目)
│   │
│   ├── templates/              # HTML 樣板 (View)
│   │   ├── base.html           # 共同版型 (導覽列、頁尾)
│   │   └── orders/             # 訂單相關頁面 (⭐ 你的負責項目)
│   │       ├── list.html       # 買/賣雙方訂單列表 (管理後台)
│   │       ├── detail.html     # 單筆訂單詳情 (狀態、面交資訊)
│   │       └── chat.html       # 訂單內的即時通訊/留言板
│   │
│   └── static/                 # 靜態資源
│       ├── css/style.css
│       └── js/main.js
│
├── instance/
│   └── database.db             # SQLite 資料庫檔案
│
├── docs/                       # 開發文件 (PRD, 架構等)
│
├── requirements.txt            # Python 套件相依清單
└── run.py                      # 系統啟動入口
```

## 3. 元件關係圖

```mermaid
flowchart LR
    Browser[瀏覽器 (Client)] <-->|HTTP 請求/回應| Route[Flask Route\n(Controller)]
    
    subgraph Server [Flask 伺服器]
        Route <-->|操作資料| Model[DB Model\n(SQLite)]
        Route -->|傳遞變數| View[Jinja2 Template\n(View)]
    end
    
    View -.->|渲染 HTML| Browser
```

### 針對「訂單管理與追蹤」的運作範例：
1. 使用者在瀏覽器點擊「我的訂單」。
2. `routes/order.py` 收到請求，從 Session 取得使用者 ID。
3. `routes/order.py` 向 `models/order.py` 查詢該使用者的所有進行中與歷史訂單。
4. 資料庫回傳訂單資料。
5. `routes/order.py` 將資料傳入 `templates/orders/list.html` 進行渲染。
6. Jinja2 產生完整的 HTML 回傳給瀏覽器顯示。

## 4. 關鍵設計決策

1. **模組化路由 (Blueprints)**：為了避免所有路由都寫在同一個檔案導致混亂，將功能拆分為 `auth`, `book`, `order` 等模組。這非常適合團隊分工，你可以專注開發 `routes/order.py` 而不會與其他人衝突。
2. **Server-Side Rendering (SSR)**：採用 Jinja2 渲染 HTML，降低了前後端分離所需的 API 溝通成本，適合課堂專題快速開發與展示。
3. **SQLite 作為主要資料庫**：專題展示的情境下，SQLite 只需要一個 `database.db` 檔案，不需要額外設定 MySQL/PostgreSQL 伺服器，讓團隊每個人 clone 專案後都能立刻執行。
