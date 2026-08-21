// Biblioteca compartilhada.

async function getBooks() {
  const { data, error } = await db
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addBook({ title, author = "", cover = "", status = "want", rating = 0 }) {
  const user = await requireUser();

  const { data, error } = await db
    .from("books")
    .insert({
      added_by: user.id,
      title: title.trim(),
      author: author.trim(),
      cover,
      status,
      rating
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateBook(id, changes) {
  const { data, error } = await db
    .from("books")
    .update(changes)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteBook(id) {
  const { error } = await db
    .from("books")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

function subscribeToBooks(callback) {
  return subscribeToTable("books", callback);
}
