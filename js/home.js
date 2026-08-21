// =====================================================
// NOSSO LUGAR — PÁGINA INICIAL
// Todos os dados abaixo vêm do Supabase.
// =====================================================

async function loadHome() {

  const user = await getCurrentUser();

  if (!user) return;

  try {

    await loadHomeBooks();
    await loadHomeNotes();
    await loadHomeMessages();
    await loadHomeMusic();
    await loadHomeTimeline();

  } catch (error) {

    console.error(
      "Erro ao carregar a página inicial:",
      error
    );

  }
}


// =====================================================
// LIVROS
// =====================================================

async function loadHomeBooks() {

  const books = await getBooks();

  const total =
    books.length;

  const read =
    books.filter(
      book => book.status === "read"
    ).length;

  const reading =
    books.filter(
      book => book.status === "reading"
    ).length;

  const want =
    books.filter(
      book => book.status === "want"
    ).length;


  const totalElement =
    document.getElementById(
      "homeBookCount"
    );

  const readElement =
    document.getElementById(
      "homeReadCount"
    );

  const readingElement =
    document.getElementById(
      "homeReadingCount"
    );

  const wantElement =
    document.getElementById(
      "homeWantCount"
    );


  if (totalElement) {
    totalElement.textContent = total;
  }

  if (readElement) {
    readElement.textContent = read;
  }

  if (readingElement) {
    readingElement.textContent = reading;
  }

  if (wantElement) {
    wantElement.textContent = want;
  }
}


// =====================================================
// NOTAS
// =====================================================

async function loadHomeNotes() {

  const notes =
    await getNotes();

  const titleElement =
    document.getElementById(
      "homeNoteTitle"
    );

  const dateElement =
    document.getElementById(
      "homeNoteDate"
    );


  if (!notes.length) {

    titleElement.textContent =
      "Ainda não há notas.";

    dateElement.textContent =
      "Cria a primeira nota ♡";

    return;
  }


  const note =
    notes[0];


  titleElement.textContent =
    `“${note.title}”`;


  dateElement.textContent =
    `${formatDate(note.created_at)} · ${
      note.shared
        ? "compartilhada"
        : "minha nota"
    }`;
}


// =====================================================
// MENSAGENS
// =====================================================

async function loadHomeMessages() {

  const { data, error } =
    await db
      .from("messages")
      .select(
        "id,sender_id,content,created_at"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(1);


  if (error) {
    throw error;
  }


  const title =
    document.getElementById(
      "homeLastMessage"
    );

  const time =
    document.getElementById(
      "homeMessageTime"
    );


  if (!data || data.length === 0) {

    title.textContent =
      "Ainda não há mensagens.";

    time.textContent =
      "Comecem uma conversa ♡";

    return;
  }


  const message =
    data[0];


  title.textContent =
    `“${message.content}”`;


  time.textContent =
    relativeTime(
      message.created_at
    );
}


// =====================================================
// MÚSICA
// =====================================================

async function loadHomeMusic() {

  const title =
    document.getElementById(
      "homeMusicTitle"
    );

  const artist =
    document.getElementById(
      "homeMusicArtist"
    );


  try {

    const songs =
      await getSongs();


    if (!songs.length) {

      title.textContent =
        "Nenhuma música";

      artist.textContent =
        "Adicionem uma música ♫";

      return;
    }


    const song =
      songs[0];


    title.textContent =
      song.title;


    artist.textContent =
      song.artist ||
      "Artista desconhecido";


  } catch (error) {

    console.error(
      "Erro ao carregar música:",
      error
    );

    title.textContent =
      "Nenhuma música";

    artist.textContent =
      "Adicionem uma música ♫";
  }
}


// =====================================================
// TIMELINE
// =====================================================

async function loadHomeTimeline() {

  const timeline =
    document.getElementById(
      "homeTimeline"
    );

  if (!timeline) return;


  const activities = [];


  // -----------------------------
  // LIVROS
  // -----------------------------

  try {

    const books =
      await getBooks();


    if (books.length) {

      const book =
        books[0];

      activities.push({

        date:
          book.created_at,

        title:
          "Um livro entrou na lista",

        text:
          `“${book.title}” · ${
            book.author ||
            "Autor desconhecido"
          }`

      });
    }

  } catch (error) {

    console.error(
      "Erro nos livros:",
      error
    );

  }


  // -----------------------------
  // NOTAS
  // -----------------------------

  try {

    const notes =
      await getNotes();


    if (notes.length) {

      const note =
        notes[0];

      activities.push({

        date:
          note.created_at,

        title:
          "Uma nova nota foi guardada",

        text:
          note.title

      });
    }

  } catch (error) {

    console.error(
      "Erro nas notas:",
      error
    );

  }


  // -----------------------------
  // MEMÓRIAS
  // -----------------------------

  try {

    const memories =
      await getMemories();


    if (memories.length) {

      const memory =
        memories[0];

      activities.push({

        date:
          memory.created_at,

        title:
          "Uma memória foi guardada",

        text:
          memory.title

      });
    }

  } catch (error) {

    console.error(
      "Erro nas memórias:",
      error
    );

  }


  // -----------------------------
  // ORDENAR
  // -----------------------------

  activities.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );


  timeline.innerHTML = "";


  if (!activities.length) {

    timeline.innerHTML = `
      <div>
        <span class="time">AGORA</span>

        <p>
          <b>Ainda não há atividades.</b><br>
          Este espaço vai começar a ganhar histórias. ♡
        </p>
      </div>
    `;

    return;
  }


  // -----------------------------
  // MOSTRAR 3 MAIS RECENTES
  // -----------------------------

  activities
    .slice(0, 3)
    .forEach(activity => {

      const row =
        document.createElement("div");


      const date =
        document.createElement("span");

      date.className = "time";

      date.textContent =
        relativeDate(
          activity.date
        );


      const text =
        document.createElement("p");


      const title =
        document.createElement("b");

      title.textContent =
        activity.title;


      text.appendChild(title);

      text.appendChild(
        document.createElement("br")
      );

      text.appendChild(
        document.createTextNode(
          activity.text
        )
      );


      row.appendChild(date);
      row.appendChild(text);

      timeline.appendChild(row);

    });
}


// =====================================================
// DATA
// =====================================================

function formatDate(date) {

  return new Date(date)
    .toLocaleDateString(
      "pt-PT",
      {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
      }
    );

}


function relativeTime(date) {

  const difference =
    Date.now() -
    new Date(date).getTime();


  const minutes =
    Math.floor(
      difference / 60000
    );


  if (minutes < 1) {
    return "agora mesmo";
  }


  if (minutes === 1) {
    return "há 1 minuto";
  }


  if (minutes < 60) {
    return `há ${minutes} minutos`;
  }


  const hours =
    Math.floor(
      minutes / 60
    );


  if (hours === 1) {
    return "há 1 hora";
  }


  if (hours < 24) {
    return `há ${hours} horas`;
  }


  return formatDate(date);
}


function relativeDate(date) {

  const value =
    new Date(date);

  const today =
    new Date();


  if (
    value.toDateString() ===
    today.toDateString()
  ) {
    return "HOJE";
  }


  const yesterday =
    new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );


  if (
    value.toDateString() ===
    yesterday.toDateString()
  ) {
    return "ONTEM";
  }


  return value
    .toLocaleDateString(
      "pt-PT",
      {
        day: "2-digit",
        month: "short"
      }
    )
    .toUpperCase();
}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadHome();

  }
);
