from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Meter, Customer

meter_bp = Blueprint("meters", __name__)

@meter_bp.route("/", methods=["POST"])
@jwt_required()
def add_meter():
    data = request.get_json()
    meter_no = data.get("meter_no")
    customer_id = data.get("customer_id")
    installed_at = data.get("installed_at")
    status = data.get("status")

    if not all([meter_no, customer_id, status]):
        return jsonify({"error": "Missing required fields"}), 422

    #  Convert installed_at string to Python date
    try:
        installed_at_date = datetime.strptime(installed_at, "%Y-%m-%d").date() if installed_at else None
    except ValueError:
        return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 422

    # Validate customer existence
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 422

    # Create and save meter
    new_meter = Meter(
        meter_no=meter_no,
        customer_id=int(customer_id),  # ensure it's int
        installed_at=installed_at_date,
        status=status
    )

    db.session.add(new_meter)
    db.session.commit()

    return jsonify({"message": "Meter added successfully"}), 201

@meter_bp.route("/", methods=["GET"])
# @jwt_required()
def list_meters(): 
    meters = Meter.query.all()
    return jsonify([{
        "id": m.id,
        "meter_no": m.meter_no,
        "customer_id": m.customer_id,
        "status": m.status,
        "installed_at": m.installed_at
    } for m in meters])

@meter_bp.route("/search", methods=["GET"])
def search_meters():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify([])

    meters = (
        Meter.query.filter(Meter.meter_no.ilike(f"%{query}%")).limit(10).all()
    )

    results = [
        {"id": m.id, "meter_no": m.meter_no, "status": m.status}
        for m in meters
    ]

    return jsonify(results)

