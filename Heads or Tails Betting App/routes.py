from flask import render_template, session, redirect, url_for, make_response, abort, request, jsonify
from app_init import app, db
from models import User, Bet
import random
from decimal import Decimal
from datetime import datetime, timedelta

@app.errorhandler(500)
def internal_server_error(error):
    return render_template('500.html'), 500
    
@app.route("/")
def landing_route():
    return render_template("landing.html")

@app.route("/home")
def home_route():
    if 'user' not in session:
        return redirect(url_for('landing_route'))
    
    user = User.query.filter_by(email=session['user']['user_email']).first()
    return render_template("home.html", current_user=user)

@app.route("/claim")
def claim_route():
    if 'user' not in session:
        return redirect(url_for('landing_route'))
    @app.route("/claim_time_reward", methods=['POST'])
    def claim_time_reward():
        if 'user' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user = User.query.filter_by(email=session['user']['user_email']).first()
        
        # Check if enough time has passed since last claim
        if user.last_claim_time and datetime.utcnow() - user.last_claim_time < timedelta(minutes=10):
            return jsonify({'error': 'Too soon to claim'}), 400
        
        # Update user balance and last claim time
        user.balance += Decimal('0.05')
        user.last_claim_time = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True})
    
    @app.route("/claim_case", methods=['POST'])
    def claim_case():
        if 'user' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user = User.query.filter_by(email=session['user']['user_email']).first()
        
        # Define case probabilities and rewards
        cases = [
            {'probability': 0.99, 'amount': Decimal('0.05')},  # Common
            {'probability': 0.0020, 'amount': Decimal('0.15')},  # Uncommon
            {'probability': 0.0020, 'amount': Decimal('0.30')},  # Rare
            {'probability': 0.0055, 'amount': Decimal('0.10')},  # Epic
            {'probability': 0.0005, 'amount': Decimal('1.00')}   # Legendary
        ]
        
        # Generate random number between 0 and 1
        roll = random.random()
        
        # Determine which case was won
        cumulative_prob = 0
        won_amount = Decimal('0.05')  # Default to common case
        
        for case in cases:
            cumulative_prob += case['probability']
            if roll <= cumulative_prob:
                won_amount = case['amount']
                break
        
        # Update user balance
        user.balance += won_amount
        db.session.commit()
        
        return jsonify({'success': True, 'amount': float(won_amount)})
    
    user = User.query.filter_by(email=session['user']['user_email']).first()
    
    can_claim = True
    time_left = ""
    
    if user.last_claim_time:
        time_since_last_claim = datetime.utcnow() - user.last_claim_time
        if time_since_last_claim < timedelta(minutes=10):
            can_claim = False
            seconds_left = 600 - time_since_last_claim.total_seconds()
            minutes = int(seconds_left // 60)
            seconds = int(seconds_left % 60)
            time_left = f"{minutes}:{seconds:02d}"
    
    return render_template("claim.html", current_user=user, can_claim=can_claim, time_left=time_left)

@app.route("/logout", methods=['GET'])
def logout_route():
    session.clear()
    return redirect(url_for('landing_route'))

@app.route("/place_bet", methods=['POST'])
def place_bet():
    if 'user' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    choice = data.get('choice')
    amount = Decimal(str(data.get('amount')))
    
    if not choice or not amount or amount <= 0:
        return jsonify({'error': 'Invalid bet parameters'}), 400
    
    user = User.query.filter_by(email=session['user']['user_email']).first()
    
    if amount > user.balance:
        return jsonify({'error': 'Insufficient balance'}), 400
    
    # Generate result
    result = random.choice(['black', 'white'])
    won = result == choice
    
    # Calculate winnings/losses
    winnings = amount * Decimal('1.90') if won else -amount
    user.balance += winnings
    
    # Record bet
    bet = Bet(
        user_id=user.id,
        amount=amount,
        choice=choice,
        result=result,
        won=won
    )
    
    db.session.add(bet)
    db.session.commit()
    
    return jsonify({
        'won': won,
        'result': result,
        'winnings': float(winnings) if won else 0
    })