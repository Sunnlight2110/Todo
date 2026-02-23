import asyncio
from mcp.server import Server
from mcp.types import Tool, TextContent, Resource, Prompt, PromptMessage, PromptArgument
import mcp.server.stdio
import httpx
import os
from auth.models import User, TODO
from database import SessionLocal
from datetime import datetime
from config import settings
from sqlalchemy import func


OPEN_ROUTER_KEY = settings.open_router_key
MODEL_ID = "google/gemini-2.0-flash-001"

server = Server('todo_mcp_server')

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="create_todo",
            description="Create a new todo. Extract the task into 'notes' and the specific scheduled date into 'todo_date'.",
            inputSchema={
                "type": "object",
                "properties": {
                    "username": {"type": "string"},
                    "notes": {"type": "string", "description": "The task description only (e.g., 'Have breakfast') implement only what is stated by user to set as todo. nothing more. Strictly keep it simple and set reminder to date only"},
                    "date": {
                        "type": "string", 
                        "description": "The ISO date when the task should happen (YYYY-MM-DD). If not specified, use today."
                    }
                },
                "required": ["username", "notes", "date"]
            }
        ),
        Tool(
            name="get_user_todos",
            description="Get all todo items for a specific user",
            inputSchema={
                "type": "object",
                "properties": {
                    "username": {"type": "string"}
                },
                "required": ["username"]
            }
        )
    ]
@server.call_tool()
async def handle_tool_call(name: str, arguments: dict):
    try:
        db = SessionLocal()
        username = arguments.get("username")
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            return [TextContent(type="text", text="User not found!")]

        # --- EXISTING: CREATE SINGLE ---
        if name == "create_todo":
            note_content = arguments.get("notes")
            date_from_ai = arguments.get("date") 
            status_from_ai=arguments.get('status')
            priority_from_ai=arguments.get('priority')
            try:
                final_date = datetime.strptime(date_from_ai, "%Y-%m-%d") if date_from_ai else datetime.now()
            except ValueError:
                final_date = datetime.now()

            new_todo = TODO(user_id=user.id, notes=note_content, date=final_date, status=status_from_ai, priority=priority_from_ai)
            db.add(new_todo)
            db.commit()
            return [TextContent(type="text", text=f"Successfully added todo for {username}!")]

        # --- NEW: BULK CREATE ---
        if name == "bulk_create_todos":
            tasks_data = arguments.get("tasks", []) # Expecting list of {'notes': '...', 'date': '...'}
            created_count = 0
            for task in tasks_data:
                try:
                    t_date = datetime.strptime(task.get("date"), "%Y-%m-%d") if task.get("date") else datetime.now()
                except:
                    t_date = datetime.now()
                
                db.add(TODO(user_id=user.id, notes=task.get("notes"), date=t_date, status=task.get('status'), priority=task.get('priority')))
                created_count += 1
            
            db.commit()
            return [TextContent(type="text", text=f"Successfully created {created_count} tasks in bulk!")]

        # --- NEW: EDIT ---
        if name == "edit_todo":
            todo_id = arguments.get("todo_id")
            todo = db.query(TODO).filter(TODO.id == todo_id, TODO.user_id == user.id).first()
            if not todo:
                return [TextContent(type="text", text=f"Task with ID {todo_id} not found.")]
            
            if "notes" in arguments:
                todo.notes = arguments.get("notes")
            if "date" in arguments:
                try:
                    todo.date = datetime.strptime(arguments.get("date"), "%Y-%m-%d")
                except:
                    pass
            if "priority" in arguments:
                todo.priority=arguments.get('priority')
            if "status" in arguments:
                todo.status=arguments.get('status')
            
            db.commit()
            return [TextContent(type="text", text=f"Task {todo_id} has been updated!")]

        # --- NEW: BULK DELETE ---
        if name == "delete_todos":
            todo_ids = arguments.get("todo_ids", []) # Expecting a list like [1, 2, 3]
            if not todo_ids:
                return [TextContent(type="text", text="No IDs provided to delete.")]
            
            # This deletes all IDs in the list that belong to the user
            deleted_count = db.query(TODO).filter(TODO.id.in_(todo_ids), TODO.user_id == user.id).delete(synchronize_session=False)
            db.commit()
            return [TextContent(type="text", text=f"Successfully deleted {deleted_count} tasks.")]

        # --- EXISTING: GETS ---
        if name == "get_todos":
            # 1. Start with a base query for the current user
            query = db.query(TODO).filter(TODO.user_id == user.id)

            # 2. Add dynamic filters based on what the AI sent
            if "date" in arguments:
                # Assuming your date is stored as a DateTime, we match the day
                target_date = datetime.strptime(arguments["date"], "%Y-%m-%d").date()
                query = query.filter(func.date(TODO.date) == target_date)
            
            if "status" in arguments:
                query = query.filter(TODO.status == arguments["status"])
                
            if "priority" in arguments:
                query = query.filter(TODO.priority == arguments["priority"])

            # 3. Execute the query
            tasks = query.all()

            if not tasks:
                return [TextContent(type="text", text="[]")] # Return empty array for JSON mode

            # 4. Format the output so the AI can read it
            results = []
            for t in tasks:
                results.append({
                    "id": t.id,
                    "notes": t.notes,
                    "date": t.date.strftime("%Y-%m-%d"),
                    "status": t.status,
                    "priority": t.priority
                })
            
            import json
            return [TextContent(type="text", text=json.dumps(results))]
    except Exception as e:
        import traceback
        traceback.print_exc()
        return [TextContent(type="text", text=f"Baka! Something went wrong: {str(e)}")]
    finally:
        db.close()
@server.list_resources()
async def list_resources():
    return [
        {
            "uri": "db://users/list",
            "name": "User Directory",
            "description": "A list of all registered usernames",
            "mimeType": "text/plain"
        }
    ]

@server.read_resource()
async def read_resource(uri: str):
    if uri == "db://users/list":
        db = SessionLocal()
        users = db.query(User).all()
        db.close()
        return "\n".join([u.username for u in users])

@server.list_prompts()
async def list_prompts():
    return [
        Prompt(
            name="summarize_day",
            description="Help the user summarize their busy day based on todos",
            arguments=[
                PromptArgument(name="username", description="The user to summarize for", required=True)
            ]
        )
    ]
@server.get_prompt()
async def get_prompt(name: str, arguments: dict):
    if name == "summarize_day":
        username = arguments.get("username")
        return {
            "messages": [
                PromptMessage(
                    role="user",
                    content=f"Please look at the todos for {username} using the get_user_todos tool and give me a friendly summary of what they need to do!"
                )
            ]
        }


async def main():
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())