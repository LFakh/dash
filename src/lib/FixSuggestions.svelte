<script lang="ts">
  const suggestions = [
    {
      id: 1,
      severity: 'Critical',
      title: 'SQL Injection Fix',
      description: 'Use parameterized queries or prepared statements to prevent SQL injection attacks.',
      code: `// Bad
const query = "SELECT * FROM users WHERE id = " + userId;

// Good
const query = "SELECT * FROM users WHERE id = ?";
db.execute(query, [userId]);`
    },
    {
      id: 2,
      severity: 'High',
      title: 'XSS Prevention',
      description: 'Sanitize user input and implement Content Security Policy headers.',
      code: `// Add CSP header
res.setHeader("Content-Security-Policy",
  "default-src 'self'; script-src 'self'");`
    }
  ]

  let selectedSuggestion = suggestions[0]
</script>

<div class="fix-suggestions">
  <div class="suggestions-header">
    <h3 class="suggestions-title">LLM Findings Fix Suggestions</h3>
  </div>

  <div class="suggestions-list">
    {#each suggestions as suggestion}
      <button
        class="suggestion-item {selectedSuggestion.id === suggestion.id ? 'active' : ''}"
        on:click={() => selectedSuggestion = suggestion}
      >
        <span class="severity-badge {suggestion.severity.toLowerCase()}">{suggestion.severity}</span>
        <span class="suggestion-title">{suggestion.title}</span>
      </button>
    {/each}
  </div>

  <div class="suggestion-detail">
    <h4 class="detail-title">{selectedSuggestion.title}</h4>
    <p class="detail-description">{selectedSuggestion.description}</p>
    <div class="code-block">
      <pre><code>{selectedSuggestion.code}</code></pre>
    </div>
    <button class="apply-btn">Apply Fix</button>
  </div>
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

  .suggestion-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: #2c3e50;
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
    margin-bottom: 1.25rem;
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

  .apply-btn {
    padding: 0.7rem 1.5rem;
    background-color: #27ae60;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .apply-btn:hover {
    background-color: #229954;
  }
</style>
