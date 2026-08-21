# Como adicionar estes JS ao projeto

Crie a pasta:

`js/`

E coloque todos os ficheiros desta pasta dentro dela.

No `index.html`, mantenha o carregamento do Supabase e depois carregue os módulos nesta ordem:

1. `js/supabase.js`
2. `js/auth.js`
3. `js/chat.js`
4. `js/books.js`
5. `js/notes.js`
6. `js/memories.js`
7. `js/music.js`
8. `js/plans.js`
9. `js/app.js`

Exemplo:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>

<script src="js/supabase.js"></script>
<script src="js/auth.js"></script>
<script src="js/chat.js"></script>
<script src="js/books.js"></script>
<script src="js/notes.js"></script>
<script src="js/memories.js"></script>
<script src="js/music.js"></script>
<script src="js/plans.js"></script>
<script src="js/app.js"></script>
```

## Importante

Não apagues ainda o `app.js` antigo. Primeiro adiciona estes ficheiros e confirma que o site continua a abrir.

Depois podemos migrar a interface para usar `window.NossoLugar`, sem quebrar o que já tens.

O módulo `supabase.js` usa as variáveis que já tens no `supabase-config.js`.
