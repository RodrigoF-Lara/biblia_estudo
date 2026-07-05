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
  let actorInfoCache = null;
  let actorInfoCacheKey = '';

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

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function getActorCacheKey(currentUser) {
    return currentUser && currentUser.id ? 'user:' + currentUser.id : 'anon:' + getVisitorId();
  }

  async function fetchAnonymousNetworkInfo() {
    const result = {
      name: 'Visitante',
      city: null,
      ip: null
    };

    try {
      const [ipRes, geoRes] = await Promise.allSettled([
        fetch('https://api.ipify.org?format=json').then(function (res) { return res.ok ? res.json() : null; }),
        fetch('https://ipapi.co/json/').then(function (res) { return res.ok ? res.json() : null; })
      ]);

      if (ipRes.status === 'fulfilled' && ipRes.value && ipRes.value.ip) {
        result.ip = String(ipRes.value.ip);
      }

      if (geoRes.status === 'fulfilled' && geoRes.value) {
        result.city = geoRes.value.city || geoRes.value.region || geoRes.value.country_name || null;
        if (!result.ip && geoRes.value.ip) {
          result.ip = String(geoRes.value.ip);
        }
      }
    } catch (_err) {
      // silencioso
    }

    return result;
  }

  async function resolveActorInfo(currentUser) {
    const cacheKey = getActorCacheKey(currentUser);
    if (actorInfoCache && actorInfoCacheKey === cacheKey) {
      return actorInfoCache;
    }

    let info = {
      name: currentUser && currentUser.email ? String(currentUser.email).split('@')[0] : 'Visitante',
      city: null,
      ip: null
    };

    if (currentUser && currentUser.id) {
      try {
        const profileRes = await context.client
          .from('profiles')
          .select('full_name, city')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (!profileRes.error && profileRes.data) {
          info.name = profileRes.data.full_name || info.name;
          info.city = profileRes.data.city || null;
        }
      } catch (_err) {
        // silencioso
      }
    } else {
      info = await fetchAnonymousNetworkInfo();
    }

    actorInfoCache = info;
    actorInfoCacheKey = cacheKey;
    return info;
  }

  async function waitForCurrentUser(maxWaitMs) {
    const deadline = Date.now() + (maxWaitMs || 1200);
    let currentUser = getCurrentUser();

    while (!currentUser && Date.now() < deadline) {
      if (context.client && context.client.auth && typeof context.client.auth.getSession === 'function') {
        try {
          const sessionRes = await context.client.auth.getSession();
          currentUser = sessionRes && sessionRes.data && sessionRes.data.session
            ? sessionRes.data.session.user
            : null;
        } catch (_err) {
          currentUser = null;
        }
        if (currentUser) {
          break;
        }
      }
      await sleep(100);
      currentUser = getCurrentUser();
    }

    return currentUser;
  }

  async function track(eventType, payload) {
    if (!context.client || !eventType) {
      return;
    }

    const currentUser = await waitForCurrentUser(1200);
    const data = payload || {};
    const actorInfo = await resolveActorInfo(currentUser);
    const row = {
      event_type: String(eventType),
      page_path: context.pagePath || window.location.pathname,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      user_id: currentUser && currentUser.id ? currentUser.id : null,
      user_email: currentUser && currentUser.email ? currentUser.email : null,
      actor_name: actorInfo.name || null,
      actor_city: actorInfo.city || null,
      actor_ip: actorInfo.ip || null,
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
      actorInfoCache = null;
      actorInfoCacheKey = '';
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