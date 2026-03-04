<script lang="ts">
  let messages: { role: string; content: string }[] = []
  let inputMessage = ''

  function sendMessage() {
    if (!inputMessage.trim()) return

    messages = [...messages, { role: 'user', content: inputMessage }]
    inputMessage = ''

    setTimeout(() => {
      messages = [...messages, {
        role: 'assistant',
        content: 'I understand your concern. Let me analyze that finding and provide recommendations.'
      }]
    }, 1000)
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
    <span class="status-indicator">Online</span>
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
    />
    <button on:click={sendMessage} class="send-btn">Send</button>
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
</style>
