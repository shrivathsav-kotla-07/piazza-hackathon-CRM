# api.py
from fastapi import FastAPI
from pydantic import BaseModel
from main_logic import process_prompt
import ollama
import json
from typing import Dict, Callable
from langchain_ollama import OllamaLLM
from ti import get_date  # This is the actual function returning formatted date
from pymongo import MongoClient
import json
import ast  # for

app = FastAPI()

class PromptInput(BaseModel):
    user_input: str

@app.post("/ask")
async def ask_user(input: PromptInput):
    result = process_prompt(input.user_input)
    return {"result": result}
