<script lang="ts">
  import { browser } from '$app/environment';

  let messages: { role: string; content: string; type?: 'llm_response' }[] = []
  let inputMessage = ''
  let isLoading = false;

  // Function to simulate sending data to the LLM endpoint
  async function sendMessage() {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    messages = [...messages, { role: 'user', content: userMessage }];
    inputMessage = '';
    isLoading = true;

    // Placeholder vulnerability data for now
    // In a real scenario, this would come from user selection or specific input fields.
    const vulnerability = {
      description: userMessage, // Using user input as description
      severity: 'Medium', // Placeholder
      cwe: 'CWE-20' // Placeholder
    };

    try {
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: userMessage })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const llmResponse = await response.json();

      if (llmResponse.error) {
        messages = [...messages, { role: 'assistant', content: `Error from LLM: ${llmResponse.error}` }];
      } else {
        messages = [...messages, {
          role: 'assistant',
          content: llmResponse.response,
          type: 'llm_response'
        }];
      }

    } catch (error) {
      console.error('Failed to communicate with LLM endpoint:', error);
      messages = [...messages, { role: 'assistant', content: 'Sorry, I could not get a response from the LLM service.' }];
    } finally {
      isLoading = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }
</script>

<div class="chat-interface">
  <div class="chat-header">
    <h3 class="chat-title">LLM Chat Interface</h3>
    <span class="status-indicator" class:loading={isLoading}>{isLoading ? 'Thinking...' : 'Online'}</span>
  </div>

  <div class="messages-container">
    {#each messages as message}
      <div class="message {message.role}">
        <div class="message-content">{message.content}</div>
      </div>
    {/each}
  </div>

  <div class="input-container">
    <textarea
      bind:value={inputMessage}
      on:keypress={handleKeyPress}
      placeholder="Ask about findings or request fix suggestions..."
      rows="3"
      disabled={isLoading}
    />
    <button on:click={sendMessage} class="send-btn" disabled={isLoading}>Send</button>
  </div>
</div>

<style>
  .chat-interface {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 400px;
  }

  .chat-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 2px solid #ecf0f1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chat-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .status-indicator {
    font-size: 0.85rem;
    color: #27ae60;
    font-weight: 600;
    padding: 0.4rem 0.8rem;
    background-color: #d5f4e6;
    border-radius: 12px;
    transition: background-color 0.3s;
  }

  .status-indicator.loading {
    background-color: #f39c12;
    color: white;
  }

  .messages-container {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    max-width: 80%;
    padding: 0.9rem 1.2rem;
    border-radius: 12px;
    line-height: 1.5;
    font-size: 0.95rem;
  }

  .message.user {
    align-self: flex-end;
    background-color: #3498db;
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message.assistant {
    align-self: flex-start;
    background-color: #ecf0f1;
    color: #2c3e50;
    border-bottom-left-radius: 4px;
  }

  .message-content {
    word-wrap: break-word;
  }

  .input-container {
    padding: 1.25rem 1.5rem;
    border-top: 2px solid #ecf0f1;
    display: flex;
    gap: 0.75rem;
  }

  textarea {
    flex: 1;
    padding: 0.8rem;
    border: 2px solid #ecf0f1;
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
    resize: none;
    transition: border-color 0.2s;
  }

  textarea:focus {
    outline: none;
    border-color: #3498db;
  }

  .send-btn {
    padding: 0.8rem 1.5rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .send-btn:hover {
    background-color: #2980b9;
  }

  .send-btn:disabled, textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
