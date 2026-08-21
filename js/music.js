// =====================================================
// NOSSO LUGAR — MÚSICA
// =====================================================

let currentPlaylistId = null;


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
    .order("created_at", {
      ascending: true
    });

  if (error) throw error;

  return data || [];
}


async function addPlaylistSong({
  playlistId,
  title,
  artist = "",
  url = "",
  coverUrl = ""
}) {

  const user = await requireUser();

  const { data, error } = await db
    .from("playlist_songs")
    .insert({
      playlist_id: playlistId,
      added_by: user.id,
      title: title.trim(),
      artist: artist.trim(),
      url: url.trim(),
      cover_url: coverUrl.trim()
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}


async function deletePlaylistSong(id) {

  const { error } = await db
    .from("playlist_songs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}


// =====================================================
// MÚSICA QUE CADA UMA ESTÁ A OUVIR
// =====================================================

async function updateMusicPresence({
  title = "",
  artist = "",
  url = "",
  isPlaying = false,
  positionSeconds = 0
}) {

  const user = await requireUser();

  const { data, error } = await db
    .from("music_presence")
    .upsert({
      user_id: user.id,
      song_title: title,
      artist,
      url,
      is_playing: isPlaying,
      position_seconds: positionSeconds,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;

  return data;
}


async function getMusicPresence() {

  const { data, error } = await db
    .from("music_presence")
    .select("*");

  if (error) throw error;

  return data || [];
}


// =====================================================
// MOSTRAR PLAYLISTS
// =====================================================

async function loadPlaylists() {

  const grid =
    document.querySelector(".playlist-grid");

  if (!grid) return;

  try {

    const playlists =
      await getPlaylists();

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


      const name =
        document.createElement("b");

      name.textContent =
        playlist.name;


      const count =
        document.createElement("span");

      count.textContent =
        `${songs.length} ${
          songs.length === 1
            ? "faixa"
            : "faixas"
        }`;


      card.appendChild(name);
      card.appendChild(count);


      card.addEventListener(
        "click",
        () => {

          currentPlaylistId =
            playlist.id;

          loadPlaylistSongs(
            playlist.id
          );

        }
      );


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
// MOSTRAR MÚSICAS DA PLAYLIST
// =====================================================

async function loadPlaylistSongs(playlistId) {

  const panel =
    document.getElementById("songsPanel");

  const list =
    document.getElementById("songsList");

  if (!panel || !list) return;

  currentPlaylistId = playlistId;

  try {

    const playlists =
      await getPlaylists();

    const playlist =
      playlists.find(
        item => item.id === playlistId
      );

    const name =
      document.getElementById(
        "selectedPlaylistName"
      );

    if (name && playlist) {
      name.textContent = playlist.name;
    }

    const songs =
      await getPlaylistSongs(playlistId);

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

      item.className = "song-item";

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

      play.className = "primary";
      play.textContent = "▶";

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
// TOCAR MÚSICA
// =====================================================

async function playSong(song) {

  const title =
    document.querySelector(
      ".now-playing h2"
    );

  const artist =
    document.querySelector(
      ".now-playing p"
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


  try {

    await updateMusicPresence({
      title: song.title,
      artist: song.artist,
      url: song.url,
      isPlaying: true,
      positionSeconds: 0
    });

    notify(
      `A ouvir: ${song.title} ♫`
    );

  } catch (error) {

    console.error(
      "Erro ao atualizar música:",
      error
    );

  }

}


// =====================================================
// NOVA PLAYLIST
// =====================================================

function setupAddPlaylist() {

  const buttons =
    document.querySelectorAll(
      ".section-heading .primary"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      async () => {

        const name =
          prompt(
            "Nome da playlist:"
          );


        if (!name) return;


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

      }
    );

  });

}


// =====================================================
// BOTÃO PLAY
// =====================================================

function setupMusicPlayer() {

  const button =
    document.getElementById(
      "playBtn"
    );

  if (!button) return;


  let playing = false;


  button.addEventListener(
    "click",
    async () => {

      playing = !playing;


      button.textContent =
        playing ? "Ⅱ" : "▶";


      const title =
        document.querySelector(
          ".now-playing h2"
        )?.textContent || "";


      const artist =
        document.querySelector(
          ".now-playing p"
        )?.textContent || "";


      try {

        await updateMusicPresence({
          title,
          artist,
          isPlaying: playing,
          positionSeconds: 0
        });


        notify(
          playing
            ? "Tocando agora ♫"
            : "Pausado"
        );

      } catch (error) {

        console.error(
          "Erro no player:",
          error
        );

      }

    }
  );

}


// =====================================================
// TEMPO REAL
// =====================================================

function setupMusicRealtime() {

  subscribeToTable(
    "playlists",
    () => {
      loadPlaylists();
    }
  );


  subscribeToTable(
    "playlist_songs",
    () => {
      loadPlaylists();
    }
  );


  subscribeToTable(
    "music_presence",
    () => {
      loadOtherMusic();
    }
  );

}


// =====================================================
// VER O QUE A OUTRA ESTÁ A OUVIR
// =====================================================

async function loadOtherMusic() {

  try {

    const presence =
      await getMusicPresence();


    const others =
      presence.filter(
        item =>
          currentUser &&
          item.user_id !== currentUser.id
      );


    if (
      others.length === 0
    ) {
      return;
    }


    const other =
      others[0];


    console.log(
      "A outra está a ouvir:",
      other.song_title,
      other.artist
    );

  } catch (error) {

    console.error(
      "Erro ao carregar música da outra pessoa:",
      error
    );

  }

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const user =
      await getCurrentUser();

    if (!user) return;

setupAddPlaylist();

setupAddSong();

setupMusicPlayer();

    await loadPlaylists();

    setupMusicRealtime();

  }
);
