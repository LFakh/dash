import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { cweNumbers } = await request.json();

    if (!cweNumbers || cweNumbers.length === 0) {
      return new Response(JSON.stringify({ error: 'No CWE numbers provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlApiKey) {
      return new Response(JSON.stringify({ error: 'Firecrawl API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cweResearch: Record<string, string> = {};

    for (const cweNum of cweNumbers) {
      const searchUrl = `https://cwe.mitre.org/data/definitions/${cweNum}.html`;

      const crawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchUrl,
          pageOptions: {
            onlyMainContent: true,
          },
        }),
      });

      if (!crawlResponse.ok) {
        const errorText = await crawlResponse.text();
        console.error(`Firecrawl error for CWE-${cweNum}:`, errorText);
        cweResearch[`CWE-${cweNum}`] = `Failed to fetch research data for CWE-${cweNum}`;
        continue;
      }

      const crawlData = await crawlResponse.json();
      const content = crawlData.data?.markdown || crawlData.data?.content || '';

      if (!content) {
        cweResearch[`CWE-${cweNum}`] = `No detailed information found for CWE-${cweNum}`;
        continue;
      }

      const summary = extractFixSummary(content, cweNum);
      cweResearch[`CWE-${cweNum}`] = summary;
    }

    return new Response(JSON.stringify({ success: true, data: cweResearch }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Research endpoint error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function extractFixSummary(content: string, cweNum: number): string {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  let summary = '';

  for (const line of lines) {
    if (
      line.toLowerCase().includes('mitigation') ||
      line.toLowerCase().includes('prevention') ||
      line.toLowerCase().includes('fix') ||
      line.toLowerCase().includes('remediation') ||
      line.toLowerCase().includes('solution')
    ) {
      summary += line + '\n';
    }
  }

  if (summary.trim().length === 0) {
    summary = lines.slice(0, 5).join('\n');
  }

  return summary.trim().substring(0, 500) || `CWE-${cweNum}: No specific mitigation found. Visit https://cwe.mitre.org/data/definitions/${cweNum}.html for details.`;
}
