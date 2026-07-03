from flask import Blueprint, jsonify
from models import Crop

crops_bp = Blueprint('crops', __name__)

@crops_bp.route('/', methods=['GET'])
def get_crops():
    try:
        crops = Crop.query.all()
        data = [{
            "id": c.id,
            "name": c.name,
            "season": c.season,
            "min_ph": c.min_ph,
            "max_ph": c.max_ph,
            "soil_type": c.soil_type
        } for c in crops]
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@crops_bp.route('/<int:id>', methods=['GET'])
def get_crop(id):
    try:
        c = Crop.query.get(id)
        if not c:
            return jsonify({"message": "Crop not found"}), 404
        return jsonify({
            "id": c.id,
            "name": c.name,
            "season": c.season,
            "min_ph": c.min_ph,
            "max_ph": c.max_ph,
            "soil_type": c.soil_type
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@crops_bp.route('/name/<string:name>', methods=['GET'])
def get_crop_by_name(name):
    try:
        c = Crop.query.filter_by(name=name.lower()).first()
        if not c:
            return jsonify({"message": "Crop not found"}), 404
        return jsonify({
            "id": c.id,
            "name": c.name,
            "season": c.season,
            "min_ph": c.min_ph,
            "max_ph": c.max_ph,
            "soil_type": c.soil_type
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

