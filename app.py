# api.py
from fastapi import FastAPI, Request
from pydantic import BaseModel
from main import process_prompt

app = FastAPI()

class PromptInput(BaseModel):
    user_input: str

@app.post("/chat")
async def chat_with_tool(input: PromptInput):
    result = process_prompt(input.user_input)
    return {"response": result}
