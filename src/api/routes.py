"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from datetime import datetime, timedelta, timezone

import jwt
from flask import Blueprint, jsonify, request
from api.models import db, User
from api.utils import APIException
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

JWT_SECRET = os.getenv('JWT_SECRET', 'development-secret-change-me')


def create_token(user):
    return jwt.encode({
        'sub': str(user.id),
        'email': user.email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24),
    }, JWT_SECRET, algorithm='HS256')


def get_current_user():
    authorization = request.headers.get('Authorization', '')
    if not authorization.startswith('Bearer '):
        return None

    try:
        payload = jwt.decode(
            authorization.split(' ', 1)[1], JWT_SECRET, algorithms=['HS256'])
        user = User.query.get(int(payload['sub']))
        return user if user and user.is_active else None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError):
        return None


def password_matches(user, password):
    try:
        return check_password_hash(user.password, password)
    except ValueError:
        return user.password == password


@api.route('/signup', methods=['POST'])
def signup():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'msg': 'Email y contraseña son requeridos'}), 400
    if len(password) < 6:
        return jsonify({'msg': 'La contraseña debe tener al menos 6 caracteres'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'El correo ya está registrado'}), 409

    user = User(email=email, password=generate_password_hash(
        password), is_active=True)
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'Usuario registrado'}), 201


@api.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    user = User.query.filter_by(email=email).first()

    if not user or not user.is_active or not password_matches(user, password):
        return jsonify({'msg': 'Correo o contraseña incorrectos'}), 401
    return jsonify({'token': create_token(user), 'user': user.serialize()}), 200


@api.route('/validate', methods=['GET'])
def validate_token():
    user = get_current_user()
    if not user:
        return jsonify({'msg': 'Token inválido o expirado'}), 401
    return jsonify({'user': user.serialize()}), 200


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200
