import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Define a type for the incoming vulnerability data
interface Vulnerability {
  description: string;
  severity: string;
  cwe: string;
}

// Handler for POST requests to this endpoint
export const POST: RequestHandler = async ({ request }) => {
  try {
    const vulnerability: Vulnerability = await request.json();

    // Send the vulnerability data to the AI service's prioritize endpoint
    const aiServiceResponse = await fetch('http://ai_service:8000/prioritize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vulnerability)
    });

    if (!aiServiceResponse.ok) {
      const errorText = await aiServiceResponse.text();
      console.error(`AI Service responded with status ${aiServiceResponse.status}: ${errorText}`);
      throw new Error(`AI Service error: ${errorText}`);
    }

    const prioritizationData = await aiServiceResponse.json();
    console.log('Prioritization Data from AI Service:', prioritizationData);

    // The AI service is expected to return JSON with new_priority and justification
    // Directly return this to the frontend
    return json(prioritizationData);

  } catch (error: any) {
    console.error('Error in LLM prioritization endpoint:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
};
