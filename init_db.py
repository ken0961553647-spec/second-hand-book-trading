from app import create_app, db
from app.models.book import Book

app = create_app()

def seed_data():
    with app.app_context():
        # 建立所有資料表
        db.create_all()
        
        # 檢查是否已有資料
        if Book.query.first():
            print("資料庫已有資料，跳過初始化。")
            return

        books_data = [
            Book(title="Python 學習手冊", author="Mark Lutz", price=850, description="九成新，書況良好，無劃線。"),
            Book(title="深入淺出設計模式", author="Eric Freeman", price=600, description="經典好書，保存良好。"),
            Book(title="微積分：早期超越函數", author="James Stewart", price=1200, description="大學微積分用書，書角有微凹折。", status="available"),
            Book(title="哈利波特：神秘的魔法石", author="J.K. 羅琳", price=250, description="年代久遠有泛黃，但字跡清楚。"),
            Book(title="Clean Code 無瑕的程式碼", author="Robert C. Martin", price=550, description="非常推薦工程師閱讀，已看過兩次。", status="sold"),
            Book(title="原子習慣", author="James Clear", price=280, description="提升生產力的好書。")
        ]

        db.session.bulk_save_objects(books_data)
        db.session.commit()
        print("測試資料建立完成！")

if __name__ == '__main__':
    seed_data()
