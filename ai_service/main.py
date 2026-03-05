import json
import re
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx # Import httpx
from ddgs import DDGS

app = FastAPI()

# Configuration for the LLM and DefectDojo API
LLM_BASE_URL = "http://lfk_llm:8001" # lfk_llm service running on port 8001
DEFECTDOJO_API_URL = "http://nginx:8080/api/v2" # DefectDojo API exposed via nginx

# DDGS instance
ddgs = DDGS()

def get_llm_url():
    """Returns the base URL for the LLM service."""
    return LLM_BASE_URL

class ChatMessage(BaseModel):
    content: str

class CWESuggestionRequest(BaseModel):
    cwe_numbers: list[int]

# Removed search_duckduckgo function

@app.get("/")
def read_root():
    return {"message": "AI Service is running", "llm_available": get_llm_url() is not None}

@app.post("/chat") # Renamed endpoint
async def chat_message(message: ChatMessage): # Changed input parameter
    llm_url = get_llm_url()
    if not llm_url:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "LLM model not configured"}
        )

    async with httpx.AsyncClient() as client:
        try:
            # OpenAI-compatible chat completions API
            response = await client.post(
                f"{llm_url}/v1/chat/completions",
                json={
                    "model": "feather.gguf", # Model name as per lfk_llm dockerhub
                    "messages": [
                        {"role": "user", "content": message.content}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 256
                },
                timeout=30.0
            )
            response.raise_for_status()
            llm_output = response.json()["choices"][0]["message"]["content"].strip()

            print(f"Raw LLM Output (chat):\n---\n{llm_output}\n---")

            return {"response": llm_output}

        except httpx.RequestError as e:
            print(f"HTTP request error to LLM service: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": f"Failed to connect to LLM service: {e}"}
            )
        except httpx.HTTPStatusError as e:
            print(f"HTTP status error from LLM service: {e.response.status_code} - {e.response.text}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": f"LLM service returned an error: {e.response.text}"}
            )
        except (KeyError, IndexError) as e:
            print(f"Error parsing LLM response: {e}. Full response: {response.json()}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": f"Error parsing LLM response: Invalid format {e}"}
            )
        except Exception as e:
            print(f"An unexpected error occurred in chat endpoint: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": f"An unexpected error occurred: {e}"}
            )

@app.post("/fetch_cwe_suggestions")
async def fetch_cwe_suggestions(request: CWESuggestionRequest):
    llm_url = get_llm_url()
    if not llm_url:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "LLM model not configured"}
        )

    # 1. Perform DDGS searches for each CWE
    ddgs_results_str = ""
    # Using a set to ensure unique CWE numbers for search, and converting back to list for consistent prompting
    unique_cwe_numbers = list(set(request.cwe_numbers))
    for cwe_num in unique_cwe_numbers:
        query = f"CWE-{cwe_num}: Common Weakness Enumeration fix suggestions"
        try:
            search_results = ddgs.text(query, max_results=3) # Limit results to avoid excessive context
            ddgs_results_str += f"\n--- Search results for CWE-{cwe_num} ---\n"
            for i, res in enumerate(search_results):
                ddgs_results_str += f"{i+1}. Title: {res.get('title')}\n   URL: {res.get('href')}\n   Snippet: {res.get('body')}\n"
            ddgs_results_str += "\n"
        except Exception as e:
            print(f"Error during DDGS search for CWE-{cwe_num}: {e}")
            ddgs_results_str += f"\n--- Error fetching search results for CWE-{cwe_num}: {e} ---\n\n"


    # 2. Construct prompt for LLM
    # Use system message for context, user message for the specific request
    prompt_messages = [
        {"role": "system", "content": "You are an expert in cybersecurity and software development. Your task is to provide clear, actionable fix suggestions for given Common Weakness Enumeration (CWE) vulnerabilities. You will be provided with search results from the web for these CWEs. Use this information to formulate detailed suggestions, including code examples if relevant, and categorize the severity (Critical, High, Medium, Low). The output MUST be a JSON array of suggestions, each with 'id' (integer, unique), 'severity' (string: Critical, High, Medium, Low), 'title' (string), 'description' (string), and 'code' (string, can be empty if no code example)."},
        {"role": "user", "content": f"Here are the search results for the identified CWEs:\n\n{ddgs_results_str}\n\nBased on these results, provide fix suggestions for the following CWEs: {', '.join([f'CWE-{num}' for num in unique_cwe_numbers])}. Ensure your response is a valid JSON array as described."}
    ]

    # 3. Call LLM service
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{llm_url}/v1/chat/completions",
                json={
                    "model": "feather.gguf",
                    "messages": prompt_messages,
                    "temperature": 0.7,
                    "max_tokens": 1024, # Increased max_tokens for detailed suggestions
                    "response_format": {"type": "json_object"} # Instruct LLM to output JSON
                },
                timeout=90.0 # Increased timeout for potentially longer LLM generation
            )
            response.raise_for_status()

            llm_raw_output = response.json()["choices"][0]["message"]["content"].strip()
            print(f"Raw LLM Output (fix suggestions):\n---\n{llm_raw_output}\n---")

            # 4. Parse LLM response (expecting JSON array)
            suggestions = json.loads(llm_raw_output)

            # Basic validation
            if not isinstance(suggestions, list):
                raise ValueError("LLM did not return a JSON array.")
            for s in suggestions:
                if not all(k in s for k in ["id", "severity", "title", "description", "code"]):
                    raise ValueError("LLM returned malformed suggestion JSON.")

            return {"suggestions": suggestions}

        except httpx.RequestError as e:
            print(f"HTTP request error to LLM service: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": f"Failed to connect to LLM service: {e}"}
            )
        except httpx.HTTPStatusError as e:
            print(f"HTTP status error from LLM service: {e.response.status_code} - {e.response.text}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": f"LLM service returned an error: {e.response.text}"}
            )
        except json.JSONDecodeError as e:
            print(f"Error decoding LLM JSON response: {e}. Raw: {llm_raw_output}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": f"LLM did not return valid JSON: {e}"}
            )
        except ValueError as e:
            print(f"LLM response content validation error: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": f"LLM response format error: {e}"}
            )
        except Exception as e:
            print(f"An unexpected error occurred in fix suggestions endpoint: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": f"An unexpected error occurred: {e}"}
            )
