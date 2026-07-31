/*! Not Slop v1.0.0. A human accountability badge with a dissent channel.
 *  https://soulcraftagency.com/notslop/
 *  MIT licensed. No cookies. No tracking. No network calls unless you configure one.
 *
 *  <script src="https://soulcraftagency.com/notslop/v1.js"
 *          data-notslop
 *          data-to="you@yoursite.com"></script>
 */
(function () {
  'use strict';

  if (window.NotSlop && window.NotSlop.__loaded) return;

  var VERSION = '1.0.0';
  var STORE_PREFIX = 'notslop:';
  var COOLDOWN_MS = 24 * 60 * 60 * 1000; // one report per page per day
  var MIN_FILL_MS = 1200;                // sub-1.2s submits are bots

  // ---------------------------------------------------------------- utilities

  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) for (var k in props) {
      if (k === 'class') n.className = props[k];
      else if (k === 'text') n.textContent = props[k];
      else if (k === 'html') n.innerHTML = props[k];
      else n.setAttribute(k, props[k]);
    }
    if (kids) kids.forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(STORE_PREFIX + key);
      window.localStorage.setItem(STORE_PREFIX + key, val);
    } catch (e) { /* private mode, quota, whatever. Fail open. */ }
    return null;
  }

  function pageKey() {
    return (location.host + location.pathname).slice(0, 180);
  }

  function alreadyReported() {
    var t = parseInt(store(pageKey()) || '0', 10);
    return t && (Date.now() - t) < COOLDOWN_MS;
  }

  function findScript() {
    if (document.currentScript) return document.currentScript;
    return document.querySelector('script[data-notslop]') ||
           document.querySelector('script[src*="notslop"]');
  }

  // ------------------------------------------------------------------ styles

  var CSS = [
    ':host{all:initial;display:inline-block}',
    /* Everything below re-declares rather than inherits: a host page running
       `* { font-family: X !important }` must not reach into this tree. */
    '*{box-sizing:border-box;margin:0;padding:0;',
      'font-family:var(--ns-font,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Inter,sans-serif)}',
    '.ns{',
      '--ink:#1a1614;--body:#57504a;--muted:#8a827b;--rule:#ddd6cd;',
      '--surface:#fffdfa;--paper:#f7f3ec;--accent:#9c4a24;--accent-deep:#7d3a1b;--on-accent:#fffdfa;',
      'font-family:var(--ns-font,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Inter,sans-serif);',
      'font-size:13px;line-height:1.5;color:var(--body);font-style:normal;font-weight:400;',
      'letter-spacing:normal;text-transform:none;text-align:left;}',
    '.ns[data-theme="dark"]{',
      '--ink:#f2ece4;--body:#b8b0a7;--muted:#8a827b;--rule:#39332e;',
      '--surface:#1c1917;--paper:#141210;--accent:#d99a6c;--accent-deep:#e8b087;--on-accent:#141210;}',

    /* badge */
    '.ns-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;',
      'border:1px solid var(--rule);border-radius:100px;background:var(--surface);',
      'white-space:nowrap;max-width:100%;}',
    '.ns-mark{width:14px;height:14px;flex:0 0 auto;color:var(--accent);display:block}',
    '.ns-claim{font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--ink)}',
    '.ns-sep{color:var(--rule);font-size:11px}',
    '.ns-trigger{font:inherit;font-size:11.5px;color:var(--muted);background:none;border:0;',
      'padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:2px;',
      'text-decoration-color:var(--rule);transition:color .18s,text-decoration-color .18s;}',
    '.ns-trigger:hover{color:var(--accent);text-decoration-color:var(--accent)}',
    '.ns-trigger:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:3px}',

    /* corner placement */
    '.ns[data-position="corner"]{position:fixed;z-index:2147483000;bottom:16px;right:16px}',
    '.ns[data-position="corner"] .ns-badge{box-shadow:0 4px 20px -8px rgba(0,0,0,.28)}',

    /* dialog */
    '.ns-scrim{position:fixed;inset:0;z-index:2147483001;background:rgba(20,16,14,.42);',
      'backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);',
      'display:flex;align-items:center;justify-content:center;padding:20px;',
      'animation:ns-fade .18s ease-out}',
    '@keyframes ns-fade{from{opacity:0}to{opacity:1}}',
    '@keyframes ns-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '.ns-panel{width:100%;max-width:400px;max-height:calc(100vh - 40px);overflow-y:auto;',
      'background:var(--surface);border:1px solid var(--rule);border-radius:10px;',
      'padding:22px;box-shadow:0 24px 60px -20px rgba(0,0,0,.4);',
      'animation:ns-rise .22s cubic-bezier(.22,1,.36,1)}',

    '.ns-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:4px}',
    '.ns-title{font-size:16px;font-weight:600;color:var(--ink);letter-spacing:-.01em}',
    '.ns-close{font:inherit;font-size:20px;line-height:1;color:var(--muted);background:none;',
      'border:0;cursor:pointer;padding:2px 6px;border-radius:4px;flex:0 0 auto}',
    '.ns-close:hover{color:var(--ink)}',
    '.ns-close:focus-visible{outline:2px solid var(--accent);outline-offset:2px}',
    '.ns-sub{font-size:12.5px;color:var(--muted);margin-bottom:16px;line-height:1.55}',

    '.ns-legend{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;',
      'color:var(--muted);margin-bottom:9px;display:block}',
    '.ns-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;border:0}',
    '.ns-chip{font:inherit;font-size:12px;color:var(--body);background:var(--paper);',
      'border:1px solid var(--rule);border-radius:100px;padding:6px 12px;cursor:pointer;',
      'transition:all .16s}',
    '.ns-chip:hover{border-color:var(--accent);color:var(--ink)}',
    '.ns-chip[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}',
    '.ns-chip:focus-visible{outline:2px solid var(--accent);outline-offset:2px}',

    '.ns-field{margin-bottom:12px}',
    '.ns-input,.ns-textarea{width:100%;font:inherit;font-size:13px;color:var(--ink);',
      'background:var(--paper);border:1px solid var(--rule);border-radius:6px;padding:9px 11px;',
      'resize:vertical;transition:border-color .16s}',
    '.ns-textarea{min-height:74px}',
    '.ns-input::placeholder,.ns-textarea::placeholder{color:var(--muted)}',
    '.ns-input:focus,.ns-textarea:focus{outline:0;border-color:var(--accent)}',

    '.ns-hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0!important}',

    '.ns-actions{display:flex;align-items:center;gap:10px;margin-top:16px}',
    '.ns-submit{font:inherit;font-size:13px;font-weight:600;color:var(--on-accent);',
      'background:var(--accent);border:0;border-radius:6px;padding:10px 18px;cursor:pointer;',
      'transition:background .16s}',
    '.ns-submit:hover{background:var(--accent-deep)}',
    '.ns-submit:disabled{opacity:.45;cursor:not-allowed}',
    '.ns-submit:focus-visible{outline:2px solid var(--accent);outline-offset:2px}',
    '.ns-note{font-size:11px;color:var(--muted);line-height:1.4}',

    '.ns-done{text-align:center;padding:14px 0 6px}',
    '.ns-done-mark{width:34px;height:34px;color:var(--accent);margin:0 auto 12px;display:block}',
    '.ns-done-title{font-size:16px;font-weight:600;color:var(--ink);margin-bottom:6px}',
    '.ns-done-sub{font-size:12.5px;color:var(--muted);line-height:1.55;max-width:270px;margin:0 auto}',

    '.ns-foot{margin-top:18px;padding-top:13px;border-top:1px solid var(--rule);',
      'font-size:10.5px;color:var(--muted);text-align:center;letter-spacing:.02em}',
    '.ns-foot a{color:var(--muted);text-decoration:underline;text-underline-offset:2px}',
    '.ns-foot a:hover{color:var(--accent)}',

    '@media (prefers-reduced-motion:reduce){.ns-scrim,.ns-panel{animation:none}*{transition:none!important}}',
    '@media (max-width:420px){.ns-panel{padding:18px}}'
  ].join('');

  var MARK = '<svg class="ns-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<rect x="2.6" y="2.6" width="18.8" height="18.8" rx="2" stroke="currentColor" stroke-width="1.7"/>' +
    '<path d="M7.2 12.4l3.3 3.3 6.3-7.1" stroke="currentColor" stroke-width="1.9" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var DONE_MARK = '<svg class="ns-done-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>' +
    '<path d="M7.6 12.3l3 3 5.8-6.4" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var REASONS = [
    'Reads like a template',
    'Facts seem wrong',
    'All padding, no substance',
    "Doesn't answer the question",
    'Something else'
  ];

  // Visible, honest attribution. Shown to a human who opened the dialog, in the
  // Shadow DOM, on click. It is not a hidden link and it is not injected into the
  // host page: nothing here is a ranking signal, and that is deliberate.
  // Stripping it is permitted by the MIT license. Leaving it is appreciated.
  function credit() {
    var f = el('div', { class: 'ns-foot' });
    f.innerHTML = 'Not Slop is a free tool from ' +
      '<a href="https://soulcraftagency.com/notslop/?utm_source=notslop-widget&utm_medium=referral" ' +
      'target="_blank" rel="noopener">Soulcraft</a>';
    return f;
  }

  // -------------------------------------------------------------------- mount

  function mount(opts) {
    opts = opts || {};

    var host = el('div', { 'data-notslop-widget': '' });
    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;

    var sheet = el('style', { text: CSS });
    root.appendChild(sheet);

    var theme = opts.theme || 'auto';
    if (theme === 'auto') {
      theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
    }

    var wrap = el('div', { class: 'ns', 'data-theme': theme, 'data-position': opts.position || 'inline' });
    if (opts.accent) wrap.style.setProperty('--accent', opts.accent);
    root.appendChild(wrap);

    var trigger = el('button', {
      class: 'ns-trigger',
      type: 'button',
      'aria-haspopup': 'dialog',
      text: opts.triggerLabel || 'Seems like slop?'
    });

    var badge = el('div', { class: 'ns-badge' });
    badge.innerHTML = MARK;
    badge.appendChild(el('span', { class: 'ns-claim', text: opts.label || 'Not Slop' }));
    badge.appendChild(el('span', { class: 'ns-sep', text: '·' }));
    badge.appendChild(trigger);
    wrap.appendChild(badge);

    // ---- dialog

    var scrim = null;
    var lastFocus = null;

    function close() {
      if (!scrim) return;
      scrim.remove();
      scrim = null;
      document.removeEventListener('keydown', onKey, true);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
    }

    function open() {
      if (scrim) return;
      lastFocus = trigger;
      var openedAt = Date.now();
      var chosen = null;

      scrim = el('div', { class: 'ns-scrim' });
      var panel = el('div', {
        class: 'ns-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Report this page as slop'
      });

      if (alreadyReported()) {
        panel.innerHTML =
          '<div class="ns-done">' + DONE_MARK +
          '<div class="ns-done-title">You already flagged this one.</div>' +
          '<div class="ns-done-sub">One report per page. We heard you the first time.</div></div>';
        var okBtn = el('div', { class: 'ns-actions' }, [
          el('button', { class: 'ns-submit', type: 'button', text: 'Close' })
        ]);
        okBtn.style.justifyContent = 'center';
        panel.appendChild(okBtn);
        panel.appendChild(credit());
        okBtn.querySelector('button').addEventListener('click', close);
      } else {
        var head = el('div', { class: 'ns-head' }, [
          el('div', { class: 'ns-title', text: 'Seems like slop?' }),
          el('button', { class: 'ns-close', type: 'button', 'aria-label': 'Close', text: '×' })
        ]);
        panel.appendChild(head);
        panel.appendChild(el('p', {
          class: 'ns-sub',
          text: 'Say what tipped you off. It goes to the person who published this page, not to a black box.'
        }));

        var group = el('div', { class: 'ns-chips', role: 'group', 'aria-label': 'What is wrong with it' });
        panel.appendChild(el('span', { class: 'ns-legend', text: "What's wrong with it" }));
        REASONS.forEach(function (r) {
          var chip = el('button', { class: 'ns-chip', type: 'button', 'aria-pressed': 'false', text: r });
          chip.addEventListener('click', function () {
            group.querySelectorAll('.ns-chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
            if (chosen === r) { chosen = null; return; }
            chosen = r;
            chip.setAttribute('aria-pressed', 'true');
          });
          group.appendChild(chip);
        });
        panel.appendChild(group);

        var comment = el('textarea', { class: 'ns-textarea', placeholder: 'Anything else? (optional)', 'aria-label': 'Comment' });
        panel.appendChild(el('div', { class: 'ns-field' }, [comment]));

        var email = el('input', {
          class: 'ns-input', type: 'email', placeholder: 'Your email, if you want a reply (optional)', 'aria-label': 'Your email'
        });
        panel.appendChild(el('div', { class: 'ns-field' }, [email]));

        // honeypot
        var hp = el('input', { class: 'ns-hp', type: 'text', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
        panel.appendChild(hp);

        var submit = el('button', { class: 'ns-submit', type: 'button', text: 'Send it' });
        panel.appendChild(el('div', { class: 'ns-actions' }, [
          submit,
          el('span', { class: 'ns-note', text: 'No account. No tracking.' })
        ]));
        panel.appendChild(credit());

        submit.addEventListener('click', function () {
          if (hp.value) { close(); return; }                       // bot
          if (Date.now() - openedAt < MIN_FILL_MS) { close(); return; } // bot
          submit.disabled = true;

          var payload = {
            url: location.href,
            title: document.title,
            reason: chosen || 'Unspecified',
            comment: comment.value.slice(0, 2000),
            email: email.value.slice(0, 200),
            ts: new Date().toISOString(),
            v: VERSION
          };

          store(pageKey(), String(Date.now()));
          var mode = send(payload, opts);

          // Only claim it arrived when it actually did. On the mailto path the
          // reader still has to press send, so saying "got it" would be a lie
          // on a page about not publishing things nobody checked.
          var title, sub;
          if (mode === 'mailto') {
            title = 'One more step.';
            sub = 'Your mail app is opening with the report filled in. Press send and it reaches a person.';
          } else if (mode === 'local') {
            title = 'Noted, locally.';
            sub = 'This page has no report address configured, so nothing left your browser.';
          } else {
            title = 'Got it. Thank you.';
            sub = 'A person reads these. If it holds up, this page gets fixed.';
          }
          panel.innerHTML = '<div class="ns-done">' + DONE_MARK +
            '<div class="ns-done-title"></div><div class="ns-done-sub"></div></div>';
          panel.querySelector('.ns-done-title').textContent = title;
          panel.querySelector('.ns-done-sub').textContent = sub;
          panel.appendChild(credit());
          setTimeout(close, mode === 'mailto' ? 5000 : 3200);
        });

        head.querySelector('.ns-close').addEventListener('click', close);
      }

      scrim.appendChild(panel);
      scrim.addEventListener('mousedown', function (e) { if (e.target === scrim) close(); });
      // Must live inside .ns: the palette custom properties are scoped there,
      // and a scrim parented to the shadow root would resolve them to nothing.
      wrap.appendChild(scrim);
      document.addEventListener('keydown', onKey, true);

      var first = panel.querySelector('.ns-chip, .ns-submit');
      if (first) first.focus();
    }

    trigger.addEventListener('click', open);

    return { host: host, open: open, close: close };
  }

  // --------------------------------------------------------------- transport

  function send(payload, opts) {
    if (opts.endpoint) {
      var body = JSON.stringify(payload);
      var ok = false;
      try {
        if (navigator.sendBeacon) {
          ok = navigator.sendBeacon(opts.endpoint, new Blob([body], { type: 'application/json' }));
        }
      } catch (e) { ok = false; }
      if (!ok) {
        try {
          fetch(opts.endpoint, {
            method: 'POST', mode: 'cors', keepalive: true,
            headers: { 'Content-Type': 'application/json' }, body: body
          }).catch(function () {});
        } catch (e) { /* give up quietly */ }
      }
      return 'endpoint';
    }

    if (opts.to) {
      var subject = 'Slop report: ' + (payload.title || payload.url).slice(0, 90);
      var lines = [
        'Page: ' + payload.url,
        'Reason: ' + payload.reason,
        '',
        payload.comment || '(no comment)',
        '',
        payload.email ? 'Reply to: ' + payload.email : '',
        '',
        'Sent via Not Slop (soulcraftagency.com/notslop)'
      ].join('\n');
      var href = 'mailto:' + opts.to + '?subject=' + encodeURIComponent(subject) +
                 '&body=' + encodeURIComponent(lines);
      var a = document.createElement('a');
      a.href = href; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      return 'mailto';
    }

    // Demo mode: nothing configured. Keep it local so the widget still demonstrates.
    try {
      var log = JSON.parse(store('log') || '[]');
      log.push(payload);
      store('log', JSON.stringify(log.slice(-50)));
    } catch (e) { /* ignore */ }
    return 'local';
  }

  // ------------------------------------------------------------------- boot

  function readConfig(s) {
    if (!s) return {};
    return {
      to: s.getAttribute('data-to') || '',
      endpoint: s.getAttribute('data-endpoint') || '',
      label: s.getAttribute('data-label') || '',
      triggerLabel: s.getAttribute('data-trigger-label') || '',
      theme: s.getAttribute('data-theme') || 'auto',
      position: s.getAttribute('data-position') || 'inline',
      accent: s.getAttribute('data-accent') || ''
    };
  }

  var script = findScript();
  var config = readConfig(script);

  function boot() {
    if (document.querySelector('[data-notslop-widget]')) return;
    var w = mount(config);
    var target = document.querySelector('[data-notslop-mount]');
    if (config.position === 'corner') {
      document.body.appendChild(w.host);
    } else if (target) {
      target.appendChild(w.host);
    } else if (script && script.parentNode) {
      script.parentNode.insertBefore(w.host, script.nextSibling);
    } else {
      document.body.appendChild(w.host);
    }
    window.NotSlop.instance = w;
  }

  window.NotSlop = {
    __loaded: true,
    version: VERSION,
    mount: mount,
    config: config,
    instance: null
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
