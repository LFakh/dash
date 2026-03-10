<script lang="ts">
  import { enhance } from '$app/forms';
  export let form;
</script>

<div class="login-container">
  <div class="login-box">
    <h1 class="login-title">Admin Login</h1>
    <form method="POST" use:enhance>
      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}
      <div class="input-group">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required />
      </div>
      <div class="input-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f7fa;
  }
  .login-box {
    background: white;
    padding: 2.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  .login-title {
    font-size: 1.8rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 2rem;
    color: #2c3e50;
  }
  .input-group {
    margin-bottom: 1.5rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #34495e;
  }
  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  button {
    width: 100%;
    padding: 1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  button:hover {
    background-color: #2980b9;
  }
  .error {
    color: #e74c3c;
    background-color: #fbe9e7;
    border: 1px solid #e57373;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    text-align: center;
  }
</style>
