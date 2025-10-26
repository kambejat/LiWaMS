from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Customer, Meter

customer_bp = Blueprint("customers", __name__)

@customer_bp.route("/", methods=["GET"])
@jwt_required()
def list_customers():    
    customers = Customer.query.all()
    return jsonify([{
        "id": c.id,
        "account_no": c.account_no,
        "name": c.name,
        "address": c.address,
        "phone": c.phone,
        "email": c.email,
        "balance": float(c.balance or 0)
    } for c in customers])

@customer_bp.route("/", methods=["POST"])
@jwt_required()
def create_customer():
    data = request.get_json() or {}

    # Validate required fields
    name = data.get("name")
    if not name or not isinstance(name, str):
        return jsonify({"msg": "Name must be a string"}), 400

    # Auto-generate account number
    last_customer = Customer.query.order_by(Customer.id.desc()).first()
    next_no = int(last_customer.account_no) + 1 if last_customer and last_customer.account_no.isdigit() else 1
    account_no = str(next_no).zfill(7)

    customer = Customer(
        account_no=account_no,
        name=name,
        address=data.get("address"),
        phone=data.get("phone"),
        email=data.get("email"),
        balance=0
    )

    db.session.add(customer)
    db.session.commit()

    return jsonify({
        "message": "Customer added successfully",
        "id": customer.id,
        "account_no": account_no
    }), 201


@customer_bp.route("/search", methods=["GET"])
def search_customers():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify([])

    # Search by name, account number, or meter number
    customers = (
        db.session.query(Customer)
        .outerjoin(Meter)
        .filter(
            (Customer.name.ilike(f"%{query}%")) |
            (Customer.account_no.ilike(f"%{query}%")) |
            (Customer.id.ilike(f"%{query}%")) |
            (Meter.meter_no.ilike(f"%{query}%"))
        )
        .all()
    )

    results = []
    for c in customers:
        results.append({
            "id": c.id,
            "name": c.name,
            "account_no": c.account_no,
            "address": c.address,
            "phone": c.phone,
            "email": c.email,
            "balance": float(c.balance or 0),
            "meters": [m.meter_no for m in c.meters],
        })

    return jsonify(results)
