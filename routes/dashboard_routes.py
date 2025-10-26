from flask import Blueprint, jsonify
from models import Customer, Bill, Payment
from sqlalchemy import func
from datetime import datetime

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/summary")
def get_summary():
    total_customers = Customer.query.count()
    total_paid = Payment.query.with_entities(func.sum(Payment.amount)).scalar() or 0
    total_unpaid = Bill.query.filter_by(status="unpaid").with_entities(func.sum(Bill.amount_due)).scalar() or 0
    total_payments = Payment.query.count()

    return jsonify({
        "total_customers": total_customers,
        "total_paid": float(total_paid),
        "total_unpaid": float(total_unpaid),
        "total_payments": total_payments
    })


@dashboard_bp.route("/monthly")
def get_monthly_data():
    """Returns monthly paid vs unpaid for chart."""
    from sqlalchemy import extract

    current_year = datetime.now().year
    months = list(range(1, 13))

    paid_data = (
        Payment.query.with_entities(
            extract("month", Payment.payment_date).label("month"),
            func.sum(Payment.amount).label("total_paid")
        )
        .filter(extract("year", Payment.payment_date) == current_year)
        .group_by("month")
        .all()
    )

    unpaid_data = (
        Bill.query.with_entities(
            extract("month", Bill.billing_end).label("month"),
            func.sum(Bill.amount_due).label("total_unpaid")
        )
        .filter(extract("year", Bill.billing_end) == current_year, Bill.status == "unpaid")
        .group_by("month")
        .all()
    )

    # Convert to dict for easy mapping
    paid_dict = {int(m): float(t) for m, t in paid_data}
    unpaid_dict = {int(m): float(t) for m, t in unpaid_data}

    chart_data = [
        {
            "month": datetime(2025, m, 1).strftime("%b"),
            "paid": paid_dict.get(m, 0),
            "unpaid": unpaid_dict.get(m, 0),
        }
        for m in months
    ]

    return jsonify(chart_data)
