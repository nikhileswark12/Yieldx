import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend_app import create_app, bootstrap_crops
from models import db, Crop

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        bootstrap_crops(db, Crop)
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()
