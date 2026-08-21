// =====================================================
// NOSSO LUGAR — LIVROS
// =====================================================

let currentBookFilter = "all";

async function loadBooksIntoPage() {
  const grid = document.getElementById("bookGrid");

  if (!grid) return;

  try {
    const books = await getBooks();

    const filteredBooks =
      currentBookFilter === "all"
        ? books
        : books.filter(book => book.status === currentBookFilter);

    grid.innerHTML = "";

    if (filteredBooks.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          Ainda não há livros nesta lista. ♡
        </div>
      `;
      return;
    }

    filteredBooks.forEach(book => {
      const card = document.createElement("article");
      card.className = "book-card";

      const cover = document.createElement("div");
      cover.className = "cover c" + ((book.title.length % 4) + 1);

      cover.textContent = book.title;

      const title = document.createElement("b");
      title.textContent = book.title;

      const author = document.createElement("small");
      author.textContent = book.author || "Autor desconhecido";

      const rating = document.createElement("span");

      const stars = Number(book.rating || 0);

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
    console.error("Erro ao carregar livros:", error);
  }
}


// =====================================================
// FILTROS
// =====================================================

function setupBookFilters() {
  const buttons = document.querySelectorAll(".book-tabs button");

  buttons.forEach(button => {
    button.addEventListener("click", () => {

      buttons.forEach(btn =>
        btn.classList.remove("active")
      );

      button.classList.add("active");

      const text = button.textContent.toLowerCase();

      if (text.includes("lidos")) {
        currentBookFilter = "read";
      } else if (text.includes("lendo")) {
        currentBookFilter = "reading";
      } else if (text.includes("quero ler")) {
        currentBookFilter = "want";
      } else {
        currentBookFilter = "all";
      }

      loadBooksIntoPage();
    });
  });
}


// =====================================================
// ADICIONAR LIVRO
// =====================================================

function setupAddBook() {

  const button = document.getElementById("addBook");

  if (!button) return;

  button.addEventListener("click", async () => {

    const title = prompt("Nome do livro:");

    if (!title) return;

    const author = prompt("Autor:");

    const statusInput = prompt(
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

    let rating = 0;

    if (status === "read") {
      const ratingInput = prompt(
        "Avaliação de 0 a 5 estrelas:"
      );

      rating = Math.max(
        0,
        Math.min(5, Number(ratingInput) || 0)
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

    } catch (error) {

      console.error(error);

      alert(
        "Não foi possível adicionar o livro."
      );
    }
  });
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

document.addEventListener("DOMContentLoaded", async () => {

  setupBookFilters();

  setupAddBook();

  const user = await getCurrentUser();

  if (!user) return;

  await loadBooksIntoPage();

  setupBookRealtime();

});
