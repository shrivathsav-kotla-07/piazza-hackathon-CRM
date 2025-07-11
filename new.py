from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import google.generativeai as genai
from google.generativeai import types
import json

app = FastAPI()

# Initialize Gemini
genai.configure(api_key="AIzaSyCNyDVTFKx-1YwEDCbdW05fQsy8BKQ35C0")
model = genai.GenerativeModel('gemini-1.5-flash')

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
