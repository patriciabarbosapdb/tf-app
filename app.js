const pages=document.querySelectorAll('.page');const nav=document.querySelectorAll('.nav-item[data-page]');const toast=document.getElementById('toast');
function showPage(id){pages.forEach(p=>p.classList.toggle('active-page',p.id===id));nav.forEach(n=>n.classList.toggle('active',n.dataset.page===id));window.scrollTo({top:0,behavior:'smooth'});}
nav.forEach(n=>n.addEventListener('click',()=>showPage(n.dataset.page)));
document.querySelectorAll('[data-open]').forEach(c=>c.addEventListener('click',()=>showPage(c.dataset.open)));
document.querySelectorAll('.text-btn').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
document.getElementById('menuBtn').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));
function notify(text){toast.textContent=text;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}
const form=document.getElementById('messageForm'), input=document.getElementById('messageInput'), messages=document.getElementById('messages');
form.addEventListener('submit',e=>{e.preventDefault();const text=input.value.trim();if(!text)return;const d=document.createElement('div');d.className='message me';d.innerHTML='<small>agora</small><p></p>';d.querySelector('p').textContent=text;messages.appendChild(d);input.value='';messages.scrollTop=messages.scrollHeight;notify('Mensagem enviada ♡')});
document.getElementById('newMessage').addEventListener('click',()=>{input.focus();notify('Escreva uma nova mensagem')});
document.getElementById('playBtn').addEventListener('click',e=>{e.currentTarget.textContent=e.currentTarget.textContent==='▶'?'Ⅱ':'▶';notify(e.currentTarget.textContent==='Ⅱ'?'Tocando agora ♫':'Pausado')});
document.getElementById('addNote').addEventListener('click',()=>{const title=prompt('Título da nota');if(!title)return;const body=prompt('Escreva a nota');if(body===null)return;const card=document.createElement('article');card.className='note-card';card.innerHTML='<span>AGORA</span><h3></h3><p></p><small>minha nota</small>';card.querySelector('h3').textContent=title;card.querySelector('p').textContent=body;document.getElementById('notesGrid').prepend(card);notify('Nota guardada')});
document.getElementById('addBook').addEventListener('click',()=>{const title=prompt('Nome do livro');if(!title)return;const author=prompt('Autora/autor')||'Autor desconhecido';const card=document.createElement('article');card.className='book-card';card.innerHTML='<div class="cover c4">NOVO<br>LIVRO</div><b></b><small></small><span>☆ ☆ ☆ ☆ ☆</span>';card.querySelector('b').textContent=title;card.querySelector('small').textContent=author;document.getElementById('bookGrid').prepend(card);notify('Livro adicionado à biblioteca')});


// ---------- Supabase: login + chat em tempo real ----------
let supabaseClient = null;
let currentUser = null;
let realtimeChannel = null;

const authScreen = document.getElementById('authScreen');
const authForm = document.getElementById('authForm');
const authSubmit = document.getElementById('authSubmit');
const authError = document.getElementById('authError');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const nameField = document.getElementById('nameField');
let signupMode = false;

function supabaseReady() {
  return window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_URL.includes('COLE_AQUI') &&
    !window.SUPABASE_ANON_KEY.includes('COLE_AQUI');
}

function setAuthError(text='') {
  authError.textContent = text;
}

function setSignup(mode) {
  signupMode = mode;
  loginTab.classList.toggle('active', !mode);
  signupTab.classList.toggle('active', mode);
  nameField.classList.toggle('hidden', !mode);
  authSubmit.textContent = mode ? 'Criar conta →' : 'Entrar →';
  setAuthError('');
}

loginTab.addEventListener('click', () => setSignup(false));
signupTab.addEventListener('click', () => setSignup(true));

async function initSupabase() {
  if (!supabaseReady()) {
    authScreen.classList.add('demo-mode');
    return;
  }

  supabaseClient = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );

  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    await enterApp(data.session.user);
  } else {
    authScreen.classList.remove('hidden');
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) await enterApp(session.user);
    else {
      currentUser = null;
      authScreen.classList.remove('hidden');
    }
  });
}

async function enterApp(user) {
  currentUser = user;
  authScreen.classList.add('hidden');

  const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Você';
  document.querySelectorAll('.sister-card strong').forEach(el => el.textContent = name);

  await loadMessages();
  subscribeToMessages();
}

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!supabaseReady()) {
    setAuthError('Primeiro configure supabase-config.js com a URL e a ANON KEY do Supabase.');
    return;
  }

  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  const name = document.getElementById('nameInput').value.trim();

  authSubmit.disabled = true;
  setAuthError('');

  try {
    let result;
    if (signupMode) {
      result = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
    } else {
      result = await supabaseClient.auth.signInWithPassword({ email, password });
    }

    if (result.error) throw result.error;

    if (signupMode && !result.data.session) {
      setAuthError('Conta criada. Verifique seu email para confirmar o cadastro.');
    }
  } catch (err) {
    setAuthError(err.message || 'Não foi possível entrar.');
  } finally {
    authSubmit.disabled = false;
  }
});

async function loadMessages() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from('messages')
    .select('id,sender_id,content,created_at')
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) return;
  const box = document.getElementById('messages');
  box.innerHTML = '';
  data.forEach(addMessageToUI);
}

function addMessageToUI(msg) {
  const box = document.getElementById('messages');
  if (box.querySelector(`[data-message-id="${msg.id}"]`)) return;

  const div = document.createElement('div');
  div.dataset.messageId = msg.id;
  div.className = 'message ' + (currentUser && msg.sender_id === currentUser.id ? 'me' : 'them');

  const time = new Date(msg.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit'
  });

  div.innerHTML = '<small></small><p></p>';
  div.querySelector('small').textContent = time;
  div.querySelector('p').textContent = msg.content;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function sendRealMessage(text) {
  if (!supabaseClient || !currentUser) {
    notify('Configure o Supabase para enviar mensagens reais.');
    return;
  }

  const { error } = await supabaseClient.from('messages').insert({
    sender_id: currentUser.id,
    content: text
  });

  if (error) notify(error.message);
}

function subscribeToMessages() {
  if (!supabaseClient) return;

  if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);

  realtimeChannel = supabaseClient
    .channel('messages-room')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      payload => addMessageToUI(payload.new)
    )
    .subscribe();
}

// Substitui o envio local pelo envio ao banco quando Supabase estiver configurado.
const originalMessageForm = document.getElementById('messageForm');
originalMessageForm.addEventListener('submit', async (e) => {
  if (!supabaseClient) return;
  e.stopImmediatePropagation();
  e.preventDefault();

  const field = document.getElementById('messageInput');
  const text = field.value.trim();
  if (!text) return;

  field.value = '';
  await sendRealMessage(text);
}, true);

initSupabase();
