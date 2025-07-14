from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
# import google.generativeai as genai # Removed as per edit hint
import json
import os
import ollama
from typing import Dict, Callable, TypedDict
from langchain_ollama import OllamaLLM
# from ti import get_date # Assuming ti.py exists and is accessible
from pymongo import MongoClient
import ast
import logging
from langgraph.graph import StateGraph, END
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio

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
database = client.test
leads_collection = database.get_collection("leads")

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

# Uncomment Gemini imports and model setup for document extraction
import google.generativeai as genai
# Restore Gemini model setup
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

class LeadData(BaseModel):
    name: str
    email: str
    phone: str
    source: str = "document/image" # Default source

from typing import Optional # Import Optional

class PromptInput(BaseModel):
    user_input: str
    lead_data: Optional[Dict] = None # Add optional lead_data field

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
- dateContacted (ISO datetime string)
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
def process_prompt(user_input, lead_data=None): # Added lead_data parameter
    # Handle simple greetings
    if user_input.lower() in ["hi", "hello", "hey", "greetings"]:
        if lead_data:
            return {"message": f"Hello! How can I help you with {lead_data.get('name', 'this lead')} today?"}
        else:
            return {"message": "Hello! How can I help you with your leads today?"}

    messages = []
    tools_to_use = []

    if lead_data:
        # If lead_data is provided, set the context for individual lead chat
        messages.append({"role": "system", "content": f"You are chatting about the following lead: {json.dumps(lead_data, default=str)}. Focus your responses solely on this lead's information and the user's prompt. Do not attempt to query the database for other leads."})
        # For individual lead chat, do not provide the get_the_mango tool
        tools_to_use = []
    else:
        # General chat context
        messages.append({"role": "system", "content": """You are a helpful assistant that can retrieve lead information from a MongoDB database.
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
- dateContacted (ISO datetime string)

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
"""})
        tools_to_use = [get_the_mango]

    messages.append({"role": "user", "content": user_input})
    
    response = ollama.chat(
        model='crm',
        messages=messages,
        tools=tools_to_use, # Use the conditionally set tools
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
                # Attempt to parse JSON if the content looks like a JSON string
                try:
                    parsed_content = json.loads(final_response['message']['content'])
                    # If it's a list of dicts (like lead data), format it nicely
                    if isinstance(parsed_content, list) and all(isinstance(item, dict) for item in parsed_content):
                        formatted_output = "Here are the lead details:\n"
                        for lead in parsed_content:
                            formatted_output += f"- Name: {lead.get('name', 'N/A')}, Email: {lead.get('email', 'N/A')}, Phone: {lead.get('phone', 'N/A')}, Status: {lead.get('status', 'N/A')}, Source: {lead.get('source', 'N/A')}\n"
                        return {"message": formatted_output}
                    else:
                        return {"message": final_response['message']['content']}
                except json.JSONDecodeError:
                    # If not JSON, return as is
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
        print(json_output_str)
        extracted_data = json.loads(json_output_str)
        
        # Add source and save to database
        extracted_data["source"] = "Document"
        result = await leads_collection.insert_one(extracted_data)
        
        return JSONResponse(content={"message": "Lead extracted and saved successfully", "id": str(result.inserted_id)})
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

# --- Workflow Automation State and Tools ---
FROM_EMAIL = "demo.mail.3112@gmail.com"
APP_PASSWORD = "vhnj scsa evop rvxb"  # Replace with your Gmail app password

# Workflow state
NODES = {}
EDGES = []
ENTRY = "lead"

class WorkflowState(TypedDict):
    email: str
    whatsapp: str

async def lead_tool(state):
    print("🎯 Lead captured")
    # Get latest lead
    latest = await leads_collection.find_one(
        {},
        {"_id": 0, "name": 1, "email": 1, "phone": 1},
        sort=[("createdAt", -1)]
    )
    if not latest:
        print("⚠ No lead found")
        return {"email": None, "whatsapp": None}
    print("✅ Lead:", latest)
    return {
        "email": latest.get("email"),
        "whatsapp": latest.get("phone")
    }

def send_email_tool(state):
    to_email = state.get("email")
    print(f"📧 Sending email to: {to_email}")
    subject = "This is the mail you needed from our demo"
    body = f"""
    Hi,
    Hope you're doing well! 😊
    This is an automated email sent via CRM.
    Please select us if you like it.
    We will look for fulltime too.
    Cheers,
    Our Team
    """
    message = MIMEMultipart()
    message['From'] = FROM_EMAIL
    message['To'] = to_email
    message['Subject'] = subject
    message.attach(MIMEText(body, 'plain'))
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(FROM_EMAIL, APP_PASSWORD)
        server.send_message(message)
        server.quit()
        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
    return state

def send_whatsapp_tool(state: WorkflowState) -> WorkflowState:
    print(f"📱 Sending WhatsApp to: {state.get('whatsapp')}")
    return state

class NodeDef(BaseModel):
    id: str
    type: str

class GraphUpdate(BaseModel):
    nodes: list[NodeDef]
    edges: list[list[str]]
    entry: str

@app.post("/update-graph")
async def update_graph(data: GraphUpdate):
    global NODES, EDGES, ENTRY
    NODES.clear()
    NODES["lead"] = lead_tool  # always include lead
    for node in data.nodes:
        if node.type == "email":
            NODES[node.id] = send_email_tool
        elif node.type == "whatsapp":
            NODES[node.id] = send_whatsapp_tool
    EDGES = data.edges
    ENTRY = data.entry
    print("✅ Graph updated:")
    print("Nodes:", list(NODES.keys()))
    print("Edges:", EDGES)
    print("Entry:", ENTRY)
    return {"status": "Graph updated"}

@app.post("/run")
async def run_graph():
    try:
        if "lead" not in NODES:
            print("⚠ lead not found in NODES, injecting default...")
            NODES["lead"] = lead_tool
        graph = StateGraph(WorkflowState)
        for node_id, fn in NODES.items():
            graph.add_node(node_id, fn)
        for source, target in EDGES:
            graph.add_edge(source, target)
        graph.set_entry_point(ENTRY)
        if NODES:
            graph.add_edge(list(NODES.keys())[-1], END)
        print("✅ Final nodes:", list(NODES.keys()))
        print("✅ Final edges:", EDGES)
        runnable = graph.compile()
        # Run the workflow asynchronously
        result = await runnable.ainvoke({"email": "", "whatsapp": ""})
        return {"status": "executed", "log": "done", "output": result}
    except Exception as e:
        print(f"❌ Workflow execution error: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/ask")
async def ask_user(input: PromptInput):
    result = process_prompt(input.user_input, input.lead_data)
    # Always return a dict with a 'message' property
    if isinstance(result, str):
        return {"result": {"message": result}}
    elif isinstance(result, dict) and "message" in result:
        return {"result": result}
    else:
        return {"result": {"message": str(result)}}
