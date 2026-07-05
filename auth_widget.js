(function () {
  const config = window.BIBLIA_SUPABASE_CONFIG || {};
  const hasConfig = Boolean(config.url && config.anonKey);
  let currentUserId = '';
  let acceptedTermsAt = null;
  let acceptedPrivacyAt = null;

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = [
      '.auth-widget{width:100%;max-width:520px;background:#fff;border:1px solid #d8dfda;border-radius:14px;box-shadow:0 10px 22px rgba(11,41,39,0.12);padding:12px;font-family:Arial,sans-serif;color:#1f2b2b}',
      '.auth-widget *{box-sizing:border-box}',
      '.auth-panel-head{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.auth-title{margin:0 0 6px;font-size:15px;font-weight:700;color:#173a37}',
      '.auth-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
      '.auth-input{flex:1;height:36px;padding:0 10px;border:1px solid #ccd7d2;border-radius:8px;font-size:14px;min-width:160px}',
      '.auth-btn{height:36px;border:1px solid #126b5f;background:#126b5f;color:#fff;border-radius:8px;padding:0 11px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}',
      '.auth-btn:hover{background:#0f5c52;border-color:#0f5c52}',
      '.auth-btn.secondary{background:#fff;color:#144641;border-color:#b8cec8}',
      '.auth-btn.secondary:hover{background:#f3f9f7}',
      '.auth-meta{margin:8px 0 0;font-size:12px;line-height:1.4;color:#476260;word-break:break-word}',
      '.auth-divider{margin:10px 0;border-top:1px solid #e5ece8}',
      '.auth-form{display:grid;gap:8px;margin-top:8px}',
      '.auth-field{display:grid;gap:4px}',
      '.auth-field label{font-size:11px;font-weight:700;color:#4b6160;text-transform:uppercase;letter-spacing:.6px}',
      '.auth-field input{height:34px;border:1px solid #ccd7d2;border-radius:8px;padding:0 9px;font-size:13px;color:#1f2b2b}',
      '.auth-checks{display:grid;gap:6px;margin:3px 0}',
      '.auth-check{display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#365250;line-height:1.3}',
      '.auth-check input{margin-top:1px}',
      '.auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
      '.auth-password-box{display:grid;gap:8px;margin-top:8px;padding:8px;border:1px dashed #c8d8d3;border-radius:10px;background:#f9fcfb}',
      '.auth-toggle{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:0 10px;border-radius:8px;border:1px solid #b8cec8;background:#f3f9f7;color:#154842;font-size:12px;font-weight:700;cursor:pointer}',
      '.auth-small{font-size:11px;color:#5a6f6e;margin:0}',
      '.auth-status{margin:8px 0 0;font-size:12px;line-height:1.4;color:#3a5553}',
      '.auth-status.error{color:#8e3131}',
      '.auth-status.ok{color:#2f6a42}',
      '@media (max-width:680px){.auth-widget{max-width:100%}.auth-grid{grid-template-columns:1fr}.auth-btn{width:100%}.auth-row{align-items:stretch}}',
      '@media print{.auth-widget{display:none!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function createWidget() {
    const wrap = document.createElement('aside');
    wrap.className = 'auth-widget';
    wrap.innerHTML = [
      '<div class="auth-panel-head">',
      '  <p class="auth-title">Conta</p>',
      '</div>',
      '<div class="auth-logged-out">',
      '  <div class="auth-row">',
      '    <input class="auth-input" id="auth-email" type="email" placeholder="Seu email" autocomplete="email"/>',
      '    <input class="auth-input" id="auth-password" type="password" placeholder="Sua senha" autocomplete="current-password"/>',
      '  </div>',
      '  <div class="auth-row" style="margin-top:8px">',
      '    <button class="auth-btn" id="auth-login-password" type="button">Ja tenho conta</button>',
      '    <button class="auth-btn secondary" id="auth-signup-password" type="button">Primeiro acesso</button>',
      '    <button class="auth-btn secondary" id="auth-reset-password" type="button">Esqueci/definir senha</button>',
      '  </div>',
      '  <p class="auth-meta">Acesso somente por usuario e senha. O login por link magico foi removido do site.</p>',
      '</div>',
      '<div class="auth-logged-in" style="display:none">',
      '  <p class="auth-meta" id="auth-user"></p>',
      '  <div class="auth-row">',
      '    <button class="auth-toggle" id="auth-toggle-profile" type="button">Completar perfil</button>',
      '    <button class="auth-btn secondary" id="auth-logout" type="button">Sair</button>',
      '  </div>',
      '  <div class="auth-password-box">',
      '    <p class="auth-small">Atualize sua senha quando quiser.</p>',
      '    <div class="auth-row">',
      '      <input class="auth-input" id="auth-new-password" type="password" placeholder="Nova senha (minimo 6)" autocomplete="new-password"/>',
      '      <button class="auth-btn secondary" id="auth-set-password" type="button">Atualizar senha</button>',
      '    </div>',
      '  </div>',
      '  <div class="auth-divider"></div>',
      '  <form class="auth-form" id="auth-profile-form" style="display:none">',
      '    <div class="auth-field">',
      '      <label for="profile-full-name">Nome completo</label>',
      '      <input id="profile-full-name" type="text" autocomplete="name" />',
      '    </div>',
      '    <div class="auth-grid">',
      '      <div class="auth-field">',
      '        <label for="profile-birth-date">Nascimento</label>',
      '        <input id="profile-birth-date" type="date" />',
      '      </div>',
      '      <div class="auth-field">',
      '        <label for="profile-city">Cidade</label>',
      '        <input id="profile-city" type="text" autocomplete="address-level2" />',
      '      </div>',
      '    </div>',
      '    <div class="auth-grid">',
      '      <div class="auth-field">',
      '        <label for="profile-neighborhood">Bairro</label>',
      '        <input id="profile-neighborhood" type="text" autocomplete="address-level3" />',
      '      </div>',
      '      <div class="auth-field">',
      '        <label for="profile-avatar-url">URL da foto</label>',
      '        <input id="profile-avatar-url" type="url" placeholder="https://..." />',
      '      </div>',
      '    </div>',
      '    <div class="auth-field">',
      '      <label for="profile-cpf">CPF (somente hash e salvo)</label>',
      '      <input id="profile-cpf" type="text" inputmode="numeric" placeholder="000.000.000-00" />',
      '    </div>',
      '    <p class="auth-small" id="profile-cpf-info"></p>',
      '    <div class="auth-checks">',
      '      <label class="auth-check"><input id="profile-email-opt-in" type="checkbox" /> Receber comunicacoes por email</label>',
      '      <label class="auth-check"><input id="profile-whatsapp-opt-in" type="checkbox" /> Receber comunicacoes por WhatsApp</label>',
      '      <label class="auth-check"><input id="profile-terms" type="checkbox" /> Aceito os termos de uso</label>',
      '      <label class="auth-check"><input id="profile-privacy" type="checkbox" /> Aceito a politica de privacidade</label>',
      '    </div>',
      '    <button class="auth-btn" id="auth-save-profile" type="submit">Salvar perfil</button>',
      '  </form>',
      '</div>',
      '<p class="auth-status" id="auth-status"></p>'
    ].join('');
    return wrap;
  }

  function mountWidget(widget) {
    const slot = document.getElementById('auth-menu-slot');
    if (slot) {
      slot.appendChild(widget);
      return;
    }

    const fallback = document.createElement('div');
    fallback.style.padding = '12px';
    fallback.style.display = 'flex';
    fallback.style.justifyContent = 'center';
    fallback.appendChild(widget);
    document.body.prepend(fallback);
  }

  function setStatus(el, message, type) {
    el.textContent = message || '';
    el.className = 'auth-status' + (type ? ' ' + type : '');
  }

  function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  async function sha256Hex(value) {
    const enc = new TextEncoder();
    const data = enc.encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function boot(client, widget) {
    const loggedOut = widget.querySelector('.auth-logged-out');
    const loggedIn = widget.querySelector('.auth-logged-in');
    const emailInput = widget.querySelector('#auth-email');
    const passwordInput = widget.querySelector('#auth-password');
    const resetPasswordBtn = widget.querySelector('#auth-reset-password');
    const loginPasswordBtn = widget.querySelector('#auth-login-password');
    const signupPasswordBtn = widget.querySelector('#auth-signup-password');
    const logoutBtn = widget.querySelector('#auth-logout');
    const setPasswordBtn = widget.querySelector('#auth-set-password');
    const newPasswordInput = widget.querySelector('#auth-new-password');
    const toggleProfileBtn = widget.querySelector('#auth-toggle-profile');
    const profileForm = widget.querySelector('#auth-profile-form');
    const saveProfileBtn = widget.querySelector('#auth-save-profile');
    const statusEl = widget.querySelector('#auth-status');
    const userEl = widget.querySelector('#auth-user');

    const fields = {
      fullName: widget.querySelector('#profile-full-name'),
      birthDate: widget.querySelector('#profile-birth-date'),
      city: widget.querySelector('#profile-city'),
      neighborhood: widget.querySelector('#profile-neighborhood'),
      avatarUrl: widget.querySelector('#profile-avatar-url'),
      cpf: widget.querySelector('#profile-cpf'),
      cpfInfo: widget.querySelector('#profile-cpf-info'),
      emailOptIn: widget.querySelector('#profile-email-opt-in'),
      whatsappOptIn: widget.querySelector('#profile-whatsapp-opt-in'),
      terms: widget.querySelector('#profile-terms'),
      privacy: widget.querySelector('#profile-privacy')
    };

    async function loadProfile(userId) {
      currentUserId = userId;
      acceptedTermsAt = null;
      acceptedPrivacyAt = null;

      try {
        const profileRes = await client
          .from('profiles')
          .select('full_name,birth_date,city,neighborhood,avatar_url')
          .eq('id', userId)
          .maybeSingle();

        if (profileRes.error) {
          throw profileRes.error;
        }

        const consentRes = await client
          .from('user_marketing_consent')
          .select('email_opt_in,whatsapp_opt_in,accepted_terms_at,accepted_privacy_at')
          .eq('user_id', userId)
          .maybeSingle();

        if (consentRes.error) {
          throw consentRes.error;
        }

        const privateRes = await client
          .from('user_private_data')
          .select('cpf_last4')
          .eq('user_id', userId)
          .maybeSingle();

        if (privateRes.error) {
          throw privateRes.error;
        }

        const profile = profileRes.data || {};
        const consent = consentRes.data || {};
        const privateData = privateRes.data || {};

        fields.fullName.value = profile.full_name || '';
        fields.birthDate.value = profile.birth_date || '';
        fields.city.value = profile.city || '';
        fields.neighborhood.value = profile.neighborhood || '';
        fields.avatarUrl.value = profile.avatar_url || '';
        fields.cpf.value = '';

        acceptedTermsAt = consent.accepted_terms_at || null;
        acceptedPrivacyAt = consent.accepted_privacy_at || null;
        fields.emailOptIn.checked = Boolean(consent.email_opt_in);
        fields.whatsappOptIn.checked = Boolean(consent.whatsapp_opt_in);
        fields.terms.checked = Boolean(consent.accepted_terms_at);
        fields.privacy.checked = Boolean(consent.accepted_privacy_at);

        if (privateData.cpf_last4) {
          fields.cpfInfo.textContent = 'CPF salvo anteriormente. Finais: ' + privateData.cpf_last4;
        } else {
          fields.cpfInfo.textContent = 'CPF ainda nao informado.';
        }
      } catch (err) {
        setStatus(statusEl, 'Falha ao carregar perfil: ' + (err.message || 'erro desconhecido'), 'error');
      }
    }

    async function saveProfile() {
      if (!currentUserId) {
        setStatus(statusEl, 'Sessao invalida para salvar perfil.', 'error');
        return;
      }

      const cpfDigits = onlyDigits(fields.cpf.value);
      if (cpfDigits && cpfDigits.length !== 11) {
        setStatus(statusEl, 'CPF invalido. Informe 11 digitos.', 'error');
        return;
      }

      if (!fields.terms.checked || !fields.privacy.checked) {
        setStatus(statusEl, 'Para salvar, confirme termos e politica.', 'error');
        return;
      }

      const nowIso = new Date().toISOString();
      const finalTermsAt = fields.terms.checked
        ? (acceptedTermsAt || nowIso)
        : null;
      const finalPrivacyAt = fields.privacy.checked
        ? (acceptedPrivacyAt || nowIso)
        : null;

      saveProfileBtn.disabled = true;
      setStatus(statusEl, 'Salvando perfil...', '');

      try {
        const profilePayload = {
          id: currentUserId,
          full_name: fields.fullName.value.trim() || null,
          birth_date: fields.birthDate.value || null,
          city: fields.city.value.trim() || null,
          neighborhood: fields.neighborhood.value.trim() || null,
          avatar_url: fields.avatarUrl.value.trim() || null
        };

        const profileUpsert = await client
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' });

        if (profileUpsert.error) {
          throw profileUpsert.error;
        }

        const consentPayload = {
          user_id: currentUserId,
          email_opt_in: Boolean(fields.emailOptIn.checked),
          whatsapp_opt_in: Boolean(fields.whatsappOptIn.checked),
          accepted_terms_at: finalTermsAt,
          accepted_privacy_at: finalPrivacyAt
        };

        const consentUpsert = await client
          .from('user_marketing_consent')
          .upsert(consentPayload, { onConflict: 'user_id' });

        if (consentUpsert.error) {
          throw consentUpsert.error;
        }

        acceptedTermsAt = finalTermsAt;
        acceptedPrivacyAt = finalPrivacyAt;

        if (cpfDigits) {
          const cpfHash = await sha256Hex(cpfDigits);
          const privatePayload = {
            user_id: currentUserId,
            cpf_hash: cpfHash,
            cpf_last4: cpfDigits.slice(-4)
          };

          const privateUpsert = await client
            .from('user_private_data')
            .upsert(privatePayload, { onConflict: 'user_id' });

          if (privateUpsert.error) {
            throw privateUpsert.error;
          }

          fields.cpf.value = '';
          fields.cpfInfo.textContent = 'CPF salvo com hash. Finais: ' + cpfDigits.slice(-4);
        }

        setStatus(statusEl, 'Perfil salvo com sucesso.', 'ok');
      } catch (err) {
        setStatus(statusEl, 'Falha ao salvar perfil: ' + (err.message || 'erro desconhecido'), 'error');
      } finally {
        saveProfileBtn.disabled = false;
      }
    }

    function readCredentials() {
      const email = (emailInput.value || '').trim();
      const password = (passwordInput.value || '').trim();
      if (!email) {
        setStatus(statusEl, 'Digite um email valido.', 'error');
        emailInput.focus();
        return null;
      }
      return { email, password };
    }

    function withButtonsDisabled(callback) {
      resetPasswordBtn.disabled = true;
      loginPasswordBtn.disabled = true;
      signupPasswordBtn.disabled = true;
      return callback().finally(function () {
        resetPasswordBtn.disabled = false;
        loginPasswordBtn.disabled = false;
        signupPasswordBtn.disabled = false;
      });
    }

    setPasswordBtn.addEventListener('click', async function () {
      const newPassword = (newPasswordInput.value || '').trim();
      if (!newPassword || newPassword.length < 6) {
        setStatus(statusEl, 'Nova senha deve ter no minimo 6 caracteres.', 'error');
        newPasswordInput.focus();
        return;
      }

      setPasswordBtn.disabled = true;
      setStatus(statusEl, 'Salvando nova senha...', '');
      try {
        const result = await client.auth.updateUser({ password: newPassword });
        if (result.error) {
          throw result.error;
        }
        newPasswordInput.value = '';
        setStatus(statusEl, 'Senha atualizada com sucesso.', 'ok');
      } catch (err) {
        setStatus(statusEl, 'Falha ao atualizar senha: ' + (err.message || 'erro desconhecido'), 'error');
      } finally {
        setPasswordBtn.disabled = false;
      }
    });

    function renderSession(session) {
      const user = session && session.user ? session.user : null;
      if (user) {
        loggedOut.style.display = 'none';
        loggedIn.style.display = 'block';
        if (profileForm.style.display !== 'none') {
          profileForm.style.display = 'grid';
          toggleProfileBtn.textContent = 'Ocultar perfil';
        }
        userEl.textContent = 'Logado como: ' + (user.email || user.id);
        setStatus(statusEl, 'Sessao ativa.', 'ok');
        loadProfile(user.id);
      } else {
        loggedOut.style.display = 'block';
        loggedIn.style.display = 'none';
        profileForm.style.display = 'none';
        toggleProfileBtn.textContent = 'Completar perfil';
        userEl.textContent = '';
        currentUserId = '';
        setStatus(statusEl, 'Voce ainda nao entrou.', '');
      }
    }

    toggleProfileBtn.addEventListener('click', function () {
      const open = profileForm.style.display !== 'none';
      profileForm.style.display = open ? 'none' : 'grid';
      toggleProfileBtn.textContent = open ? 'Completar perfil' : 'Ocultar perfil';
    });

    profileForm.addEventListener('submit', function (event) {
      event.preventDefault();
      saveProfile();
    });

    resetPasswordBtn.addEventListener('click', async function () {
      const creds = readCredentials();
      if (!creds) {
        return;
      }

      await withButtonsDisabled(async function () {
        setStatus(statusEl, 'Enviando email para definir senha...', '');
        try {
          const redirect = config.defaultRedirectTo || (window.location.origin + window.location.pathname);
          const result = await client.auth.resetPasswordForEmail(creds.email, {
            redirectTo: redirect
          });

          if (result.error) {
            throw result.error;
          }

          setStatus(statusEl, 'Email enviado. Abra o link para definir sua senha.', 'ok');
        } catch (err) {
          setStatus(statusEl, 'Falha ao enviar email de senha: ' + (err.message || 'erro desconhecido'), 'error');
        }
      });
    });

    loginPasswordBtn.addEventListener('click', async function () {
      const creds = readCredentials();
      if (!creds) {
        return;
      }
      if (!creds.password || creds.password.length < 6) {
        setStatus(statusEl, 'Digite sua senha (minimo de 6 caracteres).', 'error');
        passwordInput.focus();
        return;
      }

      await withButtonsDisabled(async function () {
        setStatus(statusEl, 'Entrando...', '');
        try {
          const result = await client.auth.signInWithPassword({
            email: creds.email,
            password: creds.password
          });

          if (result.error) {
            throw result.error;
          }

          setStatus(statusEl, 'Login realizado com sucesso.', 'ok');
        } catch (err) {
          setStatus(statusEl, 'Falha no login: ' + (err.message || 'erro desconhecido'), 'error');
        }
      });
    });

    signupPasswordBtn.addEventListener('click', async function () {
      const creds = readCredentials();
      if (!creds) {
        return;
      }
      if (!creds.password || creds.password.length < 6) {
        setStatus(statusEl, 'Para criar conta, use senha com minimo de 6 caracteres.', 'error');
        passwordInput.focus();
        return;
      }

      await withButtonsDisabled(async function () {
        setStatus(statusEl, 'Criando conta...', '');
        try {
          const redirect = config.defaultRedirectTo || (window.location.origin + window.location.pathname);
          const result = await client.auth.signUp({
            email: creds.email,
            password: creds.password,
            options: { emailRedirectTo: redirect }
          });

          if (result.error) {
            throw result.error;
          }

          if (result.data && result.data.user && Array.isArray(result.data.user.identities) && result.data.user.identities.length === 0) {
            setStatus(statusEl, 'Email ja cadastrado. Use "Ja tenho conta" ou "Esqueci/definir senha".', 'error');
          } else if (result.data && result.data.session) {
            setStatus(statusEl, 'Conta criada e login ativo.', 'ok');
          } else {
            setStatus(statusEl, 'Conta criada. Verifique seu email para confirmar, se solicitado.', 'ok');
          }
        } catch (err) {
          setStatus(statusEl, 'Falha ao criar conta: ' + (err.message || 'erro desconhecido'), 'error');
        }
      });
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
    mountWidget(widget);
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
