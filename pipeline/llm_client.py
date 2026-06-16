import os
import time
from typing import Dict, Any, Tuple
import openai
from openai import OpenAI
import json

class LLMClient:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.client = self._init_client(model_name)

    def _init_client(self, model_name: str) -> OpenAI:
        """Initializes the appropriate client based on the model name format."""
        if model_name.startswith("local/"):
            # Use LM Studio
            api_key = os.getenv("LMSTUDIO_API_KEY", "lm-studio")
            base_url = os.getenv("LMSTUDIO_BASE_URL", "http://localhost:1234/v1")
            return OpenAI(base_url=base_url, api_key=api_key)
        else:
            # Use OpenRouter
            api_key = os.getenv("OPENROUTER_API_KEY")
            if not api_key:
                raise ValueError("OPENROUTER_API_KEY environment variable is not set")
            base_url = "https://openrouter.ai/api/v1"
            return OpenAI(
                base_url=base_url,
                api_key=api_key,
                default_headers={
                    "HTTP-Referer": "http://localhost",
                    "X-Title": "CSPM AI Analysis"
                }
            )

    def analyze(self, system_prompt: str, user_prompt: str, image_base64: str = None) -> Tuple[Dict[str, Any], Dict[str, Any], str]:
        """
        Sends the prompt to the LLM and returns the parsed JSON response along with token usage metrics.
        """
        model_id = self.model_name.replace("local/", "")
        
        user_content = []
        if image_base64:
            user_content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{image_base64}"
                }
            })
        user_content.append({"type": "text", "text": user_prompt})
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content if image_base64 else user_prompt}
        ]
        
        start_time = time.time()
        
        # Only use json_object for OpenRouter. LM Studio may not support it or requires json_schema
        response = None
        error_type = "NONE"
        try:
            if self.model_name.startswith("local/"):
                response = self.client.chat.completions.create(
                    model=model_id,
                    messages=messages,
                    temperature=0.1
                )
            else:
                response = self.client.chat.completions.create(
                    model=model_id,
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=0.1,
                    timeout=120.0
                )
        except openai.APITimeoutError as e:
            print(f"Warning: model {model_id} timed out. Error: {e}")
            error_type = "TIMEOUT"
        except Exception as e:
            # Fallback without json_object if model doesn't support it
            print(f"Warning: model {model_id} threw an error. Retrying without response_format. Error: {e}")
            try:
                kwargs = {
                    "model": model_id,
                    "messages": messages,
                    "temperature": 0.1
                }
                if not self.model_name.startswith("local/"):
                    kwargs["timeout"] = 120.0
                response = self.client.chat.completions.create(**kwargs)
            except openai.APITimeoutError as e2:
                print(f"Error: model {model_id} timed out completely. Error: {e2}")
                error_type = "TIMEOUT"
            except Exception as e2:
                print(f"Error: model {model_id} failed completely. Error: {e2}")
                error_type = "API_ERROR"

        latency = time.time() - start_time
        
        if not response or not getattr(response, "choices", None):
            if error_type == "NONE":
                error_type = "API_ERROR"
            metrics = {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "latency_seconds": round(latency, 2),
                "parsing_success": False,
                "error_type": error_type
            }
            return {"error": "API Request Failed or empty response"}, metrics, "API_FAILURE"
        
        content = response.choices[0].message.content or ""
        usage = response.usage
        
        # Clean potential markdown fences from the response
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        try:
            parsed_json = json.loads(content)
            parsing_success = True
        except json.JSONDecodeError:
            parsed_json = {"raw_output": content, "error": "Failed to parse JSON"}
            parsing_success = False

        metrics = {
            "prompt_tokens": usage.prompt_tokens if usage else 0,
            "completion_tokens": usage.completion_tokens if usage else 0,
            "latency_seconds": round(latency, 2),
            "parsing_success": parsing_success,
            "error_type": error_type
        }
        
        return parsed_json, metrics, response.choices[0].message.content or ""
