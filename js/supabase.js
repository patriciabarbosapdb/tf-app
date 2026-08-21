// Ligação central ao Supabase.
// Usa a Publishable key no frontend.
const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_KEY = window.SUPABASE_ANON_KEY;

if (!window.supabase) {
  console.error("Supabase JS não foi carregado.");
}

const db = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

async function getCurrentUser() {
  if (!db) return null;
  const { data } = await db.auth.getUser();
  return data?.user || null;
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("É necessário estar autenticada.");
  return user;
}

function subscribeToTable(table, callback) {
  if (!db) return null;
  return db
    .channel(`${table}-${crypto.randomUUID()}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table
    }, callback)
    .subscribe();
}
