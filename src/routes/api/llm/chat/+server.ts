import { json } from '@sveltejs/kit';

// Define a type for the incoming chat message
interface ChatMessage {
  content: string;
}

// Handler for POST requests to this endpoint
export async function POST({ request }) {
  try {
    const chatMessage: ChatMessage = await request.json();

    // Send the chat message directly to the AI service's new /chat endpoint
    const aiServiceResponse = await fetch('http://ai_service:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatMessage) // Send { content: "user message" }
    });

    if (!aiServiceResponse.ok) {
      const errorText = await aiServiceResponse.text();
      throw new Error(`AI Service responded with status ${aiServiceResponse.status}: ${errorText}`);
    }

    const aiServiceJson = await aiServiceResponse.json();
    console.log('Raw AI Service Response:', aiServiceJson);

    // The AI service is expected to return a simple { response: "LLM text" }
    return json(aiServiceJson);

  } catch (error: any) {
    console.error('Error in LLM chat endpoint:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
