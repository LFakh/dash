<script lang="ts">
  interface Suggestion {
    id: number;
    severity: string;
    title: string;
    description: string;
    code: string;
  }

  interface ProcessingStep {
    name: string;
    status: 'pending' | 'running' | 'complete' | 'error';
    error?: string;
  }

  export let cweNumbers: number[] = [];

  let suggestions: Suggestion[] = [];
  let selectedSuggestion: Suggestion | null = null;
  let isLoading = false;
  let error: string | null = null;
  let processingSteps: ProcessingStep[] = [
    { name: 'Initializing Request', status: 'pending' },
    { name: 'Contacting LLM Service', status: 'pending' },
    { name: 'Processing Response', status: 'pending' },
    { name: 'Formatting Results', status: 'pending' }
  ];
  let manualStart = false;

  async function fetchFixSuggestions() {
    if (cweNumbers.length === 0) {
      suggestions = [];
      selectedSuggestion = null;
      error = null;
      return;
    }

    isLoading = true;
    error = null;
    suggestions = [];
    processingSteps = [
      { name: 'Initializing Request', status: 'pending' },
      { name: 'Contacting LLM Service', status: 'pending' },
      { name: 'Processing Response', status: 'pending' },
      { name: 'Formatting Results', status: 'pending' }
    ];

    try {
      processingSteps[0].status = 'running';
      processingSteps = processingSteps;

      await new Promise(resolve => setTimeout(resolve, 300));

      processingSteps[0].status = 'complete';
      processingSteps[1].status = 'running';
      processingSteps = processingSteps;

      const prompt = `How to fix these CWE: ${cweNumbers.join(', ')}. Please provide specific fix suggestions for each CWE with code examples.`;

      const response = await fetch('https://free-api.cveoy.top/v3/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      processingSteps[1].status = 'complete';
      processingSteps[2].status = 'running';
      processingSteps = processingSteps;

      const reader = response.body.getReader();
      let fullMessage = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const message = new TextDecoder().decode(value);
        fullMessage += message;
      }

      processingSteps[2].status = 'complete';
      processingSteps[3].status = 'running';
      processingSteps = processingSteps;

      if (fullMessage.includes("wxgpt@qq.com")) {
        fullMessage = fullMessage.replace("欢迎使用 公益站! 站长合作邮箱：wxgpt@qq.com", "");
      }

      const charMap = {
        '￠': 'à',
        '￩': 'é',
      };

      fullMessage = fullMessage.replace(/[￠￩]/g, function(match) {
        return charMap[match];
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      if (fullMessage.trim()) {
        suggestions = [{
          id: 1,
          severity: 'High',
          title: `Fix Suggestions for CWE: ${cweNumbers.join(', ')}`,
          description: 'LLM-generated fix suggestions for the identified CWE vulnerabilities.',
          code: fullMessage.trim()
        }];

        selectedSuggestion = suggestions[0];
        processingSteps[3].status = 'complete';
      } else {
        processingSteps[3].status = 'error';
        processingSteps[3].error = 'No response from LLM';
        processingSteps = processingSteps;
        throw new Error("No suggestions received from LLM.");
      }

    } catch (e: any) {
      console.error("Failed to fetch fix suggestions:", e);
      error = `Failed to fetch fix suggestions: ${e.message}`;
      suggestions = [];
      selectedSuggestion = null;

      const currentStepIndex = processingSteps.findIndex(s => s.status === 'running');
      if (currentStepIndex >= 0) {
        processingSteps[currentStepIndex].status = 'error';
        processingSteps[currentStepIndex].error = e.message;
      }
    } finally {
      isLoading = false;
      processingSteps = processingSteps;
    }
  }

  function handleStartClick() {
    if (cweNumbers.length === 0) {
      error = "No CWE numbers available to process.";
      return;
    }
    manualStart = false;
    fetchFixSuggestions();
  }

  $: if (cweNumbers && cweNumbers.length > 0 && !manualStart) {
    manualStart = true;
  } else if (cweNumbers && cweNumbers.length === 0) {
    suggestions = [];
    selectedSuggestion = null;
    error = null;
    manualStart = false;
  }
</script>

<div class="fix-suggestions">
  <div class="suggestions-header">
    <div class="header-top">
      <h3 class="suggestions-title">LLM Findings Fix Suggestions</h3>
      {#if !isLoading && cweNumbers.length > 0 && suggestions.length === 0}
        <button class="start-button" on:click={handleStartClick} disabled={isLoading}>
          <span class="button-text">Start Analysis</span>
        </button>
      {/if}
    </div>
    {#if isLoading}
      <span class="loading-indicator">Processing...</span>
    {:else if error}
      <span class="error-indicator">Error: {error}</span>
    {/if}
  </div>

  {#if isLoading}
    <div class="processing-container">
      <div class="processing-steps">
        {#each processingSteps as step, index}
          <div class="step {step.status}">
            <div class="step-indicator">
              {#if step.status === 'pending'}
                <span class="dot"></span>
              {:else if step.status === 'running'}
                <span class="spinner"></span>
              {:else if step.status === 'complete'}
                <span class="checkmark">✓</span>
              {:else if step.status === 'error'}
                <span class="error-mark">✕</span>
              {/if}
            </div>
            <div class="step-content">
              <p class="step-name">{step.name}</p>
              {#if step.error}
                <p class="step-error">{step.error}</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

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
    {:else if !isLoading && !error && cweNumbers.length === 0}
      <div class="suggestion-detail no-suggestions">
        <p>No CWE findings available. Run a scan first.</p>
      </div>
    {:else if !isLoading && !error && cweNumbers.length > 0}
      <div class="suggestion-detail no-suggestions">
        <p>Click "Start Analysis" to generate fix suggestions.</p>
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
      <p>Results will appear here after analysis completes.</p>
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

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .suggestions-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .start-button {
    padding: 0.6rem 1.2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .start-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .start-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .start-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .button-text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .processing-container {
    flex: 1;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #f9fbfc 100%);
  }

  .processing-steps {
    width: 100%;
    max-width: 400px;
  }

  .step {
    display: flex;
    gap: 1.2rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .step.pending {
    background: #f8f9fa;
  }

  .step.running {
    background: #e8f4fd;
  }

  .step.complete {
    background: #e8f5e9;
  }

  .step.error {
    background: #ffebee;
  }

  .step-indicator {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: 600;
  }

  .step.pending .step-indicator {
    background: #e0e0e0;
  }

  .step.running .step-indicator {
    background: #42a5f5;
  }

  .step.complete .step-indicator {
    background: #66bb6a;
    color: white;
  }

  .step.error .step-indicator {
    background: #ef5350;
    color: white;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: #999;
    border-radius: 50%;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .checkmark {
    font-size: 1.2rem;
    color: white;
  }

  .error-mark {
    font-size: 1.2rem;
    color: white;
  }

  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .step-name {
    margin: 0;
    font-weight: 500;
    color: #2c3e50;
    font-size: 0.95rem;
  }

  .step.pending .step-name {
    color: #999;
  }

  .step.running .step-name {
    color: #1976d2;
  }

  .step.complete .step-name {
    color: #2e7d32;
  }

  .step.error .step-name {
    color: #c62828;
  }

  .step-error {
    margin: 0.3rem 0 0 0;
    font-size: 0.85rem;
    color: #d32f2f;
    font-weight: 500;
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
    margin-top: 0.75rem;
    color: #3498db;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .error-indicator {
    margin-top: 0.75rem;
    color: #e74c3c;
    font-weight: 500;
    font-size: 0.9rem;
  }
</style>
