from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import Customer, Bill

billing_bp = Blueprint("billing", __name__)

#  Get all bills (paid and unpaid)
@billing_bp.route("/bills/", methods=["GET"])
# @jwt_required()
def list_bills():
    bills = Bill.query.all()

    return jsonify([
        {
            "id": b.id,
            "customer": b.customer.name if b.customer else "Unknown",
            "amount_due": float(b.amount_due),
            "status": b.status,
            "billing_start": b.billing_start.isoformat() if b.billing_start else None,
            "billing_end": b.billing_end.isoformat() if b.billing_end else None
        }
        for b in bills
    ]), 200


#  Get a specific bill by ID
@billing_bp.route("/bills/<int:bill_id>", methods=["GET"])
# @jwt_required()
def get_bill(bill_id):
    bill = Bill.query.get(bill_id)
    if not bill:
        return jsonify({"error": "Bill not found"}), 404

    data = {
        "id": bill.id,
        "customer": bill.customer.name if bill.customer else "Unknown",
        "amount_due": float(bill.amount_due),
        "status": bill.status,
        "billing_start": bill.billing_start.isoformat() if bill.billing_start else None,
        "billing_end": bill.billing_end.isoformat() if bill.billing_end else None
    }
    return jsonify(data), 200


# ✅ Get all customers
@billing_bp.route("/customers", methods=["GET"])
@jwt_required()
def list_customers():
    customers = Customer.query.all()
    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "account_no": c.account_no
        }
        for c in customers
    ]), 200
