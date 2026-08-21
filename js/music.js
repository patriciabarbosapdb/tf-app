// =====================================================
// NOSSO LUGAR — MÚSICA
// =====================================================

let currentPlaylistId = null;
let audioPlayer = null;


// =====================================================
// PLAYLISTS
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
// MÚSICAS
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
      const songs = await getPlaylistSongs(playlist.id);

      const card = document.createElement("div");
      card.className = "playlist";

      const title = document.createElement("b");
      title.textContent = playlist.name;

      const count = document.createElement("span");
      count.textContent =
        `${songs.length} ${songs.length === 1 ? "faixa" : "faixas"}`;

      card.appendChild(title);
      card.appendChild(count);

      card.addEventListener("click", async () => {
        currentPlaylistId = playlist.id;
        await loadPlaylistSongs(playlist.id);
      });

      grid.appendChild(card);
    }

  } catch (error) {
    console.error("Erro ao carregar playlists:", error);
  }
}


// =====================================================
// MOSTRAR MÚSICAS DA PLAYLIST
// =====================================================

async function loadPlaylistSongs(playlistId) {
  const panel = document.getElementById("songsPanel");
  const list = document.getElementById("songsList");

  if (!panel || !list) return;

  currentPlaylistId = playlistId;

  try {
    const playlists = await getPlaylists();

    const playlist = playlists.find(
      item => item.id === playlistId
    );

    const name = document.getElementById(
      "selectedPlaylistName"
    );

    if (name && playlist) {
      name.textContent = playlist.name;
    }

    const songs = await getPlaylistSongs(playlistId);

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
      const item = document.createElement("div");
      item.className = "song-item";

      const info = document.createElement("div");

      const title = document.createElement("b");
      title.textContent = song.title;

      const artist = document.createElement("small");
      artist.textContent =
        song.artist || "Artista desconhecido";

      info.appendChild(title);
      info.appendChild(artist);

      const play = document.createElement("button");
      play.className = "primary";
      play.textContent = "▶";

      play.addEventListener("click", () => {
        playSong(song);
      });

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
// ADICIONAR PLAYLIST
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
    const name = prompt("Nome da playlist:");

    if (!name || !name.trim()) return;

    try {
      await addPlaylist(name);

      await loadPlaylists();

      notify("Playlist criada ♫");

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
      prompt(
        "Link direto do áudio (.mp3, .wav, etc.):"
      ) || "";

    try {

      await addPlaylistSong({
        playlistId: currentPlaylistId,
        title: title.trim(),
        artist: artist.trim(),
        url: url.trim()
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
// REPRODUZIR MÚSICA
// =====================================================

async function playSong(song) {

  const title =
    document.getElementById(
      "nowPlayingTitle"
    );

  const artist =
    document.getElementById(
      "nowPlayingArtist"
    );

  const button =
    document.getElementById(
      "playBtn"
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

  if (!song.url || !song.url.trim()) {
    notify(
      "Esta música não tem um link de áudio."
    );
    return;
  }

  try {

    if (!audioPlayer) {
      audioPlayer = new Audio();
    }

    audioPlayer.pause();

    audioPlayer.src =
      song.url.trim();

    audioPlayer.currentTime = 0;

    await audioPlayer.play();

    if (button) {
      button.textContent = "Ⅱ";
    }

    notify(
      `A tocar: ${song.title} ♫`
    );

  } catch (error) {

    console.error(
      "Erro ao reproduzir música:",
      error
    );

    if (button) {
      button.textContent = "▶";
    }

    notify(
      "Não foi possível reproduzir este link."
    );
  }
}


// =====================================================
// BOTÃO PLAY / PAUSA
// =====================================================

function setupMusicPlayer() {

  const button =
    document.getElementById(
      "playBtn"
    );

  if (!button) return;

  audioPlayer = new Audio();

  button.addEventListener(
    "click",
    async () => {

      if (!audioPlayer.src) {
        notify(
          "Escolhe primeiro uma música."
        );
        return;
      }

      try {

        if (audioPlayer.paused) {

          await audioPlayer.play();

          button.textContent = "Ⅱ";

        } else {

          audioPlayer.pause();

          button.textContent = "▶";
        }

      } catch (error) {

        console.error(
          "Erro no player:",
          error
        );
      }
    }
  );


  audioPlayer.addEventListener(
    "ended",
    () => {
      button.textContent = "▶";
    }
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

      setupMusicPlayer();

      await loadPlaylists();

    } catch (error) {

      console.error(
        "Erro ao iniciar Música:",
        error
      );
    }
  }
);
