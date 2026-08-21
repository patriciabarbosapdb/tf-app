// =====================================================
// NOSSO LUGAR — CONTROLO DO CHAT
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
  const messagesContainer = document.getElementById("messages");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");

  if (!messagesContainer || !messageForm || !messageInput) return;

  let currentUser = null;

  function formatTime(date) {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function renderMessage(message) {
    const element = document.createElement("div");

    const mine = currentUser && message.sender_id === currentUser.id;

    element.className = `message ${mine ? "me" : "them"}`;

    const time = document.createElement("small");
    time.textContent = formatTime(message.created_at);

    const text = document.createElement("p");
    text.textContent = message.content;

    element.appendChild(time);
    element.appendChild(text);

    messagesContainer.appendChild(element);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function renderMessages(messages) {
    messagesContainer.innerHTML = "";

    messages.forEach(renderMessage);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function loadChat() {
    try {
      currentUser = await getCurrentUser();

      if (!currentUser) return;

      const messages = await getMessages();

      renderMessages(messages);
    } catch (error) {
      console.error("Erro ao carregar chat:", error);
    }
  }

  messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = messageInput.value.trim();

    if (!text) return;

    messageInput.disabled = true;

    try {
      await sendMessage(text);

      messageInput.value = "";
      messageInput.focus();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

      alert("Não foi possível enviar a mensagem.");
    } finally {
      messageInput.disabled = false;
    }
  });

  // Carregar mensagens existentes
  await loadChat();

  // Ouvir mensagens novas em tempo real
  subscribeToMessages((message) => {
    renderMessage(message);
  });
});
