(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------

  // Point this at a form backend (Formspree, Getform, Basin, your own API, …) to
  // collect sign-ups. It receives a POST with `email` and `team` fields.
  // Leave empty to fall back to opening the visitor's email app.
  var WAITLIST_ENDPOINT = '';
  var CONTACT_EMAIL = 'hello@pronto.app';

  var TEAM_LABELS = { solo: 'Just me', team: '2–10 staff', large: '10+ staff' };

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  // ---------------------------------------------------------------------------
  // Theme toggle
  // ---------------------------------------------------------------------------

  var themeBtn = document.querySelector('[data-theme-toggle]');

  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return darkQuery.matches ? 'dark' : 'light';
  }

  function syncThemeLabel() {
    if (!themeBtn) return;
    themeBtn.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('pronto-theme', next);
      } catch (e) {}
      syncThemeLabel();
    });
    syncThemeLabel();
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', syncThemeLabel);
  }

  // ---------------------------------------------------------------------------
  // Header: scrolled state + mobile menu
  // ---------------------------------------------------------------------------

  var header = document.querySelector('[data-header]');
  var menuBtn = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav]');

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  // ---------------------------------------------------------------------------
  // Reveal on scroll
  // ---------------------------------------------------------------------------

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  // Stagger siblings that reveal together.
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains('reveal');
    });
    var i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );
    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ---------------------------------------------------------------------------
  // Hero demo — the assistant books, invoices and reschedules
  // ---------------------------------------------------------------------------

  var EXAMPLES = [
    {
      mode: 'type',
      text: 'Book Akua for a silk press Tuesday at 1:30 with Adwoa',
      kind: 'New booking',
      title: 'Silk press · Akua Owusu',
      pill: 'with Adwoa',
      tone: 'violet',
      rows: [
        { icon: 'clock', text: 'Tue · 1:30 – 3:00 PM' },
        { icon: 'tag', text: 'Silk press · 90 min', amount: '$85.00' },
        { icon: 'user', text: 'Akua Owusu · returning customer' }
      ],
      conf: 95,
      action: 'Confirm booking',
      toast: 'Booked · Confirmation sent to Akua'
    },
    {
      mode: 'type',
      text: 'Invoice Akua for her silk press and a trim',
      kind: 'Invoice #1042 · Draft',
      title: 'Akua Owusu',
      pill: 'Due on receipt',
      tone: 'amber',
      rows: [
        { icon: 'receipt', text: 'Silk press · 90 min', amount: '$85.00' },
        { icon: 'receipt', text: 'Trim · add-on', amount: '$20.00' },
        { cls: 'total', text: 'Total', amount: '$105.00' }
      ],
      conf: 97,
      action: 'Send invoice',
      toast: 'Invoice sent by SMS · Pay link included'
    },
    {
      mode: 'voice',
      text: 'Move Kofi’s 4pm haircut to Thursday',
      kind: 'Reschedule',
      title: 'Haircut · Kofi Mensah',
      pill: 'with Kwame',
      tone: 'blue',
      rows: [
        { icon: 'clock', text: 'Thu · 4:00 – 4:45 PM' },
        { icon: 'swap', text: 'Moved from Wed · 4:00 PM' },
        { icon: 'shield', text: 'Kwame is free — no clashes' }
      ],
      conf: 93,
      action: 'Reschedule',
      toast: 'Moved · Kofi notified by SMS'
    }
  ];

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function iconEl(name) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'i');
    var use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#i-' + name);
    svg.appendChild(use);
    return svg;
  }

  function rowEl(row) {
    var li = document.createElement('li');
    if (row.cls) li.className = row.cls;
    if (row.icon) li.appendChild(iconEl(row.icon));
    var text = document.createElement('span');
    text.textContent = row.text;
    li.appendChild(text);
    if (row.amount) {
      var amount = document.createElement('b');
      amount.textContent = row.amount;
      li.appendChild(amount);
    }
    return li;
  }

  var demo = document.querySelector('[data-demo]');

  if (demo) {
    var input = demo.querySelector('[data-demo-input]');
    var typed = demo.querySelector('[data-demo-typed]');
    var parsing = demo.querySelector('[data-demo-parsing]');
    var card = demo.querySelector('[data-demo-card]');
    var confirmBtn = demo.querySelector('[data-demo-confirm]');
    var toast = demo.querySelector('[data-demo-toast]');

    var field = function (name) {
      return demo.querySelector('[data-f="' + name + '"]');
    };

    var fill = function (ex) {
      field('kind').textContent = ex.kind;
      field('title').textContent = ex.title;
      var pill = field('pill');
      pill.textContent = ex.pill;
      pill.setAttribute('data-tone', ex.tone);
      var rows = field('rows');
      rows.textContent = '';
      ex.rows.forEach(function (r) {
        rows.appendChild(rowEl(r));
      });
      field('conf').textContent = ex.conf + '%';
      field('action').textContent = ex.action;
      field('toast').textContent = ex.toast;
    };

    if (reduceMotion) {
      // Static, fully-rendered first example.
      var first = EXAMPLES[0];
      fill(first);
      typed.textContent = first.text;
      input.classList.add('has-text');
      field('bar').style.width = first.conf + '%';
      card.classList.add('is-on');
      toast.classList.add('is-on');
    } else {
      var paused = false;
      var waiters = [];

      var gate = function () {
        if (!paused) return Promise.resolve();
        return new Promise(function (resolve) {
          waiters.push(resolve);
        });
      };

      var setPaused = function (p) {
        paused = p;
        if (!p) {
          var w = waiters;
          waiters = [];
          w.forEach(function (fn) {
            fn();
          });
        }
      };

      var sleep = function (ms) {
        return new Promise(function (resolve) {
          setTimeout(resolve, ms);
        }).then(gate);
      };

      if ('IntersectionObserver' in window) {
        var inView = true;
        new IntersectionObserver(function (entries) {
          inView = entries[0].isIntersecting;
          setPaused(!inView || document.hidden);
        }).observe(demo);
        document.addEventListener('visibilitychange', function () {
          setPaused(!inView || document.hidden);
        });
      }

      var play = async function (ex) {
        // Reset
        card.classList.remove('is-on');
        toast.classList.remove('is-on');
        typed.textContent = '';
        input.classList.remove('has-text', 'is-active', 'is-listening');
        await sleep(700);

        // Input
        input.classList.add('is-active');
        if (ex.mode === 'voice') {
          input.classList.add('is-listening');
          await sleep(1900);
          input.classList.remove('is-listening');
          input.classList.add('has-text');
          typed.textContent = ex.text;
          await sleep(500);
        } else {
          input.classList.add('has-text');
          for (var i = 1; i <= ex.text.length; i++) {
            typed.textContent = ex.text.slice(0, i);
            await sleep(30 + Math.random() * 40);
          }
          await sleep(450);
        }

        // Parse
        input.classList.remove('is-active');
        parsing.classList.add('is-on');
        await sleep(950);
        parsing.classList.remove('is-on');

        // Preview card
        fill(ex);
        field('bar').style.width = '0%';
        card.classList.add('is-on');
        await sleep(120);
        field('bar').style.width = ex.conf + '%';
        await sleep(2100);

        // Confirm
        confirmBtn.classList.add('is-pressed');
        await sleep(260);
        confirmBtn.classList.remove('is-pressed');
        toast.classList.add('is-on');
        await sleep(2600);
      };

      (async function loop() {
        var n = 0;
        for (;;) {
          await play(EXAMPLES[n % EXAMPLES.length]);
          n++;
        }
      })();
    }
  }

  // ---------------------------------------------------------------------------
  // Waitlist
  // ---------------------------------------------------------------------------

  var form = document.querySelector('[data-waitlist]');

  function selectTeam(value) {
    if (!form) return;
    var radio = form.querySelector('input[name="team"][value="' + value + '"]');
    if (radio) radio.checked = true;
  }

  document.querySelectorAll('[data-team]').forEach(function (link) {
    link.addEventListener('click', function () {
      selectTeam(link.getAttribute('data-team'));
    });
  });

  if (form) {
    var emailInput = form.querySelector('input[type="email"]');
    var msg = form.querySelector('[data-waitlist-msg]');
    var submitBtn = form.querySelector('button[type="submit"]');

    var say = function (text, kind) {
      msg.textContent = text;
      msg.classList.toggle('is-ok', kind === 'ok');
      msg.classList.toggle('is-err', kind === 'err');
    };

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var email = emailInput.value.trim();
      if (!email || !emailInput.checkValidity()) {
        say('Please enter a valid email address.', 'err');
        emailInput.focus();
        return;
      }

      var team = (form.querySelector('input[name="team"]:checked') || {}).value || 'solo';

      if (!WAITLIST_ENDPOINT) {
        var subject = 'Pronto early access';
        var body =
          'Please add my business to the Pronto early access list.\n\nEmail: ' + email + '\nTeam size: ' + TEAM_LABELS[team];
        window.location.href =
          'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        say('Opening your email app to finish signing up…');
        return;
      }

      submitBtn.disabled = true;
      say('Adding you to the list…');
      try {
        var data = new FormData();
        data.append('email', email);
        data.append('team', team);
        var res = await fetch(WAITLIST_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('Request failed: ' + res.status);
        form.reset();
        selectTeam(team);
        say('You’re on the list! We’ll be in touch soon.', 'ok');
      } catch (err) {
        say('Something went wrong. Please try again, or email ' + CONTACT_EMAIL + '.', 'err');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Footer year
  // ---------------------------------------------------------------------------

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
