// =====================================================
// NOVA PLAYLIST
// =====================================================

function setupAddPlaylist() {

  const button =
    document.getElementById("addPlaylist");

  if (!button) return;

  button.addEventListener("click", async () => {

    const name =
      prompt("Nome da playlist:");

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
