import { json } from '@sveltejs/kit';

// Define a type for the incoming chat message
interface ChatMessage {
  content: string;
}

// Handler for POST requests to this endpoint
export async function POST({ request }) {
  try {
    const chatMessage: ChatMessage = await request.json();

    // Send the chat message directly to the lfk_llm service's OpenAI-compatible endpoint
    const llmServiceResponse = await fetch('http://lfk_llm:8001/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "model": "feather.gguf", // Model name as per lfk_llm dockerhub, or any placeholder if not strictly enforced
        "messages": [
          {"role": "user", "content": chatMessage.content}
        ],
        "temperature": 0.7,
        "max_tokens": 512
      })
    });

    if (!llmServiceResponse.ok) {
      const errorText = await llmServiceResponse.text();
      throw new Error(`LLM Service responded with status ${llmServiceResponse.status}: ${errorText}`);
    }

    const llmServiceJson = await llmServiceResponse.json();
    console.log('Raw LLM Service Response:', llmServiceJson);

    // The lfk_llm service (llama.cpp) is expected to return OpenAI-compatible JSON
    return json({ response: llmServiceJson.choices[0].message.content.trim() });

  } catch (error: any) {
    console.error('Error in LLM chat endpoint:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
