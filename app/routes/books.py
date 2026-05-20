"""
Books Routes — 書籍相關的路由（Controller）

使用 Flask Blueprint 組織路由，處理書籍的 CRUD 操作。
"""

import os
from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from werkzeug.utils import secure_filename
from app.models import book as book_model

books_bp = Blueprint('books', __name__, url_prefix='/books')

# 允許上傳的圖片格式
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    """檢查檔案是否為允許的圖片格式。"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@books_bp.route('/')
def index():
    """書籍列表頁 — 顯示所有上架書籍。"""
    try:
        books = book_model.get_all()
    except Exception as e:
        flash(f'載入書籍列表失敗：{e}', 'danger')
        books = []
    return render_template('books/index.html', books=books)


@books_bp.route('/new')
def new():
    """上架表單頁 — 顯示新增書籍的表單。"""
    return render_template('books/new.html')


@books_bp.route('/', methods=['POST'])
def create():
    """建立書籍 — 接收表單資料，存入資料庫。"""
    # 取得表單資料
    title = request.form.get('title', '').strip()
    author = request.form.get('author', '').strip()
    isbn = request.form.get('isbn', '').strip()
    original_price = request.form.get('original_price', '').strip()
    selling_price = request.form.get('selling_price', '').strip()
    condition = request.form.get('condition', '良好')
    category = request.form.get('category', '其他')
    description = request.form.get('description', '').strip()

    # 基本驗證
    errors = []
    if not title:
        errors.append('書名為必填欄位')
    if not author:
        errors.append('作者為必填欄位')
    if not selling_price:
        errors.append('售價為必填欄位')
    else:
        try:
            selling_price = float(selling_price)
            if selling_price < 0:
                errors.append('售價不能為負數')
        except ValueError:
            errors.append('售價必須為數字')

    # 處理原價
    if original_price:
        try:
            original_price = float(original_price)
            if original_price < 0:
                errors.append('原價不能為負數')
        except ValueError:
            errors.append('原價必須為數字')
    else:
        original_price = None

    # 處理圖片上傳
    image_filename = None
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # 加上時間戳避免檔名衝突
            import time
            name, ext = os.path.splitext(filename)
            filename = f"{name}_{int(time.time())}{ext}"
            upload_folder = os.path.join(current_app.static_folder, 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file.save(os.path.join(upload_folder, filename))
            image_filename = filename
        elif file and file.filename and not allowed_file(file.filename):
            errors.append('圖片格式不支援，請上傳 PNG、JPG、GIF 或 WebP')

    if errors:
        for error in errors:
            flash(error, 'danger')
        return render_template('books/new.html',
                               form_data=request.form), 422

    # 存入資料庫
    try:
        data = {
            'title': title,
            'author': author,
            'isbn': isbn or None,
            'original_price': original_price,
            'selling_price': selling_price,
            'condition': condition,
            'category': category,
            'description': description or None,
            'image_filename': image_filename,
        }
        book_model.create(data)
        flash('書籍上架成功！', 'success')
        return redirect(url_for('books.index'))
    except Exception as e:
        flash(f'上架失敗：{e}', 'danger')
        return render_template('books/new.html',
                               form_data=request.form), 500


@books_bp.route('/<int:book_id>')
def detail(book_id):
    """書籍詳情頁 — 顯示單筆書籍的完整資訊。"""
    try:
        book = book_model.get_by_id(book_id)
    except Exception as e:
        flash(f'載入書籍失敗：{e}', 'danger')
        return redirect(url_for('books.index'))

    if book is None:
        flash('找不到該書籍', 'warning')
        return redirect(url_for('books.index'))
    return render_template('books/detail.html', book=book)


@books_bp.route('/<int:book_id>/edit')
def edit(book_id):
    """編輯表單頁 — 顯示編輯書籍的表單。"""
    try:
        book = book_model.get_by_id(book_id)
    except Exception as e:
        flash(f'載入書籍失敗：{e}', 'danger')
        return redirect(url_for('books.index'))

    if book is None:
        flash('找不到該書籍', 'warning')
        return redirect(url_for('books.index'))
    return render_template('books/edit.html', book=book)


@books_bp.route('/<int:book_id>/update', methods=['POST'])
def update(book_id):
    """更新書籍 — 接收表單資料，更新資料庫。"""
    # 先確認書籍存在
    try:
        existing_book = book_model.get_by_id(book_id)
    except Exception as e:
        flash(f'載入書籍失敗：{e}', 'danger')
        return redirect(url_for('books.index'))

    if existing_book is None:
        flash('找不到該書籍', 'warning')
        return redirect(url_for('books.index'))

    # 取得表單資料
    title = request.form.get('title', '').strip()
    author = request.form.get('author', '').strip()
    isbn = request.form.get('isbn', '').strip()
    original_price = request.form.get('original_price', '').strip()
    selling_price = request.form.get('selling_price', '').strip()
    condition = request.form.get('condition', '良好')
    category = request.form.get('category', '其他')
    description = request.form.get('description', '').strip()

    # 基本驗證
    errors = []
    if not title:
        errors.append('書名為必填欄位')
    if not author:
        errors.append('作者為必填欄位')
    if not selling_price:
        errors.append('售價為必填欄位')
    else:
        try:
            selling_price = float(selling_price)
            if selling_price < 0:
                errors.append('售價不能為負數')
        except ValueError:
            errors.append('售價必須為數字')

    if original_price:
        try:
            original_price = float(original_price)
            if original_price < 0:
                errors.append('原價不能為負數')
        except ValueError:
            errors.append('原價必須為數字')
    else:
        original_price = None

    # 處理圖片上傳
    image_filename = existing_book['image_filename']  # 保留原圖
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            import time
            name, ext = os.path.splitext(filename)
            filename = f"{name}_{int(time.time())}{ext}"
            upload_folder = os.path.join(current_app.static_folder, 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file.save(os.path.join(upload_folder, filename))
            # 刪除舊圖片
            if existing_book['image_filename']:
                old_path = os.path.join(upload_folder, existing_book['image_filename'])
                if os.path.exists(old_path):
                    os.remove(old_path)
            image_filename = filename
        elif file and file.filename and not allowed_file(file.filename):
            errors.append('圖片格式不支援，請上傳 PNG、JPG、GIF 或 WebP')

    if errors:
        for error in errors:
            flash(error, 'danger')
        return render_template('books/edit.html', book=existing_book), 422

    # 更新資料庫
    try:
        data = {
            'title': title,
            'author': author,
            'isbn': isbn or None,
            'original_price': original_price,
            'selling_price': selling_price,
            'condition': condition,
            'category': category,
            'description': description or None,
            'image_filename': image_filename,
        }
        book_model.update(book_id, data)
        flash('書籍更新成功！', 'success')
        return redirect(url_for('books.detail', book_id=book_id))
    except Exception as e:
        flash(f'更新失敗：{e}', 'danger')
        return render_template('books/edit.html', book=existing_book), 500


@books_bp.route('/<int:book_id>/delete', methods=['POST'])
def delete(book_id):
    """刪除書籍 — 從資料庫移除書籍記錄。"""
    try:
        existing_book = book_model.get_by_id(book_id)
        if existing_book is None:
            flash('找不到該書籍', 'warning')
            return redirect(url_for('books.index'))

        # 刪除圖片檔案
        if existing_book['image_filename']:
            upload_folder = os.path.join(current_app.static_folder, 'uploads')
            image_path = os.path.join(upload_folder, existing_book['image_filename'])
            if os.path.exists(image_path):
                os.remove(image_path)

        book_model.delete(book_id)
        flash('書籍已刪除', 'success')
    except Exception as e:
        flash(f'刪除失敗：{e}', 'danger')
    return redirect(url_for('books.index'))
