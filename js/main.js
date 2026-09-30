(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------

  // Point this at a form backend (Formspree, Getform, Basin, your own API, …) to
  // collect sign-ups. It receives a POST with `email` and `interest` fields.
  // Leave empty to fall back to opening the visitor's email app.
  var WAITLIST_ENDPOINT = '';
  var CONTACT_EMAIL = 'hello@pronto.app';

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
  // Hero demo
  // ---------------------------------------------------------------------------

  var EXAMPLES = [
    {
      mode: 'type',
      text: 'Lunch with Kofi tomorrow at 1pm at Buka',
      title: 'Lunch with Kofi',
      cal: 'google',
      calLabel: 'Personal · Google',
      when: 'Tomorrow · 1:00 – 2:00 PM',
      where: 'Buka Restaurant',
      who: 'Kofi Mensah',
      conf: 96,
      toast: 'Added to Google Calendar · No conflicts'
    },
    {
      mode: 'voice',
      text: 'Move my 3pm call with Ama to Friday',
      title: 'Call with Ama',
      cal: 'microsoft',
      calLabel: 'Work · Outlook',
      when: 'Friday · 3:00 – 3:30 PM',
      where: 'Microsoft Teams',
      who: 'Ama Boateng',
      conf: 92,
      toast: 'Moved in Outlook · Ama notified'
    },
    {
      mode: 'type',
      text: 'Gym every Monday and Wednesday at 7am',
      title: 'Gym',
      cal: 'google',
      calLabel: 'Personal · Google',
      when: 'Mon & Wed · 7:00 – 8:00 AM',
      repeat: 'Repeats weekly',
      conf: 89,
      toast: 'Added to Google Calendar · Repeats weekly'
    }
  ];

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
    var row = function (name) {
      return demo.querySelector('[data-row="' + name + '"]');
    };

    var fill = function (ex) {
      field('title').textContent = ex.title;
      var pill = field('cal');
      pill.textContent = ex.calLabel;
      pill.setAttribute('data-cal', ex.cal);
      field('when').textContent = ex.when;
      ['where', 'who', 'repeat'].forEach(function (k) {
        row(k).hidden = !ex[k];
        field(k).textContent = ex[k] || '';
      });
      field('conf').textContent = ex.conf + '%';
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
            await sleep(34 + Math.random() * 46);
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
        await sleep(1900);

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

  function selectInterest(value) {
    if (!form) return;
    var radio = form.querySelector('input[name="interest"][value="' + value + '"]');
    if (radio) radio.checked = true;
  }

  document.querySelectorAll('[data-interest]').forEach(function (link) {
    link.addEventListener('click', function () {
      selectInterest(link.getAttribute('data-interest'));
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

      var interest = (form.querySelector('input[name="interest"]:checked') || {}).value || 'personal';

      if (!WAITLIST_ENDPOINT) {
        var subject = 'Pronto early access' + (interest === 'business' ? ' — Business' : '');
        var body = 'Please add me to the Pronto early access list.\n\nEmail: ' + email + '\nInterested in: ' + interest;
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
        data.append('interest', interest);
        var res = await fetch(WAITLIST_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('Request failed: ' + res.status);
        form.reset();
        selectInterest(interest);
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
