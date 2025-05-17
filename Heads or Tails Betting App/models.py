from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    profile_picture = db.Column(db.String(255))
    balance = db.Column(db.Numeric(10,2), nullable=False, default=1000.00)
    last_claim_time = db.Column(db.DateTime, nullable=True)
    bets = db.relationship('Bet', backref='user', lazy=True)

class Bet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Numeric(10,2), nullable=False)
    choice = db.Column(db.String(10), nullable=False)
    result = db.Column(db.String(10), nullable=False)
    won = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)