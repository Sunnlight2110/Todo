from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TEXT, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=1)
    
    todos = relationship("TODO", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")

class TODO(Base):
    __tablename__ = "Todo"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="todos")
    notes = Column(TEXT)
    date = Column(DateTime)
    status = Column(String, default='Pending')
    priority = Column(String, default='Medium')

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    __table_args__ = (UniqueConstraint('user_id', 'session_uuid', name='uq_user_session'), )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_uuid = Column(String, index=True)  # Per-user unique via composite constraint
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    # ↑ This lets you do: session.messages to get all messages!


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    sender = Column(String)  # 'user' or 'assistant' (not 'ai' - match OpenAI format!)
    message = Column(TEXT)
    timestamp = Column(DateTime, default=datetime.now)
    tool_used = Column(String, nullable=True)
    
    # Relationship
    session = relationship("ChatSession", back_populates="messages")