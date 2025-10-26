from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import BillingSetting

billing_settings_bp = Blueprint("billing_settings", __name__)

# --- GET current billing settings ---
@billing_settings_bp.route("/", methods=["GET"])
# @jwt_required()
def get_settings():
    setting = BillingSetting.query.first()
    if not setting:
        # Initialize with default values if not set
        setting = BillingSetting()
        db.session.add(setting)
        db.session.commit()
    return jsonify({
        "id": setting.id,
        "fixed_charge": float(setting.fixed_charge),
        "rate_per_unit": float(setting.rate_per_unit),
        "updated_at": setting.updated_at
    })


# --- UPDATE billing settings ---
@billing_settings_bp.route("/", methods=["PUT"])
# @jwt_required()
def update_settings():
    data = request.get_json()
    setting = BillingSetting.query.first()
    if not setting:
        setting = BillingSetting()

    setting.fixed_charge = data.get("fixed_charge", setting.fixed_charge)
    setting.rate_per_unit = data.get("rate_per_unit", setting.rate_per_unit)

    db.session.add(setting)
    db.session.commit()

    return jsonify({"message": "Billing settings updated successfully"})
