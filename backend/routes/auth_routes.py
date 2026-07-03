from flask import Blueprint, request, jsonify
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend_app import limiter

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"message": "Missing required fields"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400

    if len(data['password']) < 8:
        return jsonify({"message": "Password must be at least 8 characters long"}), 400

    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    
    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_password
    )
    
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))
    
    return jsonify({
        "message": "User created successfully",
        "access_token": access_token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Missing required fields"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"message": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "address_line": user.address_line,
        "state": user.state,
        "district": user.district,
        "profile_pic": user.profile_pic,
        "farm_size": user.farm_size,
        "farming_experience": user.farming_experience,
        "preferred_crops": user.preferred_crops
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    data = request.get_json()
    user.name = data.get('name', user.name)
    user.phone = data.get('phone', user.phone)
    user.address_line = data.get('address_line', user.address_line)
    user.state = data.get('state', user.state)
    user.district = data.get('district', user.district)
    
    if 'profile_pic' in data:
        user.profile_pic = data['profile_pic']
        
    if 'farm_size' in data:
        try:
            user.farm_size = float(data['farm_size']) if data['farm_size'] else None
        except ValueError:
            pass
            
    if 'farming_experience' in data:
        try:
            user.farming_experience = int(data['farming_experience']) if data['farming_experience'] else None
        except ValueError:
            pass
            
    if 'preferred_crops' in data:
        user.preferred_crops = data['preferred_crops']
        
    db.session.commit()
    
    return jsonify({"message": "Profile updated successfully"}), 200

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()
    
    if not check_password_hash(user.password_hash, data.get('old_password')):
        return jsonify({"message": "Invalid old password"}), 400
        
    user.password_hash = generate_password_hash(data['new_password'], method='pbkdf2:sha256')
    db.session.commit()
    return jsonify({"message": "Password changed successfully"}), 200
