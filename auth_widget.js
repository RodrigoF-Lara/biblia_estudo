(function () {
  const config = window.BIBLIA_SUPABASE_CONFIG || {};
  const hasConfig = Boolean(config.url && config.anonKey);

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = [
      '.auth-widget{position:fixed;right:16px;bottom:16px;z-index:9999;width:min(340px,calc(100vw - 24px));background:#fff;border:1px solid #d8dfda;border-radius:14px;box-shadow:0 12px 32px rgba(11,41,39,0.18);padding:12px 12px 10px;font-family:Arial,sans-serif;color:#1f2b2b}',
      '.auth-widget *{box-sizing:border-box}',
      '.auth-title{margin:0 0 8px;font-size:14px;font-weight:700;color:#173a37}',
      '.auth-row{display:flex;gap:8px;align-items:center}',
      '.auth-input{flex:1;height:36px;padding:0 10px;border:1px solid #ccd7d2;border-radius:8px;font-size:14px}',
      '.auth-btn{height:36px;border:1px solid #126b5f;background:#126b5f;color:#fff;border-radius:8px;padding:0 11px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}',
      '.auth-btn:hover{background:#0f5c52;border-color:#0f5c52}',
      '.auth-btn.secondary{background:#fff;color:#144641;border-color:#b8cec8}',
      '.auth-btn.secondary:hover{background:#f3f9f7}',
      '.auth-meta{margin:8px 0 0;font-size:12px;line-height:1.4;color:#476260;word-break:break-word}',
      '.auth-status{margin:6px 0 0;font-size:12px;line-height:1.4;color:#3a5553}',
      '.auth-status.error{color:#8e3131}',
      '.auth-status.ok{color:#2f6a42}',
      '.auth-widget.hidden{display:none}',
      '@media print{.auth-widget{display:none!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function createWidget() {
    const wrap = document.createElement('aside');
    wrap.className = 'auth-widget';
    wrap.innerHTML = [
      '<p class="auth-title">Conta</p>',
      '<div class="auth-logged-out">',
      '  <div class="auth-row">',
      '    <input class="auth-input" id="auth-email" type="email" placeholder="Seu email" autocomplete="email"/>',
      '    <button class="auth-btn" id="auth-login">Entrar</button>',
      '  </div>',
      '  <p class="auth-meta">Enviamos um link magico para seu email.</p>',
      '</div>',
      '<div class="auth-logged-in" style="display:none">',
      '  <p class="auth-meta" id="auth-user"></p>',
      '  <div class="auth-row">',
      '    <button class="auth-btn secondary" id="auth-logout">Sair</button>',
      '  </div>',
      '</div>',
      '<p class="auth-status" id="auth-status"></p>'
    ].join('');
    document.body.appendChild(wrap);
    return wrap;
  }

  function setStatus(el, message, type) {
    el.textContent = message || '';
    el.className = 'auth-status' + (type ? ' ' + type : '');
  }

  function boot(client, widget) {
    const loggedOut = widget.querySelector('.auth-logged-out');
    const loggedIn = widget.querySelector('.auth-logged-in');
    const emailInput = widget.querySelector('#auth-email');
    const loginBtn = widget.querySelector('#auth-login');
    const logoutBtn = widget.querySelector('#auth-logout');
    const statusEl = widget.querySelector('#auth-status');
    const userEl = widget.querySelector('#auth-user');

    function renderSession(session) {
      const user = session && session.user ? session.user : null;
      if (user) {
        loggedOut.style.display = 'none';
        loggedIn.style.display = 'block';
        userEl.textContent = 'Logado como: ' + (user.email || user.id);
        setStatus(statusEl, 'Sessao ativa.', 'ok');
      } else {
        loggedOut.style.display = 'block';
        loggedIn.style.display = 'none';
        userEl.textContent = '';
        setStatus(statusEl, 'Voce ainda nao entrou.', '');
      }
    }

    loginBtn.addEventListener('click', async function () {
      const email = (emailInput.value || '').trim();
      if (!email) {
        setStatus(statusEl, 'Digite um email valido.', 'error');
        emailInput.focus();
        return;
      }

      loginBtn.disabled = true;
      setStatus(statusEl, 'Enviando link de acesso...', '');
      try {
        const redirect = config.defaultRedirectTo || (window.location.origin + window.location.pathname);
        const result = await client.auth.signInWithOtp({
          email: email,
          options: { emailRedirectTo: redirect }
        });

        if (result.error) {
          throw result.error;
        }

        setStatus(statusEl, 'Link enviado. Abra seu email e clique para entrar.', 'ok');
      } catch (err) {
        setStatus(statusEl, 'Falha ao enviar link: ' + (err.message || 'erro desconhecido'), 'error');
      } finally {
        loginBtn.disabled = false;
      }
    });

    logoutBtn.addEventListener('click', async function () {
      logoutBtn.disabled = true;
      try {
        const result = await client.auth.signOut();
        if (result.error) {
          throw result.error;
        }
        setStatus(statusEl, 'Sessao encerrada.', 'ok');
      } catch (err) {
        setStatus(statusEl, 'Falha ao sair: ' + (err.message || 'erro desconhecido'), 'error');
      } finally {
        logoutBtn.disabled = false;
      }
    });

    client.auth.getSession().then(function (res) {
      renderSession(res && res.data ? res.data.session : null);
    });

    client.auth.onAuthStateChange(function (_event, session) {
      renderSession(session);
    });
  }

  function start() {
    injectStyles();
    const widget = createWidget();
    const statusEl = widget.querySelector('#auth-status');

    if (!window.supabase || !window.supabase.createClient) {
      setStatus(statusEl, 'SDK do Supabase nao foi carregado.', 'error');
      return;
    }

    if (!hasConfig) {
      setStatus(statusEl, 'Configure supabase-config.js para ativar o login.', 'error');
      return;
    }

    const client = window.supabase.createClient(config.url, config.anonKey);
    boot(client, widget);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
