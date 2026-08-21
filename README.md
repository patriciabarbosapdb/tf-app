# Nosso Lugar — versão com Supabase

Esta versão adiciona **login, banco de dados e chat em tempo real**.

## 1. Criar o Supabase

1. Entre em https://supabase.com
2. Crie um projeto gratuito.
3. Abra **Project Settings → API**.
4. Copie:
   - Project URL
   - anon/public key

## 2. Configurar o projeto

Abra `supabase-config.js` e troque:

`COLE_AQUI_A_URL_DO_SEU_PROJETO`

e

`COLE_AQUI_A_ANON_KEY`

pelos dois valores públicos do seu projeto.

**Nunca coloque aqui a senha da sua conta Supabase ou uma service-role key.**

## 3. Criar as tabelas

No Supabase:

**SQL Editor → New query**

Cole todo o conteúdo de `supabase-schema.sql` e clique em **Run**.

Isso cria:
- perfis
- mensagens
- notas
- livros
- memórias
- regras de acesso
- chat em tempo real

## 4. Testar

Abra `index.html` usando um servidor local. Uma opção simples:

```bash
python -m http.server 8000
```

Depois abra:

`http://localhost:8000`

Crie a primeira conta. Depois crie a segunda conta em outro navegador/dispositivo.

## 5. Publicar

Pode publicar estes arquivos no GitHub Pages.

Importante: o arquivo `supabase-config.js` contém apenas a URL e a chave **anon/public**, que são próprias para uso no frontend. As regras RLS do banco são o que protegem os dados.

## Próximas partes

Depois do login + chat, podemos conectar:
- notas ao banco
- livros ao banco
- upload de memórias
- capas de livros por API
- Spotify/Apple Music
- restrição para somente as duas contas
- notificações
- PWA instalável no celular
