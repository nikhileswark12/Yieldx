from backend_app import create_app
from models import User
from werkzeug.security import check_password_hash

app = create_app('development')
with app.app_context():
    user = User.query.filter_by(email="yieldx@test.com").first()
    if not user:
        print("User not found.")
    else:
        print("User found.")
        print("Checking password yieldx@123:", check_password_hash(user.password_hash, "yieldx@123"))
        print("Stored hash length:", len(user.password_hash))
        print("Stored hash:", user.password_hash)
