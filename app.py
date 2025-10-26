from flask import Flask, jsonify
from config import Config
from extensions import db, jwt, bcrypt
from flask_migrate import Migrate
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.customer_routes import customer_bp
from routes.meter_routes import meter_bp
from routes.reading_routes import reading_bp
from routes.payment_routes import payment_bp
from routes.receipt_routes import receipt_bp
from routes.dashboard_routes import dashboard_bp
from routes.billing_settings import billing_settings_bp
from routes.billing_routes import billing_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['CORS_HEADERS'] = 'Content-Type,Authorization'

    # CORS
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

    # Initialize extensions
    db.init_app(app)    
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate = Migrate(app, db)

    # JWT Error Handlers
    @jwt.unauthorized_loader
    def unauthorized_response(err):
        return jsonify({"error": "Missing or invalid token", "details": err}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(err):
        return jsonify({"error": f"Invalid token: {err}"}), 422

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(customer_bp, url_prefix="/api/customers")
    app.register_blueprint(meter_bp, url_prefix="/api/meters")
    app.register_blueprint(reading_bp, url_prefix="/api/readings")
    app.register_blueprint(payment_bp, url_prefix="/api/payments")
    app.register_blueprint(receipt_bp, url_prefix="/api/receipts")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(billing_settings_bp, url_prefix="/api/billing_settings")
    app.register_blueprint(billing_bp, url_prefix="/api/billing")

    @app.route("/")
    def index():
        return {"message": "Water Billing System API is running"}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
