// Música compartilhada.
// Guarda links/metadados; não hospeda as músicas.

async function getSongs() {
  const { data, error } = await db
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addSong({ title, artist = "", url = "", service = "link" }) {
  const user = await requireUser();

  const { data, error } = await db
    .from("songs")
    .insert({
      added_by: user.id,
      title: title.trim(),
      artist: artist.trim(),
      url: url.trim(),
      service
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteSong(id) {
  const { error } = await db
    .from("songs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

function subscribeToSongs(callback) {
  return subscribeToTable("songs", callback);
}
