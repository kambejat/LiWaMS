from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import Receipt

receipt_bp = Blueprint("receipts", __name__)

@receipt_bp.route("/<int:receipt_id>", methods=["GET"])
def get_receipt(receipt_id):
    receipt = Receipt.query.get(receipt_id)
    if not receipt:
        return jsonify({"error": "Receipt not found"}), 404

    return jsonify({
        "id": receipt.id,
        "payment_id": receipt.payment_id,
        "receipt_no": receipt.receipt_no,
        "issued_at": receipt.issued_at.isoformat(),
        "receipt_data": receipt.receipt_json
    }), 200


@receipt_bp.route("/", methods=["GET"])
def get_receipts():
    receipts = Receipt.query.all()  
    result = []
    for r in receipts:
        result.append({
            "id": r.id,
            "payment_id": r.payment_id,
            "receipt_no": r.receipt_no,
            "issued_at": r.issued_at.isoformat(),
            "receipt_data": r.receipt_json
        })
    return jsonify(result), 200