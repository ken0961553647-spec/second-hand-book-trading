# 流程圖設計 (Flowchart) - 訂單管理與追蹤模組

本文件依據 PRD 與系統架構，針對你負責的**「訂單管理與追蹤」**模組進行流程規劃與視覺化。

## 1. 使用者流程圖（User Flow）

我們將從買家與賣家的雙重視角出發，描繪處理一筆訂單時，使用者會經歷的完整生命週期與操作路徑。

```mermaid
flowchart TD
    A([進入我的訂單頁面]) --> B{選擇身分視角}
    
    %% 買家視角
    B -->|身為買家| C[查看「我買的書」列表]
    C --> D[點選特定訂單]
    D --> E{目前訂單狀態？}
    E -->|待賣家確認| F[等待賣家回應或自行取消請求]
    E -->|賣家已接受| G[使用留言板與賣家確認面交細節]
    E -->|面交完成| H[點擊「完成交易」並給予評價]
    
    %% 賣家視角
    B -->|身為賣家| I[查看「我賣的書」被預約列表]
    I --> J[點選特定訂單請求]
    J --> K{目前訂單狀態？}
    K -->|等待我的確認| L{決定是否交易？}
    L -->|接受| M[狀態變更為「進行中」，開啟留言板]
    L -->|拒絕| N[狀態變更為「已取消」]
    K -->|進行中| O[使用留言板與買家確認面交細節]
    K -->|面交完成| P[點擊「完成交易」並給予評價]
```

## 2. 系統序列圖（Sequence Diagram）

此序列圖描述「買家發起購買請求，賣家接受並與買家留言」的系統後端資料互動流程。

```mermaid
sequenceDiagram
    actor Buyer as 買家
    actor Seller as 賣家
    participant Browser as 瀏覽器
    participant Route as Flask Route (Controller)
    participant Model as DB Model
    participant DB as SQLite

    %% 買家發起購買
    Buyer->>Browser: 在書籍頁面點擊「申請購買」
    Browser->>Route: POST /order/create (傳送書籍ID)
    Route->>Model: 建立新訂單實例 (狀態: 待確認)
    Model->>DB: INSERT INTO orders
    DB-->>Model: 新增成功
    Route-->>Browser: 重導向到「我的訂單」頁面

    %% 賣家接受訂單
    Seller->>Browser: 點擊「接受訂單」
    Browser->>Route: POST /order/<id>/status
    Route->>Model: 更新訂單狀態 (狀態: 進行中)
    Model->>DB: UPDATE orders SET status='accepted'
    DB-->>Model: 更新成功
    Route-->>Browser: 重新載入訂單詳情，顯示留言板

    %% 雙方留言溝通
    Buyer->>Browser: 在留言板輸入訊息並送出
    Browser->>Route: POST /order/<id>/message
    Route->>Model: 建立新留言實例
    Model->>DB: INSERT INTO order_messages
    DB-->>Model: 新增成功
    Route-->>Browser: 重載頁面以顯示最新留言
```

## 3. 功能清單與路由對照表

針對你負責的訂單模組 (`app/routes/order.py`)，以下是預計實作的 API 與頁面路由清單：

| 功能名稱 | URL 路徑 | HTTP 方法 | 說明 |
| --- | --- | --- | --- |
| 訂單列表頁 | `/orders` | GET | 渲染買/賣雙方的所有訂單列表 |
| 建立訂單請求 | `/order/create` | POST | 買家在書籍頁面點擊購買時觸發，建立訂單 |
| 訂單詳情頁 | `/order/<int:order_id>` | GET | 渲染單筆訂單的詳細資訊（含留言板） |
| 更新訂單狀態 | `/order/<int:order_id>/status` | POST | 賣家更改訂單狀態 (接受/拒絕)，或買賣雙方標記交易完成 |
| 新增留言 | `/order/<int:order_id>/message` | POST | 於特定訂單的留言板中新增一則訊息 |
