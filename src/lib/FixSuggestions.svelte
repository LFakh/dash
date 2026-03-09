<script lang="ts">
  interface CWESolution {
    cweId: number;
    solution: string;
  }

  interface ProcessingStep {
    name: string;
    status: 'pending' | 'running' | 'complete' | 'error';
    error?: string;
  }

  export let cweNumbers: number[] = [];

  let cweSolutions: CWESolution[] = [];
  let expandedCWE: number | null = null;
  let isLoading = false;
  let error: string | null = null;
  let processingSteps: ProcessingStep[] = [
    { name: 'Initializing Request', status: 'pending' },
    { name: 'Researching CWE Data', status: 'pending' },
    { name: 'Fetching Solutions', status: 'pending' },
    { name: 'Formatting Results', status: 'pending' }
  ];
  let manualStart = false;

  async function fetchFixSuggestions() {
    if (cweNumbers.length === 0) {
      cweSolutions = [];
      error = null;
      return;
    }

    isLoading = true;
    error = null;
    cweSolutions = [];
    expandedCWE = null;
    processingSteps = [
      { name: 'Initializing Request', status: 'pending' },
      { name: 'Researching CWE Data', status: 'pending' },
      { name: 'Fetching Solutions', status: 'pending' },
      { name: 'Formatting Results', status: 'pending' }
    ];

    try {
      processingSteps[0].status = 'running';
      processingSteps = processingSteps;

      await new Promise(resolve => setTimeout(resolve, 300));

      processingSteps[0].status = 'complete';
      processingSteps[1].status = 'running';
      processingSteps = processingSteps;

      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cweNumbers: cweNumbers,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      processingSteps[1].status = 'complete';
      processingSteps[2].status = 'running';
      processingSteps = processingSteps;

      const researchData = await response.json();

      if (!researchData.success || !researchData.data) {
        throw new Error("Failed to retrieve research data");
      }

      processingSteps[2].status = 'complete';
      processingSteps[3].status = 'running';
      processingSteps = processingSteps;

      cweSolutions = Object.entries(researchData.data).map(([cweKey, solution], index) => ({
        cweId: parseInt(cweKey.replace('CWE-', '')),
        solution: solution as string
      }));

      if (cweSolutions.length > 0) {
        expandedCWE = cweSolutions[0].cweId;
        processingSteps[3].status = 'complete';
      } else {
        processingSteps[3].status = 'error';
        processingSteps[3].error = 'No solutions retrieved';
        processingSteps = processingSteps;
        throw new Error("No solutions received");
      }

    } catch (e: any) {
      console.error("Failed to fetch fix suggestions:", e);
      error = `Failed to fetch fix suggestions: ${e.message}`;
      cweSolutions = [];

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

  function downloadJSON() {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      cweCount: cweSolutions.length,
      solutions: cweSolutions.reduce((acc, item) => {
        acc[`CWE-${item.cweId}`] = item.solution;
        return acc;
      }, {} as Record<string, string>)
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cwe-solutions-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    cweSolutions = [];
    expandedCWE = null;
    error = null;
    manualStart = false;
  }
</script>

<div class="fix-suggestions">
  <div class="suggestions-header">
    <div class="header-top">
      <h3 class="suggestions-title">LLM Findings Fix Suggestions</h3>
      {#if !isLoading && cweNumbers.length > 0 && cweSolutions.length === 0}
        <button class="start-button" on:click={handleStartClick} disabled={isLoading}>
          <span class="button-text">Start Analysis</span>
        </button>
      {:else if !isLoading && cweSolutions.length > 0}
        <button class="save-button" on:click={downloadJSON}>
          <span class="button-text">Save as JSON</span>
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
  {:else if cweSolutions.length > 0}
    <div class="solutions-container">
      {#each cweSolutions as solution (solution.cweId)}
        <div class="cwe-item">
          <button
            class="cwe-header"
            on:click={() => expandedCWE = expandedCWE === solution.cweId ? null : solution.cweId}
          >
            <span class="cwe-badge">CWE-{solution.cweId}</span>
            <span class="expand-icon">{expandedCWE === solution.cweId ? '▼' : '▶'}</span>
          </button>
          {#if expandedCWE === solution.cweId}
            <div class="cwe-solution">
              <p>{solution.solution}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {:else if !isLoading && !error && cweNumbers.length === 0}
    <div class="empty-state">
      <p>No CWE findings available. Run a scan first.</p>
    </div>
  {:else if !isLoading && !error && cweNumbers.length > 0}
    <div class="empty-state">
      <p>Click "Start Analysis" to research CWE fixes.</p>
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

  .start-button,
  .save-button {
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

  .save-button {
    background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  }

  .start-button:hover:not(:disabled),
  .save-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .save-button:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(102, 187, 106, 0.4);
  }

  .start-button:active:not(:disabled),
  .save-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .start-button:disabled,
  .save-button:disabled {
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

  .solutions-container {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .cwe-item {
    border: 2px solid #ecf0f1;
    border-radius: 6px;
    overflow: hidden;
    background: #f8f9fa;
  }

  .cwe-header {
    width: 100%;
    padding: 1rem;
    background: #f8f9fa;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    transition: all 0.2s ease;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .cwe-header:hover {
    background: #ecf0f1;
  }

  .cwe-badge {
    padding: 0.4rem 0.8rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.85rem;
  }

  .expand-icon {
    color: #7f8c8d;
    font-size: 0.75rem;
    transition: transform 0.2s ease;
  }

  .cwe-solution {
    padding: 1.25rem;
    background: white;
    border-top: 2px solid #ecf0f1;
    max-height: 300px;
    overflow-y: auto;
  }

  .cwe-solution p {
    margin: 0;
    font-size: 0.9rem;
    color: #2c3e50;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #7f8c8d;
    font-size: 1.1rem;
    flex: 1;
  }

  .empty-state p {
    margin: 0;
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
