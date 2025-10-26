from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import date, datetime, timedelta
from decimal import Decimal
from extensions import db
from models import Reading, Bill, Meter, BillingSetting, Customer

reading_bp = Blueprint("readings", __name__)

@reading_bp.route("/", methods=["POST"])
# @jwt_required()
def add_reading():
    data = request.get_json()

    meter_id = data.get("meter_id")
    reading_date = data.get("reading_date")
    reading_value = data.get("reading_value")

    if not all([meter_id, reading_date, reading_value]):
        return jsonify({"error": "Missing required fields"}), 400

    # --- Convert reading_date to Python date ---
    try:
        if "T" in reading_date:
            reading_date = datetime.fromisoformat(reading_date).date()
        else:
            reading_date = datetime.strptime(reading_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    # --- Get Customer ID ---
    meter = Meter.query.get(meter_id)
    if not meter:
        return jsonify({"error": "Meter not found"}), 404
    customer_id = meter.customer_id

    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    # --- Fetch previous bill to chain billing period ---
    prev_bill = (
        Bill.query.join(Reading)
        .filter(Reading.meter_id == meter_id)
        .order_by(Bill.billing_end.desc())
        .first()
    )

    if prev_bill:
        billing_start = prev_bill.billing_end + timedelta(days=1)
        previous_reading_value = Decimal(str(prev_bill.total_reading))
    else:
        billing_start = reading_date
        previous_reading_value = Decimal("0")

    billing_end = reading_date
    reading_value = Decimal(str(reading_value))

    # --- Create Reading ---
    new_reading = Reading(
        meter_id=meter_id,
        reading_date=reading_date,
        reading_value=reading_value,
    )
    db.session.add(new_reading)
    db.session.flush()  # So new_reading.id is available

    # --- Calculate consumption ---
    consumption = reading_value - previous_reading_value
    if consumption < 0:
        consumption = Decimal("0")

    # --- Fetch billing settings ---
    billing_setting = BillingSetting.query.first()
    if not billing_setting:
        billing_setting = BillingSetting(
            fixed_charge=Decimal("2000.00"),
            rate_per_unit=Decimal("350.00")
        )
        db.session.add(billing_setting)
        db.session.commit()

    fixed_charge = Decimal(str(billing_setting.fixed_charge))
    rate_per_unit = Decimal(str(billing_setting.rate_per_unit))

    # --- Compute charges ---
    variable_charge = consumption * rate_per_unit
    amount_due = fixed_charge + variable_charge

    # --- Add unpaid bills for this customer ---
    unpaid_bills_total = db.session.query(
        db.func.coalesce(db.func.sum(Bill.amount_due), 0)
    ).filter(Bill.customer_id == customer_id, Bill.status == "unpaid").scalar()

    amount_due += Decimal(str(unpaid_bills_total))

    # --- Compute due date (20th of next month) ---
    today = date.today()
    next_month = today.month % 12 + 1
    year = today.year + (1 if today.month == 12 else 0)
    due_date = date(year, next_month, 20)

    # --- Create Bill ---
    bill = Bill(
        customer_id=customer_id,
        reading_id=new_reading.id,
        billing_start=billing_start,
        billing_end=billing_end,
        previous_reading=previous_reading_value,
        total_reading=reading_value,
        consumption=consumption,
        fixed_charge=fixed_charge,
        variable_charge=variable_charge,
        amount_due=amount_due,
        due_date=due_date,
        status="unpaid",
    )
    db.session.add(bill)

    # --- Update Customer Balance ---
    customer.balance = (customer.balance or Decimal("0")) + amount_due

    db.session.commit()

    # --- Return JSON response ---
    return jsonify({
        "message": "Reading and Bill created successfully",
        "reading": {
            "id": new_reading.id,
            "meter_id": new_reading.meter_id,
            "reading_date": str(new_reading.reading_date),
            "reading_value": str(consumption)
        },
        "bill": {
            "id": bill.id,
            "customer_id": bill.customer_id,
            "billing_start": str(bill.billing_start),
            "billing_end": str(bill.billing_end),
            "previous_reading": str(bill.previous_reading),
            "total_reading": str(bill.total_reading),
            "consumption": str(bill.consumption),
            "fixed_charge": str(bill.fixed_charge),
            "variable_charge": str(bill.variable_charge),
            "amount_due": str(bill.amount_due),
            "due_date": str(bill.due_date),
            "status": bill.status
        },
        "customer_balance": str(customer.balance)
    }), 201
