// Lista de coisas para fazer juntas.

async function getPlans() {
  const { data, error } = await db
    .from("plans")
    .select("*")
    .order("plan_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addPlan({ title, details = "", planDate = null }) {
  const user = await requireUser();

  const { data, error } = await db
    .from("plans")
    .insert({
      created_by: user.id,
      title: title.trim(),
      details: details.trim(),
      plan_date: planDate || null,
      done: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function togglePlan(id, done) {
  const { data, error } = await db
    .from("plans")
    .update({ done })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deletePlan(id) {
  const { error } = await db
    .from("plans")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

function subscribeToPlans(callback) {
  return subscribeToTable("plans", callback);
}
