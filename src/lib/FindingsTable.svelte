<script lang="ts">
  export let findings: Array<{
    id: number
    severity: string
    name: string
    cwe: string
    vulnerabilityId: string
    epssScore: string
    epssPercentile: string
    knownExploited: string
    usedInRansomware: string
    dateAdded: string
    age: number
    sla: number
    reporter: string
  }>

  let selectedFindings: number[] = []
  let allSelected = false

  function toggleAll() {
    if (allSelected) {
      selectedFindings = []
    } else {
      selectedFindings = findings.map(f => f.id)
    }
    allSelected = !allSelected
  }

  function toggleFinding(id: number) {
    if (selectedFindings.includes(id)) {
      selectedFindings = selectedFindings.filter(fid => fid !== id)
    } else {
      selectedFindings = [...selectedFindings, id]
    }
    allSelected = selectedFindings.length === findings.length
  }

  function getSeverityClass(severity: string): string {
    return severity.toLowerCase()
  }

  function deleteSelected() {
    findings = findings.filter(f => !selectedFindings.includes(f.id))
    selectedFindings = []
    allSelected = false
  }
</script>

<div class="table-container">
  {#if selectedFindings.length > 0}
    <div class="actions-bar">
      <span class="selected-count">{selectedFindings.length} finding{selectedFindings.length !== 1 ? 's' : ''} selected</span>
      <button class="delete-btn" on:click={deleteSelected}>Delete Selected</button>
    </div>
  {/if}
  <div class="table-wrapper">
    <table class="findings-table">
      <thead>
        <tr>
          <th class="checkbox-col">
            <input type="checkbox" checked={allSelected} on:change={toggleAll} />
          </th>
          <th>Severity</th>
          <th>Name</th>
          <th>CWE</th>
          <th>Vulnerability ID</th>
          <th>EPSS Score</th>
          <th>EPSS Percentile</th>
          <th>Known Exploited</th>
          <th>Used in Ransomware</th>
          <th>Date Added</th>
          <th>Age</th>
          <th>SLA</th>
          <th>Reporter</th>
        </tr>
      </thead>
      <tbody>
        {#each findings as finding}
          <tr class:selected={selectedFindings.includes(finding.id)}>
            <td class="checkbox-col">
              <input
                type="checkbox"
                checked={selectedFindings.includes(finding.id)}
                on:change={() => toggleFinding(finding.id)}
              />
            </td>
            <td>
              <span class="severity-badge {getSeverityClass(finding.severity)}">
                {finding.severity}
              </span>
            </td>
            <td class="name-col">{finding.name}</td>
            <td>{finding.cwe}</td>
            <td>
              <button class="link" on:click|preventDefault>{finding.vulnerabilityId}</button>
            </td>
            <td>{finding.epssScore}</td>
            <td>{finding.epssPercentile}</td>
            <td>{finding.knownExploited}</td>
            <td>{finding.usedInRansomware}</td>
            <td>{finding.dateAdded}</td>
            <td>{finding.age}</td>
            <td>
              <span class="sla-badge">{finding.sla}</span>
            </td>
            <td>{finding.reporter}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .findings-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  thead {
    background-color: #34495e;
    color: white;
  }

  th {
    padding: 1rem 0.75rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }

  td {
    padding: 1rem 0.75rem;
    border-bottom: 1px solid #ecf0f1;
  }

  tbody tr {
    transition: background-color 0.2s;
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }

  tbody tr.selected {
    background-color: #e3f2fd;
  }

  .checkbox-col {
    width: 40px;
    text-align: center;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .severity-badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .severity-badge.critical {
    background-color: #fee;
    color: #c0392b;
  }

  .severity-badge.high {
    background-color: #fff3e0;
    color: #e67e22;
  }

  .severity-badge.medium {
    background-color: #fff9e6;
    color: #f39c12;
  }

  .severity-badge.low {
    background-color: #e8f5e9;
    color: #27ae60;
  }

  .name-col {
    font-weight: 500;
    color: #2c3e50;
    max-width: 250px;
  }

  .link {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
  }

  .link:hover {
    text-decoration: underline;
  }

  .sla-badge {
    display: inline-block;
    padding: 0.3rem 0.6rem;
    background-color: #27ae60;
    color: white;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.8rem;
  }

  .actions-bar {
    padding: 1rem 1.5rem;
    background-color: #f8f9fa;
    border-bottom: 2px solid #ecf0f1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .selected-count {
    font-size: 0.95rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .delete-btn {
    padding: 0.6rem 1.2rem;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .delete-btn:hover {
    background-color: #c0392b;
  }

  @media (max-width: 1200px) {
    .findings-table {
      font-size: 0.85rem;
    }

    th, td {
      padding: 0.75rem 0.5rem;
    }
  }
</style>
