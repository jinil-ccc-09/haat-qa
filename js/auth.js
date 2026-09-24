(function (global) {
  'use strict';

  const Store = {
    get(key, fallback, area) {
      try {
        const raw = (area || localStorage).getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value, area) {
      try { (area || localStorage).setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    },
    remove(key, area) {
      try { (area || localStorage).removeItem(key); } catch (e) { /* storage unavailable */ }
    }
  };

  const Util = {
    round2(v) { return Math.round((Number(v) + Number.EPSILON) * 100) / 100; },
    inr(v) {
      const n = Number(v) || 0;
      return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    esc(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },
    qs(sel, root) { return (root || document).querySelector(sel); },
    qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  };

  const UI = {
    toast(message, tone) {
      let shelf = document.getElementById('toastShelf');
      if (!shelf) {
        shelf = document.createElement('div');
        shelf.id = 'toastShelf';
        shelf.className = 'toast-shelf';
        shelf.setAttribute('role', 'status');
        shelf.setAttribute('aria-live', 'polite');
        document.body.appendChild(shelf);
      }
      const t = document.createElement('div');
      t.className = 'toast toast--' + (tone || 'info');
      t.textContent = message;
      shelf.appendChild(t);
      requestAnimationFrame(() => t.classList.add('is-in'));
      setTimeout(() => {
        t.classList.remove('is-in');
        setTimeout(() => t.remove(), 300);
      }, 2600);
    },
    openModal(id) {
      const m = document.getElementById(id);
      if (!m) return;
      m.hidden = false;
      document.body.classList.add('no-scroll');
      const focusable = m.querySelector('input, button, [href]');
      if (focusable) setTimeout(() => focusable.focus(), 30);
    },
    closeModal(id) {
      const m = document.getElementById(id);
      if (!m) return;
      m.hidden = true;
      document.body.classList.remove('no-scroll');
    },
    wireModals() {
      Util.qsa('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => UI.closeModal(btn.getAttribute('data-close')));
      });
      Util.qsa('.modal').forEach(m => {
        m.addEventListener('click', e => { if (e.target === m) UI.closeModal(m.id); });
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') Util.qsa('.modal:not([hidden])').forEach(m => UI.closeModal(m.id));
      });
    }
  };

  const KEYS = {
    session: 'haat.session',
    attempts: 'haat.attempts',
    lastEmail: 'haat.lastEmail'
  };

  const USERS = [
    { email: 'asha@haat.in', password: 'Asha@1234', name: 'Asha Verma', status: 'active' },
    { email: 'ravi@haat.in', password: 'Ravi#2026', name: 'Ravi Kulkarni', status: 'active' },
    { email: 'meera@haat.in', password: 'Meera$789', name: 'Meera Iyer', status: 'inactive' }
  ];

  const POLICY = { maxAttempts: 3, lockMinutes: 5, emailMax: 50, passMin: 8, passMax: 20 };

  const PAGES = ['products.html', 'cart.html', 'checkout.html', 'orders.html'];

  const Auth = {
    policy: POLICY,

    isValidEmail(value) {
      return /^[\w.+-]+@([\w-]+\.)*[\w-]*$/.test(value);
    },

    checkEmail(value) {
      const v = value.trim();
      if (!v) return 'Email is required.';
      if (v.length > POLICY.emailMax) return 'Email must not exceed 50 characters.';
      if (!Auth.isValidEmail(v)) return 'Enter a valid email address (e.g. name@example.com).';
      return '';
    },

    checkPassword(value) {
      if (!value) return 'Password is required.';
      if (value.length < POLICY.passMin) return 'Password must be 8 to 20 characters long.';
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(value)) {
        return 'Password must contain an uppercase letter, a lowercase letter, a number and a special character.';
      }
      return '';
    },

    attemptsFor(email) {
      const all = Store.get(KEYS.attempts, {});
      const rec = all[email] || { count: 0, lockedUntil: 0 };
      if (rec.lockedUntil && rec.lockedUntil <= Date.now()) {
        return { count: 0, lockedUntil: 0 };
      }
      return rec;
    },

    saveAttempts(email, rec) {
      const all = Store.get(KEYS.attempts, {});
      all[email] = rec;
      Store.set(KEYS.attempts, all);
    },

    authenticate(email, password) {
      const key = email.trim().toLowerCase();
      const rec = Auth.attemptsFor(key);
      if (rec.lockedUntil > Date.now()) {
        return { ok: false, reason: 'locked', until: rec.lockedUntil };
      }
      const user = USERS.find(u => u.email === key);
      if (!user) return { ok: false, reason: 'invalid' };

      if (user.password !== password) {
        rec.count += 1;
        if (rec.count > POLICY.maxAttempts) {
          rec.lockedUntil = Date.now() + POLICY.lockMinutes * 60 * 1000;
          Auth.saveAttempts(key, rec);
          return { ok: false, reason: 'locked', until: rec.lockedUntil, justLocked: true };
        }
        Auth.saveAttempts(key, rec);
        return { ok: false, reason: 'invalid', remaining: Math.max(0, POLICY.maxAttempts - rec.count) };
      }

      if (user.status !== 'active') return { ok: false, reason: 'inactive' };

      Auth.saveAttempts(key, { count: 0, lockedUntil: 0 });
      return { ok: true, user };
    },

    startSession(user, remember) {
      const session = { email: user.email, name: user.name, since: new Date().toISOString() };
      if (remember) {
        Store.set(KEYS.session, session);
        Store.set(KEYS.lastEmail, user.email);
      } else {
        Store.set(KEYS.session, session, sessionStorage);
        Store.remove(KEYS.lastEmail);
      }
      return session;
    },

    getSession() {
      return Store.get(KEYS.session, null, sessionStorage) || Store.get(KEYS.session, null);
    },

    rememberedEmail() {
      return Store.get(KEYS.lastEmail, '');
    },

    guard() {
      if (!Auth.getSession()) {
        const here = location.pathname.split('/').pop() || 'products.html';
        location.replace('login.html?next=' + encodeURIComponent(here));
      }
    },

    logout() {
      try { sessionStorage.clear(); } catch (e) { /* storage unavailable */ }
      location.replace('login.html?out=1');
    },

    userKey(prefix) {
      const s = Auth.getSession();
      return prefix + '.' + (s ? s.email : 'guest');
    },

    cartCount() {
      const lines = Store.get(Auth.userKey('haat.cart'), []);
      return lines.reduce((n, l) => n + (Number(l.qty) || 0), 0);
    },

    refreshBadge() {
      const b = document.getElementById('cartBadge');
      if (!b) return;
      const n = Auth.cartCount();
      b.textContent = n;
      b.hidden = n === 0;
    },

    mountHeader(active) {
      const host = document.getElementById('siteHeader');
      const s = Auth.getSession();
      if (!host || !s) return;
      const first = Util.esc(s.name.split(' ')[0]);
      const link = (href, label, key, extra) =>
        `<a href="${href}" class="nav-link${active === key ? ' is-active' : ''}"${active === key ? ' aria-current="page"' : ''}>${label}${extra || ''}</a>`;
      host.innerHTML = `
        <div class="bar">
          <a class="brand" href="products.html" aria-label="Haat home">
            <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
              <g fill="currentColor">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<ellipse cx="20" cy="9" rx="3" ry="6" transform="rotate(${a} 20 20)"/>`).join('')}</g>
              <circle cx="20" cy="20" r="4" fill="#e3a72f"/>
            </svg>
            <span class="brand-word">Haat<small>hand-made bazaar</small></span>
          </a>
          <nav class="nav" aria-label="Main">
            ${link('products.html', 'Shop', 'shop')}
            ${link('cart.html', 'Basket', 'cart', ' <span id="cartBadge" class="badge" hidden>0</span>')}
            ${link('orders.html', 'Orders', 'orders')}
          </nav>
          <div class="who">
            <span class="hello">Namaste, <b>${first}</b></span>
            <button type="button" class="btn btn--ghost btn--sm" id="logoutBtn">Log out</button>
          </div>
        </div>
        <div class="kangura" aria-hidden="true"></div>`;
      document.getElementById('logoutBtn').addEventListener('click', Auth.logout);
      Auth.refreshBadge();
    }
  };

  function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const toggle = document.getElementById('togglePass');
    const captchaInput = document.getElementById('captchaInput');
    const remember = document.getElementById('remember');
    const alertBox = document.getElementById('formAlert');
    const loginBtn = document.getElementById('loginBtn');

    Captcha.mount(document.getElementById('captchaCanvas'), captchaInput, document.getElementById('captchaRefresh'));

    const params = new URLSearchParams(location.search);
    if (params.get('out')) showAlert('You have been logged out safely.', 'info');
    else if (params.get('next')) showAlert('Please log in to continue.', 'info');

    const saved = Auth.rememberedEmail();
    if (saved) {
      email.value = saved;
      remember.checked = true;
    }

    toggle.addEventListener('click', () => {
      const show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Hide' : 'Show';
      toggle.setAttribute('aria-pressed', String(show));
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });

    function setError(field, message) {
      const box = document.getElementById(field.id + 'Err');
      field.classList.toggle('is-invalid', !!message);
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (box) box.textContent = message || '';
    }

    function showAlert(message, tone) {
      alertBox.textContent = message;
      alertBox.className = 'alert alert--' + tone;
      alertBox.hidden = false;
    }

    [email, password, captchaInput].forEach(f => f.addEventListener('input', () => setError(f, '')));

    function lockText(until) {
      const ms = Math.max(0, until - Date.now());
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      return `Account locked after too many failed attempts. Try again in ${m}:${String(s).padStart(2, '0')} minutes.`;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      alertBox.hidden = true;

      const eMsg = Auth.checkEmail(email.value);
      const pMsg = Auth.checkPassword(password.value);
      const cMsg = captchaInput.value.trim() ? '' : 'Enter the characters shown in the captcha.';
      setError(email, eMsg);
      setError(password, pMsg);
      setError(captchaInput, cMsg);
      if (eMsg || pMsg || cMsg) {
        (eMsg ? email : pMsg ? password : captchaInput).focus();
        return;
      }

      if (!Captcha.matches(captchaInput.value)) {
        setError(captchaInput, 'Captcha does not match. A new captcha has been generated.');
        Captcha.reset();
        captchaInput.focus();
        return;
      }

      const result = Auth.authenticate(email.value, password.value);
      if (!result.ok) {
        Captcha.reset();
        if (result.reason === 'locked') {
          showAlert(lockText(result.until), 'error');
        } else if (result.reason === 'inactive') {
          showAlert('This account is inactive. Please contact support@haat.in.', 'error');
        } else if (typeof result.remaining === 'number') {
          showAlert(`Invalid email or password. ${result.remaining} attempt${result.remaining === 1 ? '' : 's'} left before your account is locked.`, 'error');
        } else {
          showAlert('Invalid email or password.', 'error');
        }
        password.value = '';
        password.focus();
        return;
      }

      Auth.startSession(result.user, remember.checked);
      showAlert(`Login successful. Welcome back, ${result.user.name.split(' ')[0]}! Taking you to the haat…`, 'success');
      loginBtn.disabled = true;
      loginBtn.classList.add('is-loading');
      const next = params.get('next');
      const target = PAGES.includes(next) ? next : 'products.html';
      setTimeout(() => location.replace(target), 900);
    });

    document.getElementById('forgotLink').addEventListener('click', e => {
      e.preventDefault();
      const fe = document.getElementById('forgotEmail');
      fe.value = email.value.trim();
      document.getElementById('forgotMsg').textContent = '';
      UI.openModal('forgotModal');
    });

    document.getElementById('forgotForm').addEventListener('submit', e => {
      e.preventDefault();
      const fe = document.getElementById('forgotEmail');
      const out = document.getElementById('forgotMsg');
      const msg = Auth.checkEmail(fe.value);
      if (msg) {
        out.className = 'msg';
        out.textContent = msg;
        return;
      }
      out.className = 'msg msg--ok';
      out.textContent = `If an account exists for ${fe.value.trim()}, a reset link is on its way.`;
    });

    document.getElementById('registerLink').addEventListener('click', e => {
      e.preventDefault();
      UI.openModal('registerModal');
    });

    UI.wireModals();
  }

  global.Store = Store;
  global.Util = Util;
  global.UI = UI;
  global.Auth = Auth;

  document.addEventListener('DOMContentLoaded', initLoginPage);
})(window);
