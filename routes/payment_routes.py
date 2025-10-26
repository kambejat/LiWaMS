from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Payment, Bill, Receipt, Customer, User
from datetime import datetime
from decimal import Decimal
import uuid

payment_bp = Blueprint("payments", __name__)

@payment_bp.route("/", methods=["POST"])
# @jwt_required()
def make_payment():
    data = request.get_json()
    bill_id = data.get("bill_id")
    amount = data.get("amount")
    method = data.get("method", "Cash")
    reference = data.get("reference")  # optional
    username = data.get("username")

    if not bill_id or not amount or not username:
        return jsonify({"error": "Missing required fields"}), 400

    # Get user by username
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": f"User '{username}' not found"}), 404

    # Get the bill
    bill = Bill.query.get(bill_id)
    if not bill:
        return jsonify({"error": "Bill not found"}), 404

    # Get the customer
    customer = bill.customer
    if not customer:
        return jsonify({"error": "Customer not found for this bill"}), 404

    # Auto-generate reference if not provided
    if not reference:
        reference = f"PMT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"

    # Create payment record
    payment = Payment(
        bill_id=bill.id,
        amount=Decimal(str(amount)),
        method=method,
        reference=reference,
        recorded_by=user.id
    )
    db.session.add(payment)

    # Update bill status
    bill.status = "paid"

    # Update customer balance
    amount_decimal = Decimal(str(amount))
    customer.balance = (customer.balance or Decimal("0")) - amount_decimal
    if customer.balance < 0:
        customer.balance = Decimal("0")

    db.session.commit()

    # Generate receipt
    receipt_no = f"WBS-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    receipt_data = {
        "customer": customer.name,
        "bill_id": bill.id,
        "amount_paid": float(amount_decimal),
        "method": method,
        "cashier": user.name or user.username,
        "datetime": datetime.now().isoformat(),
        "reference": reference
    }

    receipt = Receipt(
        payment_id=payment.id,
        receipt_no=receipt_no,
        receipt_json=receipt_data
    )
    db.session.add(receipt)
    db.session.commit()

    return jsonify({
        "message": "Payment successful",
        "receipt_no": receipt_no,
        "receipt_data": receipt_data,
        "new_balance": float(customer.balance)
    }), 201
