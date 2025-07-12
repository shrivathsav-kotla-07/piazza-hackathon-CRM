from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import google.generativeai as genai
import json
import os
import ollama
from typing import Dict, Callable
from langchain_ollama import OllamaLLM
# from ti import get_date # Assuming ti.py exists and is accessible
from pymongo import MongoClient
import ast
import logging

# logging.basicConfig(level=logging.DEBUG)
# logging.getLogger("pymongo").setLevel(logging.DEBUG)

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",  # Allow your frontend origin
    "http://localhost:8000",  # Allow your backend origin if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_DETAILS = os.getenv("MONGO_DETAILS")
if not MONGO_DETAILS:
    raise ValueError("MONGO_DETAILS environment variable not set.")

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.crm_db
leads_collection = database.get_collection("leads")

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

class LeadData(BaseModel):
    name: str
    email: str
    phone: str
    source: str = "document/image" # Default source

class PromptInput(BaseModel):
    user_input: str

def get_data(query):
    # 🧠 Convert to dict only if it's a string
    if isinstance(query, str):
        print(query)
        query = ast.literal_eval(query)
        print(query)
    elif not isinstance(query, dict):
        return {"error": f"Query must be a dict or string representing a dict, not {type(query)._name_}"}

    # ✅ Now query is a dictionary
    client = MongoClient("mongodb://localhost:27017/")
    db = client["test"]
    collection = db["leads"]

    results = collection.find(query, {"_id": 0})
    print(results)
    return list(results)

# 🛠 Tool schema for get_data (MongoDB)
get_the_mango = {
    'type': 'function',
    'function': {
        'name': 'get_the_mango',
        'description': 'Get student data from MongoDB using a query.',
        'parameters': {
            'type': 'object',
            'required': ['query'],
            'properties': {
                'query': {
                    'type': 'object',
                    'description': '''MongoDB query dictionary to match data send only in dict formate . Example: {"name": "rithwik"}Use the fields:
- name (string)
- email (string)
- phone (string)
- status (string)
- source (string)
- createdAt (ISO datetime string)
''',
                }
            },
        },
    },
}

# 🧠 Map tool names to actual Python functions
available_functions: Dict[str, Callable] = {
    'get_the_mango': get_data,
}

# 🚀 Main processing function
def process_prompt(user_input):
    # Handle simple greetings
    if user_input.lower() in ["hi", "hello", "hey", "greetings"]:
        return {"message": "Hello! How can I help you with your leads today?"}

    messages = [{"role": "user", "content": f"""You are a helpful assistant that can retrieve lead information from a MongoDB database.
When a user asks for information that requires a database query, you should use the 'get_the_mango' tool to formulate a MongoDB query.
After the query is executed, you will receive the results. Your final response should be a human-readable summary of the retrieved information,
not the MongoDB query itself.

Use the following fields for queries:
- name (string)
- email (string)
- phone (string)
- status (string)
- source (string)
- createdAt (ISO datetime string)

🟢 Examples:

User: "Show me details of Akshaj."
(Tool call to get_the_mango with query: {{"name": {{"$regex": "Akshaj", "$options": "i"}}}} )
(Tool output: [{{"name": "Akshaj", "email": "akshaj@example.com", "phone": "123-456-7890", "status": "New", "source": "Manual", "createdAt": "2025-07-10T10:00:00"}}])
Assistant: "Akshaj's details are: Email: akshaj@example.com, Phone: 123-456-7890, Status: New, Source: Manual, Created At: 2025-07-10 10:00:00."

User: "Find leads created after July 1st, 2025."
(Tool call to get_the_mango with query: {{"createdAt": {{"$gt": "2025-07-01T00:00:00"}}}} )
(Tool output: [{{"name": "Lead A", "email": "a@example.com"}}, {{"name": "Lead B", "email": "b@example.com"}}])
Assistant: "Leads created after July 1st, 2025 include Lead A (a@example.com) and Lead B (b@example.com)."

User: "Who are the new users?"
(Tool call to get_the_mango with query: {{"status": "New"}} )
(Tool output: [{{"name": "John Doe", "status": "New"}}, {{"name": "Jane Smith", "status": "New"}}])
Assistant: "The new users are John Doe and Jane Smith."

User: "Do we have any manual entries?"
(Tool call to get_the_mango with query: {{"source": "Manual"}} )
(Tool output: [{{"name": "Manual Lead 1", "source": "Manual"}}])
Assistant: "Yes, we have manual entries, for example: Manual Lead 1."

If you cannot determine a meaningful query from the prompt, or if the query returns no results, inform the user.
""" + user_input}]
    
    response = ollama.chat(
        model='crm',
        messages=messages,
        tools=[get_the_mango],
        stream=False
    )

    # 🔍 Check if a tool was called
    if 'message' in response and 'tool_calls' in response['message']:
        for tool in response['message']['tool_calls']:
            function_name = tool['function']['name']
            arguments = tool['function']['arguments']

            # ✅ Execute corresponding Python function
            function_output = available_functions[function_name](**arguments)

            # 🎯 Send tool output back to LLM for summarization
            messages.append({
                "role": "tool",
                "content": json.dumps(function_output, default=str),
                # Removed "tool_call_id": tool['id'] as 'id' key might not exist
            })
            messages.append({
                "role": "user",
                "content": f"Based on the following data: {json.dumps(function_output, default=str)}, provide a human-readable summary of the lead information. If no data is provided, state that no leads were found."
            })

            final_response = ollama.chat(
                model='crm',
                messages=messages,
                stream=False
            )
            
            if 'message' in final_response and 'content' in final_response['message']:
                return {"message": final_response['message']['content']}
            else:
                return {"message": "Could not process the tool output."}

    # If no tool call triggered, return a default message or let the LLM respond directly
    if 'message' in response and 'content' in response['message']:
        return {"message": response['message']['content']}
    else:
        return {"message": "No tool call triggered and no direct response from AI."}

@app.post("/extract")
async def extract_data(file: UploadFile = File(...)):
    image_bytes = await file.read()

    prompt_message = (
        "Extract the name, email, and phone number (including country code) "
        "from this image. Provide the output as a JSON object with keys "
        "'name', 'email', and 'phone' (with country code). For example: "
        '{"name": "John Doe", "email": "john.doe@example.com", "phone": "+1234567890"}'
    )

    try:
        response = model.generate_content([
            {
                "mime_type": file.content_type,
                "data": image_bytes
            },
            prompt_message
        ])  
        response = response.text
        lines = response.strip("`").splitlines()
        output = "\n".join(lines[1:])

        json_output_str = output
        print("Gemini output:", json_output_str)

        extracted_data = json.loads(json_output_str)
        return JSONResponse(content=extracted_data)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/save_lead")
async def save_lead(lead: LeadData):
    try:
        lead_dict = lead.dict()
        result = await leads_collection.insert_one(lead_dict)
        return JSONResponse(content={"message": "Lead saved successfully", "id": str(result.inserted_id)})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/ask")
async def ask_user(input: PromptInput):
    result = process_prompt(input.user_input)
    return {"result": result}
