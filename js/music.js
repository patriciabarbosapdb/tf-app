// =====================================================
// NOSSO LUGAR — MÚSICA
// =====================================================

let currentPlaylistId = null;


// =====================================================
// PLAYLISTS — BD
// =====================================================

async function getPlaylists() {

  const { data, error } = await db
    .from("playlists")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data || [];
}


async function addPlaylist(name) {

  const user = await requireUser();

  const { data, error } = await db
    .from("playlists")
    .insert({
      created_by: user.id,
      name: name.trim()
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}


// =====================================================
// MÚSICAS — BD
// =====================================================

async function getPlaylistSongs(playlistId) {

  const { data, error } = await db
    .from("playlist_songs")
    .select("*")
    .eq("playlist_id", playlistId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data || [];
}


async function addPlaylistSong({
  playlistId,
  title,
  artist = "",
  url = ""
}) {

  const user = await requireUser();

  const { data, error } = await db
    .from("playlist_songs")
    .insert({
      playlist_id: playlistId,
      added_by: user.id,
      title: title.trim(),
      artist: artist.trim(),
      url: url.trim()
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}


// =====================================================
// MOSTRAR PLAYLISTS
// =====================================================

async function loadPlaylists() {

  const grid = document.getElementById("playlistGrid");

  if (!grid) return;

  try {

    const playlists = await getPlaylists();

    grid.innerHTML = "";

    if (playlists.length === 0) {

      grid.innerHTML = `
        <div class="empty-state">
          Ainda não há playlists. ♡
        </div>
      `;

      return;
    }


    for (const playlist of playlists) {

      const songs =
        await getPlaylistSongs(playlist.id);


      const card =
        document.createElement("div");

      card.className = "playlist";


      const title =
        document.createElement("b");

      title.textContent =
        playlist.name;


      const count =
        document.createElement("span");

      count.textContent =
        `${songs.length} ${
          songs.length === 1
            ? "faixa"
            : "faixas"
        }`;


      card.appendChild(title);
      card.appendChild(count);


      card.addEventListener("click", () => {

        currentPlaylistId =
          playlist.id;

        loadPlaylistSongs(
          playlist.id
        );

      });


      grid.appendChild(card);
    }

  } catch (error) {

    console.error(
      "Erro ao carregar playlists:",
      error
    );

  }
}


// =====================================================
// MOSTRAR MÚSICAS
// =====================================================

async function loadPlaylistSongs(playlistId) {

  const panel =
    document.getElementById("songsPanel");

  const list =
    document.getElementById("songsList");

  if (!panel || !list) return;


  currentPlaylistId =
    playlistId;


  try {

    const playlists =
      await getPlaylists();

    const playlist =
      playlists.find(
        p => p.id === playlistId
      );


    const name =
      document.getElementById(
        "selectedPlaylistName"
      );


    if (name && playlist) {
      name.textContent =
        playlist.name;
    }


    const songs =
      await getPlaylistSongs(
        playlistId
      );


    panel.classList.remove("hidden");

    list.innerHTML = "";


    if (songs.length === 0) {

      list.innerHTML = `
        <div class="empty-state">
          Esta playlist ainda está vazia. ♡
        </div>
      `;

      return;
    }


    songs.forEach(song => {

      const item =
        document.createElement("div");

      item.className =
        "song-item";


      const info =
        document.createElement("div");


      const title =
        document.createElement("b");

      title.textContent =
        song.title;


      const artist =
        document.createElement("small");

      artist.textContent =
        song.artist ||
        "Artista desconhecido";


      info.appendChild(title);
      info.appendChild(artist);


      const play =
        document.createElement("button");

      play.className =
        "primary";

      play.textContent =
        "▶";


      play.addEventListener(
        "click",
        () => playSong(song)
      );


      item.appendChild(info);
      item.appendChild(play);

      list.appendChild(item);

    });

  } catch (error) {

    console.error(
      "Erro ao carregar músicas:",
      error
    );

  }
}


// =====================================================
// NOVA PLAYLIST
// =====================================================

function setupAddPlaylist() {

  const button =
    document.getElementById("addPlaylist");

  if (!button) {
    console.error(
      "Botão addPlaylist não encontrado."
    );
    return;
  }


  button.addEventListener("click", async () => {

    const name =
      prompt("Nome da playlist:");

    if (!name || !name.trim()) return;


    try {

      await addPlaylist(name);

      await loadPlaylists();

      notify(
        "Playlist criada ♫"
      );

    } catch (error) {

      console.error(
        "ERRO AO CRIAR PLAYLIST:",
        error
      );

      alert(
        "ERRO DO SUPABASE:\n\n" +
        (error.message || error) +
        "\n\nCódigo: " +
        (error.code || "sem código")
      );

    }

  });
}


// =====================================================
// ADICIONAR MÚSICA
// =====================================================

function setupAddSong() {

  const button =
    document.getElementById("addSong");

  if (!button) return;


  button.addEventListener("click", async () => {

    if (!currentPlaylistId) {

      notify(
        "Escolhe primeiro uma playlist."
      );

      return;
    }


    const title =
      prompt("Nome da música:");

    if (!title || !title.trim()) return;


    const artist =
      prompt("Artista:") || "";


    const url =
      prompt("Link da música:") || "";


    try {

      await addPlaylistSong({

        playlistId:
          currentPlaylistId,

        title:
          title.trim(),

        artist:
          artist.trim(),

        url:
          url.trim()

      });


      await loadPlaylistSongs(
        currentPlaylistId
      );


      await loadPlaylists();


      notify(
        "Música adicionada ♫"
      );


    } catch (error) {

      console.error(
        "ERRO AO ADICIONAR MÚSICA:",
        error
      );

      alert(
        "ERRO DO SUPABASE:\n\n" +
        (error.message || error) +
        "\n\nCódigo: " +
        (error.code || "sem código")
      );

    }

  });
}


// =====================================================
// TOCAR MÚSICA
// =====================================================

function playSong(song) {

  const title =
    document.getElementById(
      "nowPlayingTitle"
    );

  const artist =
    document.getElementById(
      "nowPlayingArtist"
    );


  if (title) {
    title.textContent =
      song.title;
  }


  if (artist) {
    artist.textContent =
      song.artist ||
      "Artista desconhecido";
  }


  notify(
    `A ouvir: ${song.title} ♫`
  );
}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      const user =
        await getCurrentUser();

      if (!user) return;


      setupAddPlaylist();

      setupAddSong();


      await loadPlaylists();


    } catch (error) {

      console.error(
        "Erro ao iniciar Música:",
        error
      );

    }

  }
);
