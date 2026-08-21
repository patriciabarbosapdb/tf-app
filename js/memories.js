// =====================================================
// NOSSO LUGAR — MEMÓRIAS
// =====================================================

async function getMemories() {
  const { data, error } = await db
    .from("memories")
    .select("*")
    .order("memory_date", { ascending: false });

  if (error) throw error;

  return data || [];
}


// =====================================================
// ADICIONAR MEMÓRIA
// =====================================================

async function addMemory({
  title,
  description = "",
  image_url = "",
  memory_date = null
}) {
  const user = await requireUser();

  const { data, error } = await db
    .from("memories")
    .insert({
      added_by: user.id,
      title: title.trim(),
      description: description.trim(),
      image_url: image_url.trim(),
      memory_date: memory_date || null
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}


// =====================================================
// ATUALIZAR
// =====================================================

async function updateMemory(id, changes) {
  const { data, error } = await db
    .from("memories")
    .update(changes)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}


// =====================================================
// APAGAR
// =====================================================

async function deleteMemory(id) {
  const { error } = await db
    .from("memories")
    .delete()
    .eq("id", id);

  if (error) throw error;
}


// =====================================================
// MOSTRAR MEMÓRIAS
// =====================================================

async function loadMemoriesIntoPage() {

  const grid =
    document.getElementById("memoriesGrid");

  if (!grid) return;

  try {

    const memories =
      await getMemories();

    grid.innerHTML = "";

    if (memories.length === 0) {

      grid.innerHTML = `
        <div class="empty-state">
          Ainda não há memórias guardadas. ♡
        </div>
      `;

      return;
    }


    memories.forEach(memory => {

      const card =
        document.createElement("article");

      card.className = "memory-card";


      const date =
        document.createElement("span");

      const dateValue =
        memory.memory_date ||
        memory.created_at;

      const dateObject =
        new Date(dateValue);

      date.textContent =
        dateObject.toLocaleDateString(
          "pt-PT",
          {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }
        );


      const title =
        document.createElement("h2");

      title.textContent =
        memory.title;


      const description =
        document.createElement("p");

      description.textContent =
        memory.description || "";


      card.appendChild(date);
      card.appendChild(title);
      card.appendChild(description);


      if (memory.image_url) {

        const image =
          document.createElement("img");

        image.src =
          memory.image_url;

        image.alt =
          memory.title;

        image.loading = "lazy";

        card.appendChild(image);
      }


      grid.appendChild(card);

    });

  } catch (error) {

    console.error(
      "Erro ao carregar memórias:",
      error
    );

  }
}


// =====================================================
// NOVA MEMÓRIA
// =====================================================

function setupAddMemory() {

  const button =
    document.getElementById("addMemory");

  if (!button) return;


  button.addEventListener(
    "click",
    async () => {

      const title =
        prompt("Título da memória:");

      if (!title) return;


      const description =
        prompt(
          "Conta um pouco sobre este momento:"
        );

      if (description === null) return;


      const dateInput =
        prompt(
          "Data da memória (AAAA-MM-DD):",
          new Date()
            .toISOString()
            .split("T")[0]
        );

      if (dateInput === null) return;


      const imageUrl =
        prompt(
          "URL da fotografia (opcional):"
        ) || "";


      try {

        await addMemory({
          title,
          description,
          image_url: imageUrl,
          memory_date: dateInput
        });


        await loadMemoriesIntoPage();


        alert(
          "Memória guardada! ♡"
        );

      } catch (error) {

        console.error(
          "ERRO AO ADICIONAR MEMÓRIA:",
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

function setupMemoriesRealtime() {

  subscribeToTable(
    "memories",
    () => {
      loadMemoriesIntoPage();
    }
  );

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    setupAddMemory();

    const user =
      await getCurrentUser();

    if (!user) return;

    await loadMemoriesIntoPage();

    setupMemoriesRealtime();

  }
);
