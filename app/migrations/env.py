# migrations/env.py
import os
from dotenv import load_dotenv
from pathlib import Path

# Look for .env in the current directory OR the parent directory
env_path = Path('.') / '.env'
if not env_path.exists():
    env_path = Path('..') / '.env'

load_dotenv(dotenv_path=env_path)

# DEBUG: Let's see if Pydantic can see it now
print(f"DEBUG: Checking for key in environment: {'FOUND' if os.getenv('OPEN_ROUTER_KEY') else 'NOT FOUND'}")