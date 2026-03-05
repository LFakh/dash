<script lang="ts">
  interface Suggestion {
    id: number;
    severity: string;
    title: string;
    description: string;
    code: string;
  }

  export let cweNumbers: number[] = []; // Prop to receive CWE numbers from parent

  let suggestions: Suggestion[] = [];
  let selectedSuggestion: Suggestion | null = null;
  let isLoading = false;
  let error: string | null = null;

  // Function to fetch fix suggestions from the AI service
  async function fetchFixSuggestions() {
    if (cweNumbers.length === 0) {
      suggestions = [];
      selectedSuggestion = null;
      error = null;
      return;
    }

    isLoading = true;
    error = null;
    suggestions = []; // Clear previous suggestions

    try {
      const response = await fetch('http://localhost:8000/fetch_cwe_suggestions', { // Assuming AI service is accessible via localhost:8000 from SvelteKit dev server
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cwe_numbers: cweNumbers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.suggestions) {
        suggestions = data.suggestions;
        // Automatically select the first suggestion if available
        if (suggestions.length > 0) {
          selectedSuggestion = suggestions[0];
        } else {
          selectedSuggestion = null;
        }
      } else {
        suggestions = [];
        selectedSuggestion = null;
        error = "No suggestions received or invalid format.";
      }

    } catch (e: any) {
      console.error("Failed to fetch fix suggestions:", e);
      error = `Failed to fetch fix suggestions: ${e.message}`;
      suggestions = [];
      selectedSuggestion = null;
    } finally {
      isLoading = false;
    }
  }

  // Reactive statement to re-fetch suggestions when cweNumbers changes
  $: if (cweNumbers && cweNumbers.length > 0) {
    fetchFixSuggestions();
  } else if (cweNumbers && cweNumbers.length === 0) {
    // Clear suggestions if no CWE numbers are provided
    suggestions = [];
    selectedSuggestion = null;
    error = null;
  }
</script>

<div class="fix-suggestions">
  <div class="suggestions-header">
    <h3 class="suggestions-title">LLM Findings Fix Suggestions</h3>
    {#if isLoading}
      <span class="loading-indicator">Loading...</span>
    {:else if error}
      <span class="error-indicator">Error: {error}</span>
    {/if}
  </div>

  <div class="suggestions-list">
    {#if suggestions.length > 0}
      {#each suggestions as suggestion}
        <button
          class="suggestion-item {selectedSuggestion?.id === suggestion.id ? 'active' : ''}"
          on:click={() => selectedSuggestion = suggestion}
        >
          <span class="severity-badge {suggestion.severity.toLowerCase()}">{suggestion.severity}</span>
          <span class="suggestion-title">{suggestion.title}</span>
        </button>
      {/each}
    {:else if !isLoading && !error}
      <div class="suggestion-detail no-suggestions">
        <p>No fix suggestions available at this time.</p>
      </div>
    {/if}
  </div>

  {#if selectedSuggestion}
    <div class="suggestion-detail">
      <h4 class="detail-title">{selectedSuggestion.title}</h4>
      <p class="detail-description">{selectedSuggestion.description}</p>
      <div class="code-block">
        <pre><code>{selectedSuggestion.code}</code></pre>
      </div>
    </div>
  {:else if !isLoading && !error && suggestions.length === 0}
    <div class="suggestion-detail no-suggestions">
      <p>No fix suggestions available at this time.</p>
    </div>
  {/if}
</div>

<style>
  .fix-suggestions {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 400px;
  }

  .suggestions-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 2px solid #ecf0f1;
  }

  .suggestions-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .suggestions-list {
    padding: 1rem;
    border-bottom: 2px solid #ecf0f1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .suggestion-item {
    padding: 0.9rem 1rem;
    background: #f8f9fa;
    border: 2px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s;
    text-align: left;
  }

  .suggestion-item:hover {
    background: #e9ecef;
  }

  .suggestion-item.active {
    background: #e3f2fd;
    border-color: #3498db;
  }

  .severity-badge {
    padding: 0.3rem 0.7rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .severity-badge.critical {
    background-color: #fee;
    color: #c0392b;
  }

  .severity-badge.high {
    background-color: #fff3e0;
    color: #e67e22;
  }

  .suggestion-detail {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
  }

  .detail-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.75rem;
  }

  .detail-description {
    font-size: 0.95rem;
    color: #7f8c8d;
    line-height: 1.6;
    margin-bottom: 1.25rem;
  }

  .code-block {
    background-color: #2c3e50;
    border-radius: 6px;
    padding: 1.25rem;
    overflow-x: auto;
  }

  .code-block pre {
    margin: 0;
  }

  .code-block code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.85rem;
    color: #ecf0f1;
    line-height: 1.5;
  }

  .no-suggestions {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #7f8c8d;
    font-size: 1.1rem;
  }
  .loading-indicator {
    margin-left: 1rem;
    color: #3498db;
    font-weight: 500;
  }

  .error-indicator {
    margin-left: 1rem;
    color: #e74c3c;
    font-weight: 500;
  }
</style>
