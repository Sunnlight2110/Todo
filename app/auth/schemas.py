from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class UserProfile(BaseModel):
    username: str
    email: str

class CreateTodo(BaseModel):
    notes: str
    date: datetime
    status: str
    priority: str

class TodoResponse(BaseModel):
    id: int
    notes: str
    date: datetime
    status: str
    priority: str
    user_id: int
    
    class Config:
        from_attributes = True

class UpdateTodo(BaseModel):
    notes: Optional[str] = None
    date: Optional[datetime] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    
