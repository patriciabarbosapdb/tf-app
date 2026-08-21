// =====================================================
// NOSSO LUGAR — LIVROS
// =====================================================


// =====================================================
// FUNÇÕES DO SUPABASE
// =====================================================

async function getBooks() {
  const { data, error } = await db
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}


async function addBook({
  title,
  author = "",
  cover = "",
  status = "want",
  rating = null
}) {
  const user = await requireUser();

  const { data, error } = await db
    .from("books")
    .insert({
      added_by: user.id,
      title: title.trim(),
      author: author.trim(),
      cover: cover || "",
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


// =====================================================
// INTERFACE
// =====================================================

let currentBookFilter = "all";


async function loadBooksIntoPage() {

  const grid = document.getElementById("bookGrid");

  if (!grid) return;

  try {

    const books = await getBooks();


    // ---------------------------------------------
    // CONTADORES
    // ---------------------------------------------

    const countAll =
      document.getElementById("countAll");

    const countRead =
      document.getElementById("countRead");

    const countReading =
      document.getElementById("countReading");

    const countWant =
      document.getElementById("countWant");


    if (countAll) {
      countAll.textContent = books.length;
    }

    if (countRead) {
      countRead.textContent =
        books.filter(
          book => book.status === "read"
        ).length;
    }

    if (countReading) {
      countReading.textContent =
        books.filter(
          book => book.status === "reading"
        ).length;
    }

    if (countWant) {
      countWant.textContent =
        books.filter(
          book => book.status === "want"
        ).length;
    }


    // ---------------------------------------------
    // FILTRO
    // ---------------------------------------------

    const filteredBooks =
      currentBookFilter === "all"
        ? books
        : books.filter(
            book =>
              book.status === currentBookFilter
          );


    grid.innerHTML = "";


    if (filteredBooks.length === 0) {

      grid.innerHTML = `
        <div class="empty-state">
          Ainda não há livros nesta lista. ♡
        </div>
      `;

      return;
    }


    // ---------------------------------------------
    // CARTÕES
    // ---------------------------------------------

    filteredBooks.forEach(book => {

      const card =
        document.createElement("article");

      card.className = "book-card";


      const cover =
        document.createElement("div");

      cover.className =
        "cover c" +
        ((book.title.length % 4) + 1);

      cover.textContent =
        book.title;


      const title =
        document.createElement("b");

      title.textContent =
        book.title;


      const author =
        document.createElement("small");

      author.textContent =
        book.author ||
        "Autor desconhecido";


      const rating =
        document.createElement("span");

      const stars =
        Number(book.rating || 0);

      rating.textContent =
        "★ ".repeat(stars) +
        "☆ ".repeat(5 - stars);


      card.appendChild(cover);
      card.appendChild(title);
      card.appendChild(author);
      card.appendChild(rating);


      grid.appendChild(card);

    });


  } catch (error) {

    console.error(
      "Erro ao carregar livros:",
      error
    );

  }

}


// =====================================================
// FILTROS
// =====================================================

function setupBookFilters() {

  const buttons =
    document.querySelectorAll(
      ".book-tabs button"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        buttons.forEach(btn => {
          btn.classList.remove("active");
        });


        button.classList.add("active");


        const filter =
          button.dataset.bookFilter;


        currentBookFilter =
          filter || "all";


        loadBooksIntoPage();

      }
    );

  });

}


// =====================================================
// ADICIONAR LIVRO
// =====================================================

function setupAddBook() {

  const button =
    document.getElementById("addBook");


  if (!button) return;


  button.addEventListener(
    "click",
    async () => {

      const title =
        prompt("Nome do livro:");

      if (!title) return;


      const author =
        prompt("Autor:") || "";


      const statusInput =
        prompt(
          "Estado:\n\n" +
          "1 — Quero ler\n" +
          "2 — Lendo\n" +
          "3 — Lido"
        );


      let status = "want";


      if (statusInput === "2") {
        status = "reading";
      }


      if (statusInput === "3") {
        status = "read";
      }


      let rating = null;


      if (status === "read") {

        const ratingInput =
          prompt(
            "Avaliação de 0 a 5 estrelas:"
          );


        rating =
          Math.max(
            0,
            Math.min(
              5,
              Number(ratingInput) || 0
            )
          );

      }


      try {

        await addBook({
          title,
          author,
          status,
          rating
        });


        await loadBooksIntoPage();


        alert(
          "Livro adicionado! 📚"
        );


      } catch (error) {

        console.error(
          "ERRO AO ADICIONAR LIVRO:",
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

function setupBookRealtime() {

  subscribeToBooks(() => {
    loadBooksIntoPage();
  });

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    setupBookFilters();

    setupAddBook();


    const user =
      await getCurrentUser();


    if (!user) return;


    await loadBooksIntoPage();

    setupBookRealtime();

  }
);
