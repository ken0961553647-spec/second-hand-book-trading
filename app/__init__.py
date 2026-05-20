from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your-secret-key-here'

    # 註冊 Blueprints
    from app.routes.order import order_bp
    app.register_blueprint(order_bp)

    return app
