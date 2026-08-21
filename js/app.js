// Inicialização geral.
// Este ficheiro não desenha a interface: coordena os módulos.

const NossoLugar = {
  db,
  auth: {
    signUp,
    signIn,
    signOut,
    onAuthChange,
    getCurrentUser
  },
  chat: {
    getMessages,
    sendMessage,
    subscribeToMessages
  },
  books: {
    getBooks,
    addBook,
    updateBook,
    deleteBook,
    subscribeToBooks
  },
  notes: {
    getNotes,
    addNote,
    updateNote,
    deleteNote,
    subscribeToNotes
  },
  memories: {
    getMemories,
    addMemory,
    deleteMemory,
    subscribeToMemories
  },
  music: {
    getSongs,
    addSong,
    deleteSong,
    subscribeToSongs
  },
  plans: {
    getPlans,
    addPlan,
    togglePlan,
    deletePlan,
    subscribeToPlans
  }
};

window.NossoLugar = NossoLugar;

document.dispatchEvent(
  new CustomEvent("nosso-lugar-ready", {
    detail: NossoLugar
  })
);
