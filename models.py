from datetime import datetime
from extensions import db, bcrypt

# -------------------- USER --------------------
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(50), default="cashier")
    name = db.Column(db.String(120))

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


# -------------------- CUSTOMER --------------------
class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True)
    account_no = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(255))
    balance = db.Column(db.Numeric(12, 2), default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# -------------------- METER --------------------
class Meter(db.Model):
    __tablename__ = "meters"

    id = db.Column(db.Integer, primary_key=True)
    meter_no = db.Column(db.String(50), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"))
    installed_at = db.Column(db.Date)
    status = db.Column(db.String(20), default="active")

    customer = db.relationship("Customer", backref="meters")


# -------------------- READING --------------------
class Reading(db.Model):
    __tablename__ = "readings"

    id = db.Column(db.Integer, primary_key=True)
    meter_id = db.Column(db.Integer, db.ForeignKey("meters.id"))
    reading_date = db.Column(db.Date, nullable=False)
    reading_value = db.Column(db.Numeric(12, 3), nullable=False)

    meter = db.relationship("Meter", backref="readings")

    @property
    def usage(self):
        """Return difference from previous reading."""
        # Get previous reading for same meter before this date
        previous = (
            Reading.query.filter(
                Reading.meter_id == self.meter_id,
                Reading.reading_date < self.reading_date
            )
            .order_by(Reading.reading_date.desc())
            .first()
        )
        if previous:
            return float(self.reading_value) - float(previous.reading_value)
        return 0.0



# -------------------- BILL --------------------
class Bill(db.Model):
    __tablename__ = "bills"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"))
    reading_id = db.Column(db.Integer, db.ForeignKey("readings.id"))
    billing_start = db.Column(db.Date)
    billing_end = db.Column(db.Date)
    previous_reading = db.Column(db.Numeric(12, 3))  # <-- store the previous reading
    total_reading = db.Column(db.Numeric(12, 3))     # <-- store current reading
    consumption = db.Column(db.Numeric(12, 3))
    fixed_charge = db.Column(db.Numeric(12, 2))
    variable_charge = db.Column(db.Numeric(12, 2))
    amount_due = db.Column(db.Numeric(12, 2))
    due_date = db.Column(db.Date)
    status = db.Column(db.String(20), default="unpaid")

    customer = db.relationship("Customer", backref="bills")
    reading = db.relationship("Reading", backref="bills")

    

# -------------------- BILLING SETTING --------------------
class BillingSetting(db.Model):
    __tablename__ = "billing_settings"

    id = db.Column(db.Integer, primary_key=True)
    fixed_charge = db.Column(db.Numeric(12, 2), nullable=False, default=2000.00)
    rate_per_unit = db.Column(db.Numeric(12, 2), nullable=False, default=350.00)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())


# -------------------- PAYMENT --------------------
class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    bill_id = db.Column(db.Integer, db.ForeignKey("bills.id"))
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    method = db.Column(db.String(50))
    reference = db.Column(db.String(255))
    recorded_by = db.Column(db.Integer, db.ForeignKey("users.id"))

    bill = db.relationship("Bill", backref="payments")
    user = db.relationship("User", backref="payments")


# -------------------- RECEIPT --------------------
class Receipt(db.Model):
    __tablename__ = "receipts"

    id = db.Column(db.Integer, primary_key=True)
    payment_id = db.Column(db.Integer, db.ForeignKey("payments.id"))
    receipt_no = db.Column(db.String(50), unique=True)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    receipt_json = db.Column(db.JSON)

    payment = db.relationship("Payment", backref="receipt")
