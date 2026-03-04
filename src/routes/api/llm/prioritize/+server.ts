import { json } from '@sveltejs/kit';
import fetch from 'node-fetch'; // Use node-fetch for compatibility
import { DDGS } from 'ddgs'; // Node.js DuckDuckGo search library

// Initialize DDGS once
const ddgs = new DDGS();

// Define a type for the incoming vulnerability data
interface VulnerabilityData {
  description: string;
  severity: string;
  cwe: string | null;
}

// Function to perform DuckDuckGo search
async function searchDuckDuckGo(query: string, numResults: number = 3): Promise<string> {
  try {
    const results = await ddgs.text(query, { count: numResults }); // Use ddgs.text and count option
    const formattedResults = results.map((r, i) => `Result ${i + 1}: ${r.title}
URL: ${r.href}
Snippet: ${r.body}
---`);
    return `External Context from web search:
${formattedResults.join('
')}`;
  } catch (error) {
    console.error('Error during DuckDuckGo search:', error);
    return 'External Context from web search: No external context found.';
  }
}

// Handler for POST requests to this endpoint
export async function POST({ request }) {
  try {
    const { description, severity, cwe }: VulnerabilityData = await request.json();

    // Perform DuckDuckGo search
    const searchQuery = `${description} security vulnerability ${cwe ? `CWE ${cwe}` : ''}`;
    const externalContext = await searchDuckDuckGo(searchQuery);

    // Construct the LLM prompt
    const prompt = `You are an expert vulnerability analyst in a DevSecOps team. Your task is to analyze vulnerability findings and assign a new priority based on the provided details, considering external context.

Given the following vulnerability details:
- Description: ${description}
- Reported Severity: ${severity}
- CWE (Common Weakness Enumeration): ${cwe || 'N/A'}

${externalContext}

Based on the vulnerability details and the external context, please determine the most appropriate priority from the following categories: Critical, High, Medium, Low, Informational.
Also, provide a concise justification (1-2 sentences) for your assigned priority, referencing the external context if applicable.

Your response MUST be a JSON object with two keys: "new_priority" and "justification". Do not include any other text or formatting outside the JSON object.

Example Output:
{
  "new_priority": "High",
  "justification": "This vulnerability allows unauthenticated remote code execution due to improper input sanitization, as confirmed by external resources describing similar CWEs."
}`;

    // Prepare payload for llama-server (OpenAI compatible API)
    const llmPayload = {
      model: "llama-server", // Or whatever model name llama-cpp-python server uses
      messages: [
        { role: "system", content: "You are an expert vulnerability analyst." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    };

    // Send request to llama-server
    // The 'lfk_llm' service is accessible via its service name within the Docker network
    const llmResponse = await fetch('http://lfk_llm:8000/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(llmPayload)
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      throw new Error(`LLM server responded with status ${llmResponse.status}: ${errorText}`);
    }

    const llmJson = await llmResponse.json();
    console.log('Raw LLM Response:', llmJson);

    // Extract LLM's response
    const llmOutput = llmJson.choices[0]?.message?.content;

    if (!llmOutput) {
        throw new Error('LLM did not return a valid message content.');
    }

    // Attempt to parse the JSON string from LLM output
    const jsonMatch = llmOutput.match(/\{[^]*\}/); // Regex to find a JSON object
    if (!jsonMatch) {
        throw new Error('LLM output does not contain a valid JSON object.');
    }
    
    const parsedLLMResponse = JSON.parse(jsonMatch[0]);

    return json(parsedLLMResponse);

  } catch (error: any) {
    console.error('Error in LLM prioritization endpoint:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
