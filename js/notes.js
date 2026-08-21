// =====================================================
// NOSSO LUGAR — NOTAS
// =====================================================

async function getNotes(sharedOnly = false) {
  let query = db
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (sharedOnly) {
    query = query.eq("shared", true);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}


// =====================================================
// ADICIONAR NOTA
// =====================================================

async function addNote({
  title,
  content,
  shared = true
}) {

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


// =====================================================
// ATUALIZAR NOTA
// =====================================================

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


// =====================================================
// APAGAR NOTA
// =====================================================

async function deleteNote(id) {

  const { error } =
    await db
      .from("notes")
      .delete()
      .eq("id", id);

  if (error) throw error;
}


// =====================================================
// TEMPO REAL
// =====================================================

function subscribeToNotes(callback) {
  return subscribeToTable("notes", callback);
}


// =====================================================
// MOSTRAR NOTAS
// =====================================================

async function loadNotesIntoPage() {

  const grid =
    document.getElementById("notesGrid");

  if (!grid) return;

  try {

    const notes =
      await getNotes();


    grid.innerHTML = "";


    if (notes.length === 0) {

      grid.innerHTML = `
        <div class="empty-state">
          Ainda não há notas. ♡
        </div>
      `;

      return;
    }


    notes.forEach(note => {

      const card =
        document.createElement("article");

      card.className = "note-card";


      const date =
        document.createElement("span");

      date.textContent =
        new Date(note.created_at)
          .toLocaleDateString(
            "pt-BR",
            {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit"
            }
          );


      const title =
        document.createElement("h3");

      title.textContent =
        note.title;


      const content =
        document.createElement("p");

      content.textContent =
        note.content;


      const author =
        document.createElement("small");

      author.textContent =
        note.shared
          ? "compartilhada · por nós duas"
          : "minha nota";


      card.appendChild(date);
      card.appendChild(title);
      card.appendChild(content);
      card.appendChild(author);


      grid.appendChild(card);

    });

  } catch (error) {

    console.error(
      "Erro ao carregar notas:",
      error
    );

  }

}


// =====================================================
// NOVA NOTA
// =====================================================

function setupAddNote() {

  const button =
    document.getElementById("addNote");

  if (!button) return;


  button.addEventListener(
    "click",
    async () => {

      const title =
        prompt("Título da nota:");

      if (!title) return;


      const content =
        prompt("Escreva a nota:");

      if (content === null) return;


      try {

        await addNote({
          title,
          content,
          shared: true
        });


        await loadNotesIntoPage();


        alert("Nota guardada! ♡");

      } catch (error) {

        console.error(
          "ERRO AO ADICIONAR NOTA:",
          error
        );


        alert(
          "ERRO DO SUPABASE:\n\n" +
          (error.message || error) +
          "\n\nCódigo: " +
          (error.code || "sem código")
        );

      }

    }
  );

}


// =====================================================
// TEMPO REAL
// =====================================================

function setupNotesRealtime() {

  subscribeToNotes(() => {
    loadNotesIntoPage();
  });

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    setupAddNote();

    const user =
      await getCurrentUser();

    if (!user) return;


    await loadNotesIntoPage();

    setupNotesRealtime();

  }
);
