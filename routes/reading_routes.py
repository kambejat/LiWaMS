from datetime import datetime, date, timedelta
from decimal import Decimal
from flask import Blueprint, request, jsonify
from extensions import db
from models import Meter, Customer, Reading, Bill, BillingSetting

reading_bp = Blueprint("reading_bp", __name__)

@reading_bp.route("/", methods=["POST"])
def add_reading():
    data = request.get_json()
    meter_id = data.get("meter_id")
    reading_date = data.get("reading_date")
    current_total_reading = data.get("reading_value")  # total (current) reading entered from frontend

    if not all([meter_id, reading_date, current_total_reading]):
        return jsonify({"error": "Missing required fields"}), 400

    # --- Convert reading_date to Python date ---
    try:
        if "T" in reading_date:
            reading_date = datetime.fromisoformat(reading_date).date()
        else:
            reading_date = datetime.strptime(reading_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    # --- Fetch meter and customer ---
    meter = Meter.query.get(meter_id)
    if not meter:
        return jsonify({"error": "Meter not found"}), 404

    customer = Customer.query.get(meter.customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    # --- Fetch previous reading (strictly before current date) ---
    prev_reading = (
        Reading.query.filter(
            Reading.meter_id == meter_id,
            Reading.reading_date < reading_date
        )
        .order_by(Reading.reading_date.desc())
        .first()
    )

    previous_total_reading = Decimal(str(prev_reading.reading_value)) if prev_reading else Decimal("0")
    billing_start = prev_reading.reading_date + timedelta(days=1) if prev_reading else reading_date

    # --- Convert frontend reading to Decimal ---
    current_total_reading = Decimal(str(current_total_reading))

    # --- Calculate consumption (difference between readings) ---
    consumption = current_total_reading - previous_total_reading
    if consumption < 0:
        return jsonify({"error": "Current reading cannot be less than previous reading"}), 400

    # --- Create new Reading record ---
    new_reading = Reading(
        meter_id=meter_id,
        reading_date=reading_date,
        reading_value=current_total_reading
    )
    db.session.add(new_reading)
    db.session.flush()

    # --- Fetch billing settings ---
    billing_setting = BillingSetting.query.first()
    if not billing_setting:
        billing_setting = BillingSetting(fixed_charge=Decimal("2000.00"), rate_per_unit=Decimal("350.00"))
        db.session.add(billing_setting)
        db.session.commit()

    fixed_charge = Decimal(str(billing_setting.fixed_charge))
    rate_per_unit = Decimal(str(billing_setting.rate_per_unit))
    variable_charge = consumption * rate_per_unit
    amount_due = fixed_charge + variable_charge

    # --- Include unpaid bills total ---
    unpaid_total = db.session.query(db.func.coalesce(db.func.sum(Bill.amount_due), 0)) \
        .filter(Bill.customer_id == customer.id, Bill.status == "unpaid").scalar()
    amount_due += Decimal(unpaid_total)

    # --- Compute due date (20th of next month) ---
    today = date.today()
    next_month = today.month % 12 + 1
    year = today.year + (1 if today.month == 12 else 0)
    due_date = date(year, next_month, 20)

    # --- Create Bill record ---
    bill = Bill(
        customer_id=customer.id,
        reading_id=new_reading.id,
        billing_start=billing_start,
        billing_end=reading_date,
        previous_reading=previous_total_reading,  # last reading from DB
        total_reading=current_total_reading,       # new total reading
        consumption=consumption,                   # difference
        fixed_charge=fixed_charge,
        variable_charge=variable_charge,
        amount_due=amount_due,
        due_date=due_date,
        status="unpaid"
    )
    db.session.add(bill)

    # --- Update customer balance ---
    customer.balance = (customer.balance or Decimal("0")) + amount_due
    db.session.commit()

    return jsonify({
        "message": "Reading and Bill created successfully",
        "reading": {
            "id": new_reading.id,
            "meter_id": new_reading.meter_id,
            "reading_date": str(new_reading.reading_date),
            "reading_value": str(new_reading.reading_value),
            "consumption": str(consumption)
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
