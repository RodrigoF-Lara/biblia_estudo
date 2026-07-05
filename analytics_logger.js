(function () {
  const VISITOR_KEY = 'biblia_estudo_visitor_id';
  const SESSION_KEY = 'biblia_estudo_session_id';

  let context = {
    client: null,
    pagePath: window.location.pathname,
    getCurrentUser: null
  };

  let visitorIdCache = '';
  let sessionIdCache = '';

  function safeStorage(storage, key, fallbackValue) {
    try {
      const current = storage.getItem(key);
      if (current) return current;
      storage.setItem(key, fallbackValue);
      return fallbackValue;
    } catch (_err) {
      return fallbackValue;
    }
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
      const rand = Math.random() * 16 | 0;
      const value = char === 'x' ? rand : (rand & 0x3 | 0x8);
      return value.toString(16);
    });
  }

  function getVisitorId() {
    if (visitorIdCache) return visitorIdCache;
    const fallback = createId();
    if (window.localStorage) {
      visitorIdCache = safeStorage(window.localStorage, VISITOR_KEY, fallback);
    } else {
      visitorIdCache = fallback;
    }
    return visitorIdCache;
  }

  function getSessionId() {
    if (sessionIdCache) return sessionIdCache;
    const fallback = createId();
    if (window.sessionStorage) {
      sessionIdCache = safeStorage(window.sessionStorage, SESSION_KEY, fallback);
    } else {
      sessionIdCache = fallback;
    }
    return sessionIdCache;
  }

  function getCurrentUser() {
    if (typeof context.getCurrentUser === 'function') {
      try {
        return context.getCurrentUser() || null;
      } catch (_err) {
        return null;
      }
    }
    return null;
  }

  function normalizeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
      return {};
    }
    return metadata;
  }

  async function track(eventType, payload) {
    if (!context.client || !eventType) {
      return;
    }

    const currentUser = getCurrentUser();
    const data = payload || {};
    const row = {
      event_type: String(eventType),
      page_path: context.pagePath || window.location.pathname,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      user_id: currentUser && currentUser.id ? currentUser.id : null,
      user_email: currentUser && currentUser.email ? currentUser.email : null,
      study_id: data.studyId || null,
      study_title: data.studyTitle || null,
      study_ref: data.studyRef || null,
      metadata: normalizeMetadata(data.metadata)
    };

    try {
      await context.client.from('site_access_logs').insert(row);
    } catch (_err) {
      // silencioso: analytics nao pode quebrar a experiencia do site
    }
  }

  window.BibliaEstudoAnalytics = {
    configure(options) {
      context = {
        client: options && options.client ? options.client : context.client,
        pagePath: options && options.pagePath ? options.pagePath : context.pagePath,
        getCurrentUser: options && typeof options.getCurrentUser === 'function'
          ? options.getCurrentUser
          : context.getCurrentUser
      };
    },
    trackPageView(payload) {
      return track('page_view', payload);
    },
    trackEvent(eventType, payload) {
      return track(eventType, payload);
    },
    getVisitorId,
    getSessionId
  };
})();