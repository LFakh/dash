<script lang="ts">
  export let title: string
</script>

<div class="details-section">
  <h3 class="details-title">{title}</h3>
  <div class="details-content">
    <div class="detail-item">
      <span class="detail-label">Status:</span>
      <span class="detail-value">Active</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Total Findings:</span>
      <span class="detail-value">24</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Last Updated:</span>
      <span class="detail-value">2 hours ago</span>
    </div>
  </div>
  <button class="view-details-btn">View Details</button>
</div>

<style>
  .details-section {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
  }

  .details-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #ecf0f1;
  }

  .details-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-label {
    font-size: 0.9rem;
    color: #7f8c8d;
    font-weight: 500;
  }

  .detail-value {
    font-size: 0.9rem;
    color: #2c3e50;
    font-weight: 600;
  }

  .view-details-btn {
    padding: 0.7rem 1.2rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .view-details-btn:hover {
    background-color: #2980b9;
  }
</style>
