// Login, cadastro, confirmação e logout.

async function signUp(email, password, name) {
  if (!db) throw new Error("Supabase não está configurado.");

  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  if (!db) throw new Error("Supabase não está configurado.");

  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

async function signOut() {
  if (!db) return;
  const { error } = await db.auth.signOut();
  if (error) throw error;
}

function onAuthChange(callback) {
  if (!db) return null;
  return db.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
