from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import google.generativeai as genai
import json
import os

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

@app.post("/extract")
async def extract_data(file: UploadFile = File(...)):
    image_bytes = await file.read()

    prompt_message = (
        "Extract the name, email, and phone number (including country code) "
        "from this image. Provide the output as a JSON object with keys "
        "'name', 'email', and 'phone'. For example: "
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
