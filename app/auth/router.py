# from app.config import settings
from .jwt import get_current_user, verify_access_token, hash_password, verify_password, create_access_token
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from database import get_db
from .schemas import *
from .models import *
import json
from fastapi import Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List
from datetime import datetime
import httpx
import os
from config import settings

from mcp_config.server_setup import handle_tool_call

router = APIRouter(prefix="/auth", tags=["auth"])

chat_router = APIRouter(prefix="/ai", tags=["AI Chat"])

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db), response_model = UserResponse, status_code=status.HTTP_201_CREATED):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = hash_password(user.password)
    new_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    print('finding login user')
    user: User = db.query(User).filter(User.username == user_credentials.username).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    access_token: str = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get('/user_profile', response_model=UserProfile, status_code=status.HTTP_200_OK)
def user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post('/todo', response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def wright_todo(todo_data: CreateTodo, current_user: User = Depends(get_current_user) , db: Session = Depends(get_db)):
    new_todo=TODO(
        notes=todo_data.notes, 
        date=todo_data.date, 
        status=todo_data.status,
        priority=todo_data.priority,
        user_id=current_user.id
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

@router.get('/todo/{user_id}', response_model=List[TodoResponse], status_code=status.HTTP_200_OK)
def get_user_todo(user_id: int, db: Session = Depends(get_db)):
    todo = db.query(TODO).filter(TODO.user_id==user_id).all()
    return todo

@router.patch('/todo/{todo_id}' , status_code=status.HTTP_200_OK)
def update_user_todo(todo_id: int, todo_data: UpdateTodo, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    todo_query = db.query(TODO).filter(TODO.id == todo_id, TODO.user_id == current_user.id)
    todo = todo_query.first()
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Todo with id {todo_id} not found or you don't have permission"
        )
    update_dict = todo_data.model_dump(exclude_unset=True)
    todo_query.update(update_dict, synchronize_session=False)
    db.commit()
    db.refresh(todo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.delete('/todo/{todo_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_user_todo(todo_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    todo_query = db.query(TODO).filter(TODO.id == todo_id, TODO.user_id == current_user.id)
    todo = todo_query.first()
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Todo with id {todo_id} not found or you don't have permission"
        )
    todo_query.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

AI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_todo",
            "description": "Create a single new todo item.",
            "parameters": {
                "type": "object",
                "properties": {
                    "notes": {"type": "string", "description": "The task content"},
                    "date": {"type": "string", "description": "ISO date YYYY-MM-DD."},
                    "status": {
                        "type": "string", 
                        "enum": ["Pending", "In Progress", "Completed"],
                        "default": "Pending"
                    },
                    "priority": {
                        "type": "string", 
                        "enum": ["Low", "Medium", "High"],
                        "default": "Medium"
                    }
                },
                "required": ["notes", "date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "bulk_create_todos",
            "description": "Create multiple todo items at once.",
            "parameters": {
                "type": "object",
                "properties": {
                    "tasks": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "notes": {"type": "string"},
                                "date": {"type": "string", "description": "YYYY-MM-DD"},
                                "status": {"type": "string", "enum": ["Pending", "In Progress", "Completed"]},
                                "priority": {"type": "string", "enum": ["Low", "Medium", "High"]}
                            },
                            "required": ["notes", "date"]
                        }
                    }
                },
                "required": ["tasks"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_todos",
            "description": "Retrieve todos. Can filter by date, status, or priority, or leave blank to all in case of you need all todo from user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {"type": "string", "description": "YYYY-MM-DD"},
                    "status": {"type": "string", "enum": ["Pending", "In Progress", "Completed"]},
                    "priority": {"type": "string", "enum": ["Low", "Medium", "High"]}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "edit_todo",
            "description": "Update an existing todo's details by its ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "todo_id": {"type": "integer", "description": "The ID of the todo to update"},
                    "notes": {"type": "string"},
                    "date": {"type": "string", "description": "YYYY-MM-DD"},
                    "status": {"type": "string", "enum": ["Pending", "In Progress", "Completed", "Cancelled"]},
                    "priority": {"type": "string", "enum": ["Low", "Medium", "High"]}
                },
                "required": ["todo_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_todos",
            "description": "Delete todos using their IDs.",
            "parameters": {
                "type": "object",
                "properties": {
                    "todo_ids": {
                        "type": "array",
                        "items": {"type": "integer"}
                    }
                },
                "required": ["todo_ids"]
            }
        }
    }
]


@chat_router.post("/chat")
async def chat_with_agent(
    message: str = Body(..., embed=True),
    session_uuid: str = Body(..., embed=True),  # Frontend sends this!
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)  # Add database dependency
):
    try:
        today_str = datetime.now().strftime("%Y-%m-%d")
        today_day = datetime.now().strftime("%A") 
        
        # 1️⃣ GET OR CREATE CHAT SESSION
        chat_session = db.query(ChatSession).filter(
            ChatSession.session_uuid == session_uuid,
            ChatSession.user_id == current_user.id
        ).first()
        
        if not chat_session:
            # Create new session if it doesn't exist
            try:
                chat_session = ChatSession(
                    user_id=current_user.id,
                    session_uuid=session_uuid,
                    created_at=datetime.now()
                )
                db.add(chat_session)
                db.commit()
                db.refresh(chat_session)
            except Exception as e:
                # Handle race condition: another request may have created this session
                db.rollback()
                # Try to fetch it again
                chat_session = db.query(ChatSession).filter(
                    ChatSession.session_uuid == session_uuid,
                    ChatSession.user_id == current_user.id
                ).first()
                if not chat_session:
                    # Still doesn't exist? Re-raise the original error
                    raise e
        
        # 2️⃣ LOAD PREVIOUS MESSAGES FROM THIS SESSION
        previous_messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == chat_session.id
        ).order_by(ChatMessage.timestamp.asc()).all()
        previous_messages = previous_messages[-10:]  # Limit to last 10 messages
        
        # 3️⃣ BUILD MESSAGE HISTORY FOR AI
        messages = [
            {
                "role": "system", 
                "content": (
                    f"You are a Todo API Assistant. Today is {today_str}, {today_day}."
                    "1. DATE HANDLING: Convert terms like 'tomorrow' or 'yesterday' to YYYY-MM-DD."
                    "2. CREATION: Pass the date to the 'date' argument and description to 'notes', status to 'status', priority to 'priority'."
                    "3. DELETION/EDITING: If you don't know the ID of a task, you MUST call 'get_todos' first. "
                    "Do not ask the user for IDs; find them yourself using the tools. If you need more info, ask for user clarification like date, status or priority or anything like that."
                    "4. RESPONSE FORMAT: If your final step is reporting 'get_todos' results, "
                    "output ONLY a raw JSON array. No conversational text."
                    "5. AGENTIC FLOW: You are allowed to call multiple tools in sequence to fulfill a request."
                    "6. In case of complex query use step by step reasoning before answering using all of tools you have. In case of if you do not have any information about any todo user is asking use tools to get all todos and then use it you do not have to inform or confirm from user for this one."
                )
            }
        ]
        
        # Add previous conversation history
        for msg in previous_messages:
            messages.append({
                "role": msg.sender,  # 'user' or 'assistant'
                "content": msg.message
            })
        
        # Add current user message
        messages.append({"role": "user", "content": message})
        
        # 4️⃣ SAVE USER MESSAGE TO DB
        user_message = ChatMessage(
            session_id=chat_session.id,
            sender="user",
            message=message,
            timestamp=datetime.now()
        )
        db.add(user_message)
        db.commit()
        
        
        async with httpx.AsyncClient() as client:
            # 🔄 The Agent Loop
            max_turns = 5
            tools_used = []
            
            for turn in range(max_turns):
                print(f'turn:{turn}')
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.open_router_key}"},
                    json={
                        "model": "google/gemini-2.0-flash-001",
                        "messages": messages,
                        "tools": AI_TOOLS
                    }
                )
                
                result = response.json()
                
                if 'choices' not in result:
                    return {"answer": f"API Error: {result.get('error', 'Unknown error')}"}
                    
                ai_message = result['choices'][0]['message']
                messages.append(ai_message)

                if not ai_message.get('tool_calls'):
                    break
                
                print(f'turn: {turn}')

                # 🏃 EXECUTE TOOLS
                for tool_call in ai_message['tool_calls']:
                    name = tool_call["function"]["name"]
                    args = json.loads(tool_call["function"]["arguments"])
                    args["username"] = current_user.username
                    
                    tools_used.append(name)
                    tool_output = await handle_tool_call(name, args)
                    
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "name": name,
                        "content": tool_output[0].text
                    })
            
            # Get final AI response
            ai_final_text = messages[-1].get('content', "")
            
            # 5️⃣ SAVE ASSISTANT MESSAGE TO DB
            assistant_message = ChatMessage(
                session_id=chat_session.id,
                sender="assistant",
                message=ai_final_text,
                timestamp=datetime.now(),
                tool_used=", ".join(tools_used) if tools_used else None
            )
            db.add(assistant_message)
            db.commit()
            
            # Parse response format
            if ai_final_text:
                if "```json" in ai_final_text:
                    try:
                        raw_json = ai_final_text.split("```json")[1].split("```")[0].strip()
                        return {
                            "answer": json.loads(raw_json),
                            "session_uuid": session_uuid
                        }
                    except Exception:
                        pass
                
                elif ai_final_text.strip().startswith("["):
                    try:
                        return {
                            "answer": json.loads(ai_final_text.strip()),
                            "session_uuid": session_uuid
                        }
                    except Exception:
                        pass

            return {
                "answer": ai_final_text,
                "session_uuid": session_uuid
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return
