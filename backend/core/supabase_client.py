import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Explicitly load the .env file from the backend directory
# This assumes supabase_client.py is in backend/core/
base_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(base_dir, '..', '.env')
load_dotenv(dotenv_path=env_path)

# Retrieve variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Validate that variables are loaded
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in the .env file")

# Initialize the client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_client() -> Client:
    """Returns the initialized Supabase client."""
    return supabase