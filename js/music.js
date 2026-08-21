// =====================================================
// NOSSO LUGAR — MÚSICA
// MP3 através do dispositivo + Supabase Storage
// =====================================================

let currentPlaylistId = null;
let currentSong = null;
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
// MÚSICAS DA PLAYLIST
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


// =====================================================
// UPLOAD DO MP3
// =====================================================

async function uploadMP3(file) {

  const user = await requireUser();

  if (!file) {
    throw new Error("Nenhum ficheiro selecionado.");
  }

  if (
    file.type !== "audio/mpeg" &&
    !file.name.toLowerCase().endsWith(".mp3")
  ) {
    throw new Error("O ficheiro tem de ser MP3.");
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error(
      "O MP3 é demasiado grande. O limite é 20 MB."
    );
  }

  const fileName =
    `${user.id}/${crypto.randomUUID()}.mp3`;


  const { error } =
    await db.storage
      .from("music")
      .upload(
        fileName,
        file,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: "audio/mpeg"
        }
      );


  if (error) {
    throw error;
  }


  const { data } =
    db.storage
      .from("music")
      .getPublicUrl(fileName);


  if (!data || !data.publicUrl) {
    throw new Error(
      "Não foi possível obter o URL do MP3."
    );
  }


  return data.publicUrl;
}


// =====================================================
// ADICIONAR MÚSICA À PLAYLIST
// =====================================================

async function addPlaylistSong({
  playlistId,
  title,
  artist = "",
  url
}) {

  const user = await requireUser();

  const { data, error } =
    await db
      .from("playlist_songs")
      .insert({
        playlist_id: playlistId,
        added_by: user.id,
        title: title.trim(),
        artist: artist.trim(),
        url: url
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

  const grid =
    document.getElementById("playlistGrid");

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
        await getPlaylistSongs(
          playlist.id
        );


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
// MOSTRAR MÚSICAS
// =====================================================

async function loadPlaylistSongs(
  playlistId
) {

  const panel =
    document.getElementById(
      "songsPanel"
    );

  const list =
    document.getElementById(
      "songsList"
    );

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
// PLAYER
// =====================================================

function createAudioPlayer() {

  if (audioPlayer) return;


  audioPlayer =
    document.getElementById(
      "audioPlayer"
    );


  if (!audioPlayer) {

    audioPlayer =
      document.createElement("audio");

    audioPlayer.id =
      "audioPlayer";

    audioPlayer.preload =
      "metadata";

    document.body.appendChild(
      audioPlayer
    );
  }


  audioPlayer.addEventListener(
    "play",
    () => {

      const button =
        document.getElementById(
          "playBtn"
        );

      if (button) {
        button.textContent = "Ⅱ";
      }

    }
  );


  audioPlayer.addEventListener(
    "pause",
    () => {

      const button =
        document.getElementById(
          "playBtn"
        );

      if (button) {
        button.textContent = "▶";
      }

    }
  );


  audioPlayer.addEventListener(
    "ended",
    () => {

      const button =
        document.getElementById(
          "playBtn"
        );

      if (button) {
        button.textContent = "▶";
      }

      notify("Música terminada ♡");

    }
  );


  audioPlayer.addEventListener(
    "error",
    () => {

      console.error(
        "Erro do elemento audio:",
        audioPlayer.error
      );

      notify(
        "Não foi possível reproduzir este MP3."
      );

    }
  );

}


// =====================================================
// TOCAR MÚSICA
// =====================================================

function playSong(song) {

  if (!song || !song.url) {

    notify(
      "Esta música não tem ficheiro MP3."
    );

    return;
  }


  currentSong =
    song;


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


  createAudioPlayer();


  audioPlayer.src =
    song.url;

  audioPlayer.load();


  audioPlayer.play()
    .then(() => {

      notify(
        `A ouvir: ${song.title} ♫`
      );

    })
    .catch(error => {

      console.error(
        "Erro ao reproduzir MP3:",
        error
      );

      alert(
        "Não foi possível reproduzir a música.\n\n" +
        "Verifica se o ficheiro está no bucket público 'music'."
      );

    });

}


// =====================================================
// PLAY / PAUSE
// =====================================================

function setupMusicPlayer() {

  const button =
    document.getElementById(
      "playBtn"
    );

  if (!button) return;


  createAudioPlayer();


  button.addEventListener(
    "click",
    async () => {

      if (!currentSong) {

        notify(
          "Escolhe primeiro uma música."
        );

        return;
      }


      try {

        if (audioPlayer.paused) {

          await audioPlayer.play();

        } else {

          audioPlayer.pause();

        }

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
// NOVA PLAYLIST
// =====================================================

function setupAddPlaylist() {

  const button =
    document.getElementById(
      "addPlaylist"
    );

  if (!button) return;


  button.addEventListener(
    "click",
    async () => {

      const name =
        prompt(
          "Nome da playlist:"
        );


      if (
        !name ||
        !name.trim()
      ) return;


      try {

        await addPlaylist(
          name
        );

        await loadPlaylists();

        notify(
          "Playlist criada ♫"
        );


      } catch (error) {

        console.error(
          "Erro ao criar playlist:",
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
// ADICIONAR MP3
// =====================================================

function setupAddSong() {

  const button =
    document.getElementById(
      "addSong"
    );

  const fileInput =
    document.getElementById(
      "mp3FileInput"
    );


  if (!button) {

    console.error(
      "Botão addSong não encontrado."
    );

    return;
  }


  if (!fileInput) {

    console.error(
      "mp3FileInput não encontrado."
    );

    return;
  }


  button.addEventListener(
    "click",
    () => {

      if (!currentPlaylistId) {

        notify(
          "Escolhe primeiro uma playlist."
        );

        return;
      }


      fileInput.value = "";

      fileInput.click();

    }
  );


  fileInput.addEventListener(
    "change",
    async () => {

      const file =
        fileInput.files[0];


      if (!file) return;


      const title =
        prompt(
          "Nome da música:",
          file.name.replace(
            /\.mp3$/i,
            ""
          )
        );


      if (
        !title ||
        !title.trim()
      ) {

        fileInput.value = "";

        return;
      }


      const artist =
        prompt(
          "Artista:"
        ) || "";


      try {

        notify(
          "A enviar a música..."
        );


        const url =
          await uploadMP3(
            file
          );


        await addPlaylistSong({

          playlistId:
            currentPlaylistId,

          title:
            title.trim(),

          artist:
            artist.trim(),

          url:
            url

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
          "ERRO AO ADICIONAR MP3:",
          error
        );


        alert(
          "ERRO AO ADICIONAR MÚSICA:\n\n" +
          (error.message || error) +
          "\n\nCódigo: " +
          (error.code || "sem código")
        );

      }


      fileInput.value = "";

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


      if (!user) {
        console.log(
          "Nenhum utilizador autenticado."
        );
        return;
      }


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
