from flask import Blueprint, request, render_template
from app.models.book import Book

search_bp = Blueprint('search', __name__)

@search_bp.route('/search')
def search():
    query = request.args.get('q', '').strip()
    if query:
        # 搜尋書名或作者中包含關鍵字的書籍
        search_term = f"%{query}%"
        books = Book.query.filter(
            (Book.title.like(search_term)) | (Book.author.like(search_term))
        ).all()
    else:
        books = []

    return render_template('search.html', books=books, query=query)
