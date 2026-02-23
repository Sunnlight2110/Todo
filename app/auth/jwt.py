from database import get_db
from config import settings
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from .models import User
from passlib.context import CryptContext
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
security = HTTPBearer()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str)->str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str)-> bool:
    return pwd_context.verify(plain_password, hashed_password)   

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expiration_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def verify_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None

def get_user_from_token(token: str, db) -> Optional[User]:
    payload = verify_access_token(token)
    if payload is None:
        return None
    user_id: str = payload.get("sub")
    if user_id is None:
        return None
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user

# def get_current_user(token: str, db) -> Optional[User]:
#     user = get_user_from_token(token, db)
#     return user

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db) 
)-> User:
    token = credentials.credentials
    user = get_user_from_token(token, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user