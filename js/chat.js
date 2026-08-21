// Conversas em tempo real.

async function getMessages(limit = 100) {
  const { data, error } = await db
    .from("messages")
    .select("id,sender_id,content,created_at")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

async function sendMessage(content) {
  const user = await requireUser();
  const text = content.trim();

  if (!text) return null;

  const { data, error } = await db
    .from("messages")
    .insert({
      sender_id: user.id,
      content: text
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

function subscribeToMessages(callback) {
  return subscribeToTable("messages", payload => {
    if (payload.eventType === "INSERT") {
      callback(payload.new);
    }
  });
}
