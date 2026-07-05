(function () {
  const config = window.BIBLIA_SUPABASE_CONFIG || {};
  const hasConfig = Boolean(config.url && config.anonKey);

  let currentUserId = '';
  let acceptedTermsAt = null;
  let acceptedPrivacyAt = null;

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = [
      /* Menu hamburguer fixo (topo direito) */
      '.app-menu{position:fixed;top:12px;right:16px;z-index:10000;font-family:Arial,Helvetica,sans-serif}',
      '.app-menu *{box-sizing:border-box}',
      '.app-menu-btn{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 10px 0 8px;border:1px solid #e4ebe8;border-radius:999px;background:#fff;box-shadow:0 4px 14px rgba(16,46,43,.12);cursor:pointer}',
      '.app-menu-btn:hover{background:#f7faf9}',
      '.app-menu-lines{display:grid;gap:3px;width:18px}',
      '.app-menu-lines span{height:2px;background:#2f4c49;border-radius:2px;display:block}',
      '.app-avatar{width:30px;height:30px;border-radius:50%;background:#126b5f;color:#fff;display:none;place-items:center;font-size:12px;font-weight:700}',
      '.app-menu-caption{font-size:13px;font-weight:600;color:#243b39;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.app-menu-panel{position:absolute;right:0;top:calc(100% + 8px);width:250px;background:#fff;border:1px solid #e4ebe8;border-radius:12px;box-shadow:0 18px 40px rgba(16,46,43,.18);padding:8px;display:none}',
      '.app-menu-panel.open{display:block}',
      '.app-menu-userline{padding:8px 10px;border-bottom:1px solid #eef2f0;margin-bottom:6px}',
      '.app-menu-userline small{display:block;color:#7a8a87;font-size:11px}',
      '.app-menu-userline strong{display:block;color:#1f3b38;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.app-menu-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:none;border:none;border-radius:8px;padding:10px;font-size:14px;color:#213c39;cursor:pointer}',
      '.app-menu-item:hover{background:#f2f7f5}',
      '.app-menu-item .ic{width:18px;height:18px;flex:0 0 auto}',
      '.app-menu-item.danger{color:#8e3131}',
      '.app-menu-item.danger:hover{background:#fbeeee}',
      /* Overlay + Modal */
      '.auth-overlay{position:fixed;inset:0;background:rgba(15,30,28,.55);display:none;align-items:flex-start;justify-content:center;padding:40px 16px;z-index:10001;overflow:auto}',
      '.auth-overlay.open{display:flex}',
      '.auth-modal{width:100%;max-width:680px;background:#fff;border-radius:16px;box-shadow:0 30px 70px rgba(10,28,26,.35);overflow:hidden;animation:authpop .18s ease}',
      '@keyframes authpop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
      '.auth-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 22px;border-bottom:1px solid #eef2f0}',
      '.auth-modal-head h2{margin:0;font-size:18px;color:#153a36}',
      '.auth-modal-close{width:34px;height:34px;border-radius:50%;border:1px solid #e0e8e5;background:#f7faf9;font-size:18px;line-height:1;color:#3a5652;cursor:pointer}',
      '.auth-modal-close:hover{background:#eef4f2}',
      '.auth-modal-body{padding:22px}',
      '.auth-overlay form{display:block;margin:0;padding:0;grid-template-columns:none;gap:0}',
      '.auth-section-title{margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:#5c706d}',
      '.auth-section{margin-bottom:22px}',
      '.auth-section:last-child{margin-bottom:0}',
      '.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
      '.field{display:grid;gap:6px;min-width:0}',
      '.field.full{grid-column:1 / -1}',
      '.field label{font-size:12px;font-weight:700;color:#4b6160}',
      '.field input{width:100%;height:42px;border:1px solid #d3ddd9;border-radius:10px;padding:0 12px;font-size:14px;color:#1f2b2b}',
      '.field input:focus{outline:none;border-color:#126b5f;box-shadow:0 0 0 3px rgba(18,107,95,.14)}',
      '.field .hint{font-size:11px;color:#7a8a87}',
      '.avatar-edit{display:flex;align-items:center;gap:14px;flex-wrap:wrap}',
      '.avatar-preview{width:76px;height:76px;border-radius:50%;object-fit:cover;background:#e7efec;border:1px solid #d3ddd9;display:none}',
      '.avatar-actions{display:flex;gap:8px;flex-wrap:wrap}',
      '.avatar-actions .btn{height:38px;padding:0 14px;font-size:13px}',
      '.check-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
      '.check{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:#31504d;line-height:1.4;padding:10px 12px;border:1px solid #e6edea;border-radius:10px;background:#f9fcfb}',
      '.check input{margin-top:2px}',
      '.inline-row{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap}',
      '.inline-row .field{flex:1;min-width:180px}',
      '.btn{height:42px;border:1px solid #126b5f;background:#126b5f;color:#fff;border-radius:10px;padding:0 18px;font-size:14px;font-weight:700;cursor:pointer}',
      '.btn:hover{background:#0f5c52;border-color:#0f5c52}',
      '.btn.secondary{background:#fff;color:#144641;border-color:#c2d3ce}',
      '.btn.secondary:hover{background:#f3f9f7}',
      '.btn.block{width:100%}',
      '.linkbtn{background:none;border:none;color:#0f5c52;font-size:13px;font-weight:600;cursor:pointer;padding:4px 0}',
      '.linkbtn:hover{text-decoration:underline}',
      '.auth-modal-foot{display:flex;justify-content:flex-end;gap:10px;padding:16px 22px;border-top:1px solid #eef2f0;background:#fbfdfc}',
      '.auth-status{margin:14px 22px 0;font-size:13px;line-height:1.4;color:#3a5553}',
      '.auth-status:empty{display:none}',
      '.auth-status.error{color:#8e3131}',
      '.auth-status.ok{color:#2f6a42}',
      '@media (max-width:640px){.form-grid{grid-template-columns:1fr}.check-grid{grid-template-columns:1fr}.app-menu-caption{display:none}}',
      '@media print{.app-menu,.auth-overlay{display:none!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function createMenu() {
    const menu = document.createElement('div');
    menu.className = 'app-menu';
    menu.innerHTML = [
      '<button class="app-menu-btn" id="app-menu-btn" type="button" aria-label="Abrir menu">',
      '  <span class="app-menu-lines"><span></span><span></span><span></span></span>',
      '  <span class="app-avatar" id="app-avatar"></span>',
      '  <span class="app-menu-caption" id="app-menu-caption">Menu</span>',
      '</button>',
      '<div class="app-menu-panel" id="app-menu-panel">',
      '  <div class="app-menu-userline" id="app-menu-userline" style="display:none">',
      '    <small>Conectado como</small>',
      '    <strong id="app-menu-username"></strong>',
      '  </div>',
      '  <button class="app-menu-item" id="menu-login" type="button">Entrar</button>',
      '  <button class="app-menu-item" id="menu-account" type="button" style="display:none">Minha conta</button>',
      '  <button class="app-menu-item danger" id="menu-logout" type="button" style="display:none">Sair</button>',
      '</div>'
    ].join('');
    return menu;
  }

  function createLoginModal() {
    const overlay = document.createElement('div');
    overlay.className = 'auth-overlay';
    overlay.id = 'login-overlay';
    overlay.innerHTML = [
      '<div class="auth-modal" role="dialog" aria-modal="true" aria-label="Acesso a conta">',
      '  <div class="auth-modal-head">',
      '    <h2>Acesse sua conta</h2>',
      '    <button class="auth-modal-close" data-close="login" type="button" aria-label="Fechar">&times;</button>',
      '  </div>',
      '  <div class="auth-modal-body">',
      '    <div class="form-grid">',
      '      <div class="field full">',
      '        <label for="login-email">Email</label>',
      '        <input id="login-email" type="email" autocomplete="email" placeholder="voce@email.com" />',
      '      </div>',
      '      <div class="field full">',
      '        <label for="login-password">Senha</label>',
      '        <input id="login-password" type="password" autocomplete="current-password" placeholder="Sua senha" />',
      '      </div>',
      '    </div>',
      '    <p class="auth-status" id="login-status"></p>',
      '  </div>',
      '  <div class="auth-modal-foot">',
      '    <button class="linkbtn" id="login-reset" type="button">Esqueci / definir senha</button>',
      '    <button class="btn secondary" id="login-signup" type="button">Primeiro acesso</button>',
      '    <button class="btn" id="login-submit" type="button">Ja tenho conta</button>',
      '  </div>',
      '</div>'
    ].join('');
    return overlay;
  }

  function createAccountModal() {
    const overlay = document.createElement('div');
    overlay.className = 'auth-overlay';
    overlay.id = 'account-overlay';
    overlay.innerHTML = [
      '<div class="auth-modal" role="dialog" aria-modal="true" aria-label="Minha conta">',
      '  <div class="auth-modal-head">',
      '    <h2>Minha conta</h2>',
      '    <button class="auth-modal-close" data-close="account" type="button" aria-label="Fechar">&times;</button>',
      '  </div>',
      '  <div class="auth-modal-body">',
      '    <div class="auth-section">',
      '      <p class="auth-section-title">Seguranca</p>',
      '      <div class="inline-row">',
      '        <div class="field">',
      '          <label for="acc-new-password">Nova senha</label>',
      '          <input id="acc-new-password" type="password" autocomplete="new-password" placeholder="Minimo 6 caracteres" />',
      '        </div>',
      '        <button class="btn secondary" id="acc-set-password" type="button">Atualizar senha</button>',
      '      </div>',
      '    </div>',
      '    <form id="acc-profile-form">',
      '      <div class="auth-section">',
      '        <p class="auth-section-title">Dados pessoais</p>',
      '        <div class="form-grid">',
      '          <div class="field full">',
      '            <label for="acc-full-name">Nome completo</label>',
      '            <input id="acc-full-name" type="text" autocomplete="name" />',
      '          </div>',
      '          <div class="field">',
      '            <label for="acc-birth-date">Data de nascimento</label>',
      '            <input id="acc-birth-date" type="date" />',
      '          </div>',
      '          <div class="field">',
      '            <label for="acc-cpf">CPF</label>',
      '            <input id="acc-cpf" type="text" inputmode="numeric" placeholder="000.000.000-00" />',
      '            <span class="hint" id="acc-cpf-info"></span>',
      '          </div>',
      '        </div>',
      '      </div>',
      '      <div class="auth-section">',
      '        <p class="auth-section-title">Endereco e foto</p>',
      '        <div class="form-grid">',
      '          <div class="field">',
      '            <label for="acc-city">Cidade</label>',
      '            <input id="acc-city" type="text" autocomplete="address-level2" />',
      '          </div>',
      '          <div class="field">',
      '            <label for="acc-neighborhood">Bairro</label>',
      '            <input id="acc-neighborhood" type="text" autocomplete="address-level3" />',
      '          </div>',
      '          <div class="field full">',
      '            <label>Foto de perfil</label>',
      '            <div class="avatar-edit">',
      '              <img id="acc-avatar-preview" class="avatar-preview" alt="Foto de perfil" />',
      '              <div class="avatar-actions">',
      '                <button type="button" class="btn secondary" id="acc-photo-upload-btn">Enviar arquivo</button>',
      '                <button type="button" class="btn secondary" id="acc-photo-camera-btn">Usar camera</button>',
      '              </div>',
      '              <input type="file" id="acc-photo-file" accept="image/*" style="display:none" />',
      '              <input type="file" id="acc-photo-camera" accept="image/*" capture="user" style="display:none" />',
      '              <input type="hidden" id="acc-avatar-url" />',
      '              <span class="hint" id="acc-photo-status"></span>',
      '            </div>',
      '          </div>',
      '        </div>',
      '      </div>',
      '      <div class="auth-section">',
      '        <p class="auth-section-title">Comunicacao e consentimento</p>',
      '        <div class="check-grid">',
      '          <label class="check"><input id="acc-email-opt-in" type="checkbox" /> Receber comunicacoes por email</label>',
      '          <label class="check"><input id="acc-whatsapp-opt-in" type="checkbox" /> Receber comunicacoes por WhatsApp</label>',
      '          <label class="check"><input id="acc-terms" type="checkbox" /> Aceito os termos de uso</label>',
      '          <label class="check"><input id="acc-privacy" type="checkbox" /> Aceito a politica de privacidade</label>',
      '        </div>',
      '      </div>',
      '    </form>',
      '    <p class="auth-status" id="account-status"></p>',
      '  </div>',
      '  <div class="auth-modal-foot">',
      '    <button class="btn secondary" data-close="account" type="button">Fechar</button>',
      '    <button class="btn" id="acc-save" type="button">Salvar perfil</button>',
      '  </div>',
      '</div>'
    ].join('');
    return overlay;
  }

  function setStatus(el, message, type) {
    if (!el) return;
    el.textContent = message || '';
    el.className = 'auth-status' + (type ? ' ' + type : '');
  }

  function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function initialsFromEmail(email) {
    const base = (email || '').split('@')[0] || '?';
    return base.slice(0, 2).toUpperCase();
  }

  async function sha256Hex(value) {
    const enc = new TextEncoder();
    const data = enc.encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function boot(client, refs) {
    const {
      menu, menuBtn, menuPanel, avatarEl, captionEl, userLine, userNameEl,
      menuLogin, menuAccount, menuLogout,
      loginOverlay, accountOverlay
    } = refs;

    const loginEmail = loginOverlay.querySelector('#login-email');
    const loginPassword = loginOverlay.querySelector('#login-password');
    const loginSubmit = loginOverlay.querySelector('#login-submit');
    const loginSignup = loginOverlay.querySelector('#login-signup');
    const loginReset = loginOverlay.querySelector('#login-reset');
    const loginStatus = loginOverlay.querySelector('#login-status');

    const accStatus = accountOverlay.querySelector('#account-status');
    const accSetPassword = accountOverlay.querySelector('#acc-set-password');
    const accNewPassword = accountOverlay.querySelector('#acc-new-password');
    const accSave = accountOverlay.querySelector('#acc-save');
    const accForm = accountOverlay.querySelector('#acc-profile-form');

    const fields = {
      fullName: accountOverlay.querySelector('#acc-full-name'),
      birthDate: accountOverlay.querySelector('#acc-birth-date'),
      city: accountOverlay.querySelector('#acc-city'),
      neighborhood: accountOverlay.querySelector('#acc-neighborhood'),
      avatarUrl: accountOverlay.querySelector('#acc-avatar-url'),
      cpf: accountOverlay.querySelector('#acc-cpf'),
      cpfInfo: accountOverlay.querySelector('#acc-cpf-info'),
      emailOptIn: accountOverlay.querySelector('#acc-email-opt-in'),
      whatsappOptIn: accountOverlay.querySelector('#acc-whatsapp-opt-in'),
      terms: accountOverlay.querySelector('#acc-terms'),
      privacy: accountOverlay.querySelector('#acc-privacy')
    };

    const avatarPreview = accountOverlay.querySelector('#acc-avatar-preview');
    const photoFileInput = accountOverlay.querySelector('#acc-photo-file');
    const photoCameraInput = accountOverlay.querySelector('#acc-photo-camera');
    const photoUploadBtn = accountOverlay.querySelector('#acc-photo-upload-btn');
    const photoCameraBtn = accountOverlay.querySelector('#acc-photo-camera-btn');
    const photoStatus = accountOverlay.querySelector('#acc-photo-status');

    function setAvatarPreview(url) {
      if (url) {
        avatarPreview.src = url;
        avatarPreview.style.display = 'block';
      } else {
        avatarPreview.removeAttribute('src');
        avatarPreview.style.display = 'none';
      }
    }

    let menuInitials = '';
    function setMenuAvatar(url) {
      if (url) {
        avatarEl.textContent = '';
        avatarEl.style.backgroundImage = 'url("' + url + '")';
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.style.backgroundPosition = 'center';
      } else {
        avatarEl.style.backgroundImage = 'none';
        avatarEl.textContent = menuInitials;
      }
    }

    async function handleAvatarFile(file) {
      if (!file) return;
      if (!currentUserId) {
        photoStatus.textContent = 'Faca login para enviar foto.';
        return;
      }
      if (!/^image\//.test(file.type)) {
        photoStatus.textContent = 'Selecione um arquivo de imagem.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        photoStatus.textContent = 'Imagem muito grande (maximo 5MB).';
        return;
      }

      photoStatus.textContent = 'Enviando foto...';
      try {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const path = currentUserId + '/avatar_' + Date.now() + '.' + ext;
        const up = await client.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
        if (up.error) throw up.error;

        const pub = client.storage.from('avatars').getPublicUrl(path);
        const url = (pub && pub.data && pub.data.publicUrl) ? pub.data.publicUrl : '';
        fields.avatarUrl.value = url;
        setAvatarPreview(url);
        setMenuAvatar(url);

        const upd = await client.from('profiles').upsert({ id: currentUserId, avatar_url: url }, { onConflict: 'id' });
        if (upd.error) throw upd.error;

        photoStatus.textContent = 'Foto atualizada.';
      } catch (err) {
        photoStatus.textContent = 'Falha ao enviar foto: ' + (err.message || 'erro desconhecido');
      }
    }

    photoUploadBtn.addEventListener('click', function () { photoFileInput.click(); });
    photoCameraBtn.addEventListener('click', function () { photoCameraInput.click(); });
    photoFileInput.addEventListener('change', function (e) { handleAvatarFile(e.target.files && e.target.files[0]); this.value = ''; });
    photoCameraInput.addEventListener('change', function (e) { handleAvatarFile(e.target.files && e.target.files[0]); this.value = ''; });

    function setMenuOpen(open) {
      menuPanel.classList.toggle('open', Boolean(open));
    }

    function openOverlay(overlay) {
      overlay.classList.add('open');
    }

    function closeOverlay(overlay) {
      overlay.classList.remove('open');
    }

    function readLoginCredentials() {
      const email = (loginEmail.value || '').trim();
      const password = (loginPassword.value || '').trim();
      if (!email) {
        setStatus(loginStatus, 'Digite um email valido.', 'error');
        loginEmail.focus();
        return null;
      }
      return { email, password };
    }

    async function loadProfile(userId) {
      currentUserId = userId;
      acceptedTermsAt = null;
      acceptedPrivacyAt = null;

      try {
        const profileRes = await client.from('profiles').select('full_name,birth_date,city,neighborhood,avatar_url').eq('id', userId).maybeSingle();
        if (profileRes.error) throw profileRes.error;

        const consentRes = await client.from('user_marketing_consent').select('email_opt_in,whatsapp_opt_in,accepted_terms_at,accepted_privacy_at').eq('user_id', userId).maybeSingle();
        if (consentRes.error) throw consentRes.error;

        const privateRes = await client.from('user_private_data').select('cpf,cpf_last4').eq('user_id', userId).maybeSingle();
        if (privateRes.error) throw privateRes.error;

        const profile = profileRes.data || {};
        const consent = consentRes.data || {};
        const privateData = privateRes.data || {};

        fields.fullName.value = profile.full_name || '';
        fields.birthDate.value = profile.birth_date || '';
        fields.city.value = profile.city || '';
        fields.neighborhood.value = profile.neighborhood || '';
        fields.avatarUrl.value = profile.avatar_url || '';
        setAvatarPreview(profile.avatar_url || '');
        setMenuAvatar(profile.avatar_url || '');

        acceptedTermsAt = consent.accepted_terms_at || null;
        acceptedPrivacyAt = consent.accepted_privacy_at || null;
        fields.emailOptIn.checked = Boolean(consent.email_opt_in);
        fields.whatsappOptIn.checked = Boolean(consent.whatsapp_opt_in);
        fields.terms.checked = Boolean(consent.accepted_terms_at);
        fields.privacy.checked = Boolean(consent.accepted_privacy_at);

        fields.cpf.value = privateData.cpf || '';
        fields.cpfInfo.textContent = privateData.cpf ? '' : 'CPF ainda nao informado.';
        if (photoStatus) photoStatus.textContent = '';
      } catch (err) {
        setStatus(accStatus, 'Falha ao carregar perfil: ' + (err.message || 'erro desconhecido'), 'error');
      }
    }

    async function saveProfile() {
      if (!currentUserId) {
        setStatus(accStatus, 'Sessao invalida para salvar perfil.', 'error');
        return;
      }

      const cpfDigits = onlyDigits(fields.cpf.value);
      if (cpfDigits && cpfDigits.length !== 11) {
        setStatus(accStatus, 'CPF invalido. Informe 11 digitos.', 'error');
        return;
      }

      if (!fields.terms.checked || !fields.privacy.checked) {
        setStatus(accStatus, 'Para salvar, confirme termos e politica.', 'error');
        return;
      }

      const nowIso = new Date().toISOString();
      const finalTermsAt = fields.terms.checked ? (acceptedTermsAt || nowIso) : null;
      const finalPrivacyAt = fields.privacy.checked ? (acceptedPrivacyAt || nowIso) : null;

      accSave.disabled = true;
      setStatus(accStatus, 'Salvando perfil...', '');

      try {
        const profilePayload = {
          id: currentUserId,
          full_name: fields.fullName.value.trim() || null,
          birth_date: fields.birthDate.value || null,
          city: fields.city.value.trim() || null,
          neighborhood: fields.neighborhood.value.trim() || null,
          avatar_url: fields.avatarUrl.value.trim() || null
        };

        const profileUpsert = await client.from('profiles').upsert(profilePayload, { onConflict: 'id' });
        if (profileUpsert.error) throw profileUpsert.error;

        const consentPayload = {
          user_id: currentUserId,
          email_opt_in: Boolean(fields.emailOptIn.checked),
          whatsapp_opt_in: Boolean(fields.whatsappOptIn.checked),
          accepted_terms_at: finalTermsAt,
          accepted_privacy_at: finalPrivacyAt
        };

        const consentUpsert = await client.from('user_marketing_consent').upsert(consentPayload, { onConflict: 'user_id' });
        if (consentUpsert.error) throw consentUpsert.error;

        acceptedTermsAt = finalTermsAt;
        acceptedPrivacyAt = finalPrivacyAt;

        const privatePayload = {
          user_id: currentUserId,
          cpf: fields.cpf.value.trim() || null,
          cpf_last4: cpfDigits ? cpfDigits.slice(-4) : null
        };

        const privateUpsert = await client.from('user_private_data').upsert(privatePayload, { onConflict: 'user_id' });
        if (privateUpsert.error) throw privateUpsert.error;

        fields.cpfInfo.textContent = cpfDigits ? '' : 'CPF ainda nao informado.';

        setStatus(accStatus, 'Perfil salvo com sucesso.', 'ok');
      } catch (err) {
        setStatus(accStatus, 'Falha ao salvar perfil: ' + (err.message || 'erro desconhecido'), 'error');
      } finally {
        accSave.disabled = false;
      }
    }

    function renderSession(session) {
      const user = session && session.user ? session.user : null;
      if (user) {
        avatarEl.style.display = 'grid';
        menuInitials = initialsFromEmail(user.email || user.id);
        setMenuAvatar('');
        captionEl.textContent = (user.email || '').split('@')[0] || 'Conta';
        userLine.style.display = 'block';
        userNameEl.textContent = user.email || user.id;
        menuLogin.style.display = 'none';
        menuAccount.style.display = 'flex';
        menuLogout.style.display = 'flex';
        loadProfile(user.id);
      } else {
        avatarEl.style.display = 'none';
        captionEl.textContent = 'Menu';
        userLine.style.display = 'none';
        userNameEl.textContent = '';
        menuLogin.style.display = 'flex';
        menuAccount.style.display = 'none';
        menuLogout.style.display = 'none';
        currentUserId = '';
      }
    }

    // Menu interactions
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenuOpen(!menuPanel.classList.contains('open'));
    });

    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) {
        setMenuOpen(false);
      }
    });

    menuLogin.addEventListener('click', function () {
      setMenuOpen(false);
      setStatus(loginStatus, '', '');
      openOverlay(loginOverlay);
      loginEmail.focus();
    });

    menuAccount.addEventListener('click', function () {
      setMenuOpen(false);
      setStatus(accStatus, '', '');
      openOverlay(accountOverlay);
    });

    menuLogout.addEventListener('click', async function () {
      setMenuOpen(false);
      try {
        await client.auth.signOut();
      } catch (err) {
        // silencioso
      }
    });

    // Overlay close handlers
    [loginOverlay, accountOverlay].forEach(function (overlay) {
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          closeOverlay(overlay);
        }
      });
      overlay.querySelectorAll('[data-close]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          closeOverlay(overlay);
        });
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeOverlay(loginOverlay);
        closeOverlay(accountOverlay);
        setMenuOpen(false);
      }
    });

    // Login actions
    loginSubmit.addEventListener('click', async function () {
      const creds = readLoginCredentials();
      if (!creds) return;
      if (!creds.password || creds.password.length < 6) {
        setStatus(loginStatus, 'Digite sua senha (minimo de 6 caracteres).', 'error');
        loginPassword.focus();
        return;
      }
      loginSubmit.disabled = true;
      setStatus(loginStatus, 'Entrando...', '');
      try {
        const result = await client.auth.signInWithPassword({ email: creds.email, password: creds.password });
        if (result.error) throw result.error;
        setStatus(loginStatus, 'Login realizado com sucesso.', 'ok');
        closeOverlay(loginOverlay);
      } catch (err) {
        setStatus(loginStatus, 'Falha no login: ' + (err.message || 'erro desconhecido'), 'error');
      } finally {
        loginSubmit.disabled = false;
      }
    });

    loginSignup.addEventListener('click', async function () {
      const creds = readLoginCredentials();
      if (!creds) return;
      if (!creds.password || creds.password.length < 6) {
        setStatus(loginStatus, 'Para criar conta, use senha com minimo de 6 caracteres.', 'error');
        loginPassword.focus();
        return;
      }
      loginSignup.disabled = true;
      setStatus(loginStatus, 'Criando conta...', '');
      try {
        const redirect = config.defaultRedirectTo || (window.location.origin + window.location.pathname);
        const result = await client.auth.signUp({
          email: creds.email,
          password: creds.password,
          options: { emailRedirectTo: redirect }
        });
        if (result.error) throw result.error;

        if (result.data && result.data.user && Array.isArray(result.data.user.identities) && result.data.user.identities.length === 0) {
          setStatus(loginStatus, 'Email ja cadastrado. Use "Ja tenho conta" ou "Esqueci / definir senha".', 'error');
        } else if (result.data && result.data.session) {
          setStatus(loginStatus, 'Conta criada e login ativo.', 'ok');
          closeOverlay(loginOverlay);
        } else {
          setStatus(loginStatus, 'Conta criada. Verifique seu email para confirmar, se solicitado.', 'ok');
        }
      } catch (err) {
        setStatus(loginStatus, 'Falha ao criar conta: ' + (err.message || 'erro desconhecido'), 'error');
      } finally {
        loginSignup.disabled = false;
      }
    });

    loginReset.addEventListener('click', async function () {
      const creds = readLoginCredentials();
      if (!creds) return;
      loginReset.disabled = true;
      setStatus(loginStatus, 'Enviando email para definir senha...', '');
      try {
        const redirect = config.defaultRedirectTo || (window.location.origin + window.location.pathname);
        const result = await client.auth.resetPasswordForEmail(creds.email, { redirectTo: redirect });
        if (result.error) throw result.error;
        setStatus(loginStatus, 'Email enviado. Abra o link para definir sua senha.', 'ok');
      } catch (err) {
        setStatus(loginStatus, 'Falha ao enviar email: ' + (err.message || 'erro desconhecido'), 'error');
      } finally {
        loginReset.disabled = false;
      }
    });

    // Account actions
    accSetPassword.addEventListener('click', async function () {
      const newPassword = (accNewPassword.value || '').trim();
      if (!newPassword || newPassword.length < 6) {
        setStatus(accStatus, 'Nova senha deve ter no minimo 6 caracteres.', 'error');
        accNewPassword.focus();
        return;
      }
      accSetPassword.disabled = true;
      setStatus(accStatus, 'Salvando nova senha...', '');
      try {
        const result = await client.auth.updateUser({ password: newPassword });
        if (result.error) throw result.error;
        accNewPassword.value = '';
        setStatus(accStatus, 'Senha atualizada com sucesso.', 'ok');
      } catch (err) {
        setStatus(accStatus, 'Falha ao atualizar senha: ' + (err.message || 'erro desconhecido'), 'error');
      } finally {
        accSetPassword.disabled = false;
      }
    });

    accSave.addEventListener('click', function () {
      saveProfile();
    });

    accForm.addEventListener('submit', function (event) {
      event.preventDefault();
      saveProfile();
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

    const menu = createMenu();
    document.body.appendChild(menu);

    const loginOverlay = createLoginModal();
    const accountOverlay = createAccountModal();
    document.body.appendChild(loginOverlay);
    document.body.appendChild(accountOverlay);

    const refs = {
      menu: menu,
      menuBtn: menu.querySelector('#app-menu-btn'),
      menuPanel: menu.querySelector('#app-menu-panel'),
      avatarEl: menu.querySelector('#app-avatar'),
      captionEl: menu.querySelector('#app-menu-caption'),
      userLine: menu.querySelector('#app-menu-userline'),
      userNameEl: menu.querySelector('#app-menu-username'),
      menuLogin: menu.querySelector('#menu-login'),
      menuAccount: menu.querySelector('#menu-account'),
      menuLogout: menu.querySelector('#menu-logout'),
      loginOverlay: loginOverlay,
      accountOverlay: accountOverlay
    };

    if (!window.supabase || !window.supabase.createClient) {
      refs.captionEl.textContent = 'Menu';
      return;
    }

    if (!hasConfig) {
      refs.captionEl.textContent = 'Menu';
      return;
    }

    const client = window.supabase.createClient(config.url, config.anonKey);
    boot(client, refs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
