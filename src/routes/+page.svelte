<script lang="ts">
  import StatCard from '$lib/StatCard.svelte'
  import FindingsTable from '$lib/FindingsTable.svelte'
  import ChatInterface from '$lib/ChatInterface.svelte'
  import FixSuggestions from '$lib/FixSuggestions.svelte'

  export let data;

  const severityColors = {
    critical: '#e74c3c',
    high: '#f39c12',
    medium: '#3498db',
    low: '#2ecc71',
    info: '#95a5a6'
  };
</script>

<div class="dashboard">
  <header class="header">
    <h1 class="logo">SecureVault</h1>
  </header>

  <main class="main-content">
    {#if data.error}
      <div class="error-message">
        <h2>Failed to Load Data</h2>
        <p>{data.error}</p>
      </div>
    {:else}
      <div class="stats-grid">
        <StatCard title="Critical Findings" value={data.stats.critical} color={severityColors.critical} />
        <StatCard title="High Findings" value={data.stats.high} color={severityColors.high} />
        <StatCard title="Medium Findings" value={data.stats.medium} color={severityColors.medium} />
        <StatCard title="Low Findings" value={data.stats.low} color={severityColors.low} />
        <StatCard title="Info Findings" value={data.stats.info} color={severityColors.info} />
      </div>

      <div class="llm-section">
        <div class="chat-wrapper">
          <ChatInterface />
        </div>
        <div class="suggestions-wrapper">
          <FixSuggestions />
        </div>
      </div>

      <div class="table-section">
        <h2 class="section-title">Security Findings</h2>
        <FindingsTable findings={data.findings} />
      </div>
    {/if}
  </main>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: #f5f7fa;
    color: #2c3e50;
  }

  .dashboard {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    background-color: #2c3e50;
    color: white;
    padding: 1.5rem 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .logo {
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .main-content {
    padding: 2rem;
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
  }
  
  .error-message {
    background-color: #fbe9e7;
    color: #c62828;
    border: 1px solid #e57373;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
  }

  .error-message h2 {
    margin-bottom: 0.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .llm-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .chat-wrapper,
  .suggestions-wrapper {
    min-height: 400px;
  }

  .table-section {
    margin-top: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
    font-weight: 600;
  }

  @media (max-width: 1024px) {
    .llm-section {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .main-content {
      padding: 1rem;
    }
  }
</style>
