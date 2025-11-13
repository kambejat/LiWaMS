from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import Customer, Bill

billing_bp = Blueprint("billing", __name__)


@billing_bp.route("/bills/", methods=["GET"])
def list_bills():
    bills = Bill.query.all()
    customers_data = {}

    for b in bills:
        customer_name = b.customer.name if b.customer else "Unknown"
        customer_id = b.customer.id if b.customer else None

        # Get meter number safely
        meter_number = (
            b.reading.meter.meter_no
            if b.reading and b.reading.meter
            else "N/A"
        )

        # Get reading value safely
        reading_value = (
            b.reading.reading_value
            if b.reading and b.reading.reading_value is not None
            else 0
        )

        # Initialize customer group
        if customer_id not in customers_data:
            customers_data[customer_id] = {
                "customer_id": customer_id,
                "customer": customer_name,
                "total_amount_due": 0,
                "bills": [],
                "earliest_start": b.billing_start,
                "latest_end": b.billing_end,
            }

        # Track billing period
        if b.billing_start and (not customers_data[customer_id]["earliest_start"] or b.billing_start < customers_data[customer_id]["earliest_start"]):
            customers_data[customer_id]["earliest_start"] = b.billing_start
        if b.billing_end and (not customers_data[customer_id]["latest_end"] or b.billing_end > customers_data[customer_id]["latest_end"]):
            customers_data[customer_id]["latest_end"] = b.billing_end

        # Add bill with previous_reading and total_reading
        customers_data[customer_id]["bills"].append({
            "id": b.id,
            "customer_id": customer_id,
            "customer": customer_name,
            "reading_id": getattr(b, "reading_id", None),
            "meter_number": meter_number,
            "billing_start": b.billing_start.isoformat() if b.billing_start else None,
            "billing_end": b.billing_end.isoformat() if b.billing_end else None,
            "previous_reading": float(getattr(b, "previous_reading", 0)),  # <-- new
            "total_reading": float(getattr(b, "total_reading", 0)),        # <-- new
            "consumption": float(getattr(b, "consumption", reading_value)), 
            "fixed_charge": float(getattr(b, "fixed_charge", 0)),
            "variable_charge": float(getattr(b, "variable_charge", 0)),
            "amount_due": float(b.amount_due),
            "due_date": b.due_date.isoformat() if getattr(b, "due_date", None) else None,
            "status": b.status
        })

        # Only add unpaid to total
        if b.status == "unpaid":
            customers_data[customer_id]["total_amount_due"] += float(b.amount_due)

    # Build response
    result = []
    for data in customers_data.values():
        billing_period = None
        if data["earliest_start"] and data["latest_end"]:
            billing_period = f"{data['earliest_start'].isoformat()} - {data['latest_end'].isoformat()}"

        result.append({
            "customer_id": data["customer_id"],
            "customer": data["customer"],
            "total_amount_due": data["total_amount_due"],
            "billing_period": billing_period,
            "bills": data["bills"]
        })

    return jsonify(result), 200

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
