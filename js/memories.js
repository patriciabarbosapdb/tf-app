// Memórias e fotos.

async function uploadMemoryImage(file) {
  const user = await requireUser();

  if (!file) return "";

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error } = await db.storage
    .from("memories")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = db.storage
    .from("memories")
    .getPublicUrl(path);

  return data.publicUrl;
}

async function getMemories() {
  const { data, error } = await db
    .from("memories")
    .select("*")
    .order("memory_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addMemory({ title, description = "", date = null, imageFile = null }) {
  const user = await requireUser();
  const image_url = await uploadMemoryImage(imageFile);

  const { data, error } = await db
    .from("memories")
    .insert({
      added_by: user.id,
      title: title.trim(),
      description: description.trim(),
      image_url,
      memory_date: date || new Date().toISOString().slice(0, 10)
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteMemory(id) {
  const { error } = await db
    .from("memories")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

function subscribeToMemories(callback) {
  return subscribeToTable("memories", callback);
}
