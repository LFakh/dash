<script lang="ts">
  import StatCard from '$lib/StatCard.svelte'
  import FindingsTable from '$lib/FindingsTable.svelte'
  import ChatInterface from '$lib/ChatInterface.svelte'
  import FixSuggestions from '$lib/FixSuggestions.svelte'
  import DetailsSection from '$lib/DetailsSection.svelte'

  const stats = [
    { title: 'Active Engagements', value: 4, color: '#2c3e50' },
    { title: 'Last Seven Days', value: 12, color: '#e74c3c' },
    { title: 'Closed In Last Seven Days', value: 0, color: '#27ae60' },
    { title: 'Risk Accepted', value: 0, color: '#f39c12' }
  ]

  const mockFindings = [
    {
      id: 1,
      severity: 'Critical',
      name: 'SQL Injection in Login Form',
      cwe: 'CWE-89',
      vulnerabilityId: '693',
      epssScore: 'N.A.',
      epssPercentile: 'N.A.',
      knownExploited: 'No',
      usedInRansomware: 'No',
      dateAdded: 'March 1, 2026',
      age: 1,
      sla: 95,
      reporter: 'Admin User'
    },
    {
      id: 2,
      severity: 'High',
      name: 'Cross-Site Scripting (XSS)',
      cwe: 'CWE-79',
      vulnerabilityId: '264',
      epssScore: 'N.A.',
      epssPercentile: 'N.A.',
      knownExploited: 'No',
      usedInRansomware: 'No',
      dateAdded: 'March 1, 2026',
      age: 1,
      sla: 92,
      reporter: 'Admin User'
    },
    {
      id: 3,
      severity: 'Medium',
      name: 'Missing Anti-Clickjacking Header',
      cwe: 'CWE-1021',
      vulnerabilityId: '1021',
      epssScore: 'N.A.',
      epssPercentile: 'N.A.',
      knownExploited: 'No',
      usedInRansomware: 'No',
      dateAdded: 'March 1, 2026',
      age: 1,
      sla: 89,
      reporter: 'Admin User'
    },
    {
      id: 4,
      severity: 'Low',
      name: 'Information Disclosure',
      cwe: 'CWE-200',
      vulnerabilityId: '693',
      epssScore: 'N.A.',
      epssPercentile: 'N.A.',
      knownExploited: 'No',
      usedInRansomware: 'No',
      dateAdded: 'March 1, 2026',
      age: 1,
      sla: 119,
      reporter: 'Admin User'
    }
  ]
</script>

<div class="dashboard">
  <header class="header">
    <h1 class="logo">SecureVault</h1>
  </header>

  <main class="main-content">
    <div class="stats-grid">
      {#each stats as stat}
        <StatCard title={stat.title} value={stat.value} color={stat.color} />
      {/each}
    </div>

    <div class="details-grid">
      <DetailsSection title="Engagement Details" />
      <DetailsSection title="Finding Details" />
      <DetailsSection title="Finding Details" />
      <DetailsSection title="Finding Details" />
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
      <FindingsTable findings={mockFindings} />
    </div>
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

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
