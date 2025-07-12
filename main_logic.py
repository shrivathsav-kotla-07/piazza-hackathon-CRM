import ollama
import json
from typing import Dict, Callable
from langchain_ollama import OllamaLLM
from ti import get_date  # This is the actual function returning formatted date
from pymongo import MongoClient
import json
import ast  # for safe string-to-dict conversion

def get_data(query):
    try:
        # 🧠 Convert to dict only if it's a string
        if isinstance(query, str):
            query = ast.literal_eval(query)
        elif not isinstance(query, dict):
            return {"error": f"Query must be a dict or string representing a dict, not {type(query).__name__}"}
    except Exception as e:
        return {"error": f"Invalid query format: {e}"}

    # ✅ Now query is a dictionary
    client = MongoClient("mongodb://localhost:27017/")
    db = client["CRM_h"]
    collection = db["CRM"]

    results = collection.find(query, {"_id": 0})
    return list(results)

# 🛠️ Tool schema for get_data (MongoDB)
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
                    'description': 'MongoDB query dictionary to match data send only in dict formate . Example: {"name": "rithwik"}',
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
    messages = [{"role": "user", "content": user_input}]
    
    response = ollama.chat(
        model='llama3.2',
        messages=messages,
        tools=[get_the_mango],  # ✅ Register both tools
        stream=False
    )


    # 🔍 Check if a tool was called
    if 'message' in response and 'tool_calls' in response['message']:
        for tool in response['message']['tool_calls']:
            function_name = tool['function']['name']
            arguments = tool['function']['arguments']

            # ✅ Execute corresponding Python function
            function_output = available_functions[function_name](**arguments)

            # 🎯 Output result
            print(json.dumps(function_output, indent=4, default=str))
            return function_output

    return {"message": "No tool call triggered."}

