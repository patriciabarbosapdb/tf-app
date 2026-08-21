// Caderno de notas.

async function getNotes(sharedOnly = false) {
  let query = db
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (sharedOnly) query = query.eq("shared", true);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function addNote({ title, content, shared = true }) {
  const user = await requireUser();

  const { data, error } = await db
    .from("notes")
    .insert({
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
      shared
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateNote(id, changes) {
  const { data, error } = await db
    .from("notes")
    .update(changes)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteNote(id) {
  const { error } = await db.from("notes").delete().eq("id", id);
  if (error) throw error;
}

function subscribeToNotes(callback) {
  return subscribeToTable("notes", callback);
}
