import { json } from '@sveltejs/kit';
// No need for node-fetch explicitly as SvelteKit's fetch is capable, or native fetch in Node.js >= 18
// No need for ddgs as search is handled by ai_service

// Define a type for the incoming vulnerability data
interface VulnerabilityData {
  description: string;
  severity: string;
  cwe: string | null;
}

// Handler for POST requests to this endpoint
export async function POST({ request }) {
  try {
    const vulnerability: VulnerabilityData = await request.json();

    // Send the vulnerability data directly to the AI service
    // The 'ai_service' will handle the DuckDuckGo search and LLM interaction
    const aiServiceResponse = await fetch('http://ai_service:8000/prioritize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vulnerability)
    });

    if (!aiServiceResponse.ok) {
      const errorText = await aiServiceResponse.text();
      throw new Error(`AI Service responded with status ${aiServiceResponse.status}: ${errorText}`);
    }

    const aiServiceJson = await aiServiceResponse.json();
    console.log('Raw AI Service Response:', aiServiceJson);

    // The AI service is expected to return the parsed JSON directly
    return json(aiServiceJson);

  } catch (error: any) {
    console.error('Error in LLM prioritization endpoint:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
