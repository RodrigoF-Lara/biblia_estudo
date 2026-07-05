# Setup de Login com Supabase (Usuario e Senha)

Este projeto ja esta com frontend configurado para o projeto:
- URL: https://yffkmzinhvihylcgwumt.supabase.co
- anon key: preenchida em supabase-config.js

Widget de login ativo nas paginas:
- busca_estudo.html
- layout_fixo.html
- layout_novo.html

## 1) Configurar Auth no painel do Supabase
No painel: Authentication > URL Configuration

1. Site URL:
   - https://rodrigof-lara.github.io/biblia_estudo/

2. Redirect URLs (adicione todas):
   - http://127.0.0.1:5500/*
   - http://localhost:5500/*
   - https://rodrigof-lara.github.io/biblia_estudo/*

## 2) Garantir provedor de email ativo
No painel: Authentication > Providers > Email

1. Deixe o provedor Email habilitado.
2. Habilite "Email + Password".
3. O site usa somente usuario e senha no frontend.

## 3) Criar tabelas e politicas (RLS)
No painel: SQL Editor

1. Abra o arquivo supabase_setup.sql deste projeto.
2. Copie e execute todo o script.
3. Se voce ja tinha executado antes, execute novamente a versao atual. Isso cria/atualiza:
   - campo bairro e campo cpf (completo) em user_private_data
   - bucket de fotos "avatars" (Storage) com politicas RLS por usuario

## 4) Tornar seu usuario admin
Depois do seu primeiro login:

1. Va em Authentication > Users e copie seu User ID.
2. No SQL Editor, rode:

insert into public.admin_users (user_id)
values ('SEU-USER-ID-UUID')
on conflict (user_id) do nothing;

## 5) Teste rapido local
1. Abra o projeto com servidor local (Live Server ou python -m http.server 5500).
2. Acesse busca_estudo.html.
3. No card Conta, use:
   - Ja tenho conta
   - Primeiro acesso
   - Esqueci/definir senha
4. Confirme "Sessao ativa" apos entrar.
6. Clique em "Completar perfil", preencha nome, nascimento, cidade, bairro, foto e CPF.
7. Clique em "Salvar perfil" e confirme a mensagem de sucesso.

## 6) Teste em producao (GitHub Pages)
1. Publique com seu comando d -Message ".... ".
2. Abra https://rodrigof-lara.github.io/biblia_estudo/
3. Repita o fluxo de login e confirme sessao ativa.

## Observacoes importantes
- Nunca use service_role no frontend.
- A anon key pode ficar no frontend.
- Se o link do email abrir e nao logar, quase sempre falta ajustar Redirect URLs.
- CPF nao e salvo em texto puro: o frontend envia hash + 4 ultimos digitos para user_private_data.
