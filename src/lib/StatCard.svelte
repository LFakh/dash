<script lang="ts">
  export let title: string
  export let value: number
  export let color: string = '#3498db'
</script>

<div class="stat-card" style="border-left: 4px solid {color}">
  <div class="stat-value">{value}</div>
  <div class="stat-title">{title}</div>
</div>

<style>
  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .stat-title {
    font-size: 0.95rem;
    color: #7f8c8d;
    font-weight: 500;
  }
</style>
