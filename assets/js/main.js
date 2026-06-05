(() => {
  'use strict';

  const root = document.documentElement;

  // --- Remember manual language choice so the auto-detect in <head> backs off ---
  document.querySelectorAll('.lang-link').forEach((a) => {
    a.addEventListener('click', () => {
      try { localStorage.setItem('lang', a.getAttribute('hreflang')); } catch (e) {}
    });
  });

  // --- Theme toggle ---
  const applyTheme = (theme) => {
    const dark = theme === 'dark' ||
      (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
  };

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', next); } catch (e) {}
      applyTheme(next);
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let stored = null;
    try { stored = localStorage.getItem('theme'); } catch (err) {}
    if (!stored) applyTheme(e.matches ? 'dark' : 'light');
  });

  // --- Header scroll state ---
  const header = document.querySelector('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Mobile nav ---
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Terminal (history): scroll-reveal + a genuinely interactive shell ---
  const terminal = document.querySelector('[data-terminal]');
  if (terminal) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // print the intro log in, line by line, when it scrolls into view
    if (!reduceMotion) {
      terminal.classList.add('is-anim');
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-on'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -15% 0px', threshold: 0.25 });
      io.observe(terminal);
    }

    const body   = terminal.querySelector('[data-term-body]');
    const output = terminal.querySelector('[data-term-output]');
    const form   = terminal.querySelector('[data-term-form]');
    const input  = terminal.querySelector('[data-term-input]');

    if (body && output && form && input) {
      const careerLog = output.querySelector('.t-log').cloneNode(true);
      const scrollDown = () => { body.scrollTop = body.scrollHeight; };
      const pick = (a) => a[Math.floor(Math.random() * a.length)];

      // Lock the terminal to exactly the height of the original content: the
      // intro is always fully visible, and anything you type beyond it scrolls
      // internally (instead of growing the box and pushing the prompt away).
      let pristine = true;
      let introHeight = body.scrollHeight;
      const applyCap = () => {
        if (pristine) introHeight = body.scrollHeight;   // track the intro until the first command
        body.style.maxHeight = introHeight + 'px';
      };
      applyCap();
      window.addEventListener('resize', applyCap, { passive: true });
      window.addEventListener('load', applyCap);          // re-measure once webfonts settle

      // echo the typed command back as a prompt line
      const echo = (text) => {
        const p = document.createElement('p');
        p.className = 't-cmd t-block';
        const a = document.createElement('span'); a.className = 't-path'; a.textContent = '~';
        const b = document.createElement('span'); b.className = 't-punc'; b.textContent = '$';
        const c = document.createElement('span'); c.className = 't-input'; c.textContent = text;
        p.append(a, b, c);
        output.appendChild(p);
      };
      // print a result block (textContent → safe from any injection)
      const out = (text) => {
        if (!text) return;
        const d = document.createElement('div');
        d.className = 't-out t-block';
        d.textContent = text;
        output.appendChild(d);
      };

      const FILES = 'career.log   elephants/   secrets.env   passwords.txt   todo.md   not_a_virus.exe   ascii_cat.png';
      const CAT = ' /\\_/\\\n( o.o )\n > ^ <\nmeow. (the only cat this terminal ships with)';
      const TRAIN = '      ====        ________\n  _D _|  |_______/        \\__\n   |(_)---  |   H\\________/ |\n   /     |  |   H  |  |     |\nchoo choo! 🚂  you typed `sl`. did you mean `ls`?';
      const HACK = 'H A C K   T H E   P L A N E T   🌍\n--------------------------------\nNot a slogan. The actual day job.\n→ hack-the-planet.io';
      const ELEPHANT = '    __     __\n   /  \\~~~/  \\\n  (  o     o  )\n   \\   \\_/   /\n    |__| |__|\n🐘 spotted, logged, left in peace. that is the whole point.';
      const CELINE = 'now playing: ♫ My Heart Will Go On ♫\n🐘 ...and the elephant calmly wandered off, away from the village.\n(yes — this genuinely happened in Gabon.)';

      const FORTUNES = [
        'A camera in the forest is worth a thousand patrols.',
        'You will exit Vim. Eventually.',
        'The best code protects something real.',
        'Tech for good does not have to be serious to work seriously.',
        'Somewhere an elephant is grateful and has no idea why.',
        "There is no cloud — just someone else's Raspberry Pi in a tree.",
      ];
      const NOTFOUND = [
        'zsh: command not found: %s  — did you mean `help`?',
        '`%s`? Bold. Sadly, not a thing here.',
        'Hmm, `%s` is not installed. But it sounds important.',
        '404: `%s` not found. Have you tried `help`?',
        'I asked an elephant about `%s`. It just shrugged. 🐘',
        '`%s`: permission denied by the laws of physics.',
      ];

      const cowsay = (t) => {
        t = (t || 'mooo').slice(0, 42);
        const bar = (ch) => ' ' + ch.repeat(t.length + 2);
        return bar('_') + '\n< ' + t + ' >\n' + bar('-') +
          '\n        \\   ^__^' +
          '\n         \\  (oo)\\_______' +
          '\n            (__)\\       )\\/\\' +
          '\n                ||----w |' +
          '\n                ||     ||';
      };

      const showHistory = (argStr) => {
        const name = (argStr.match(/["']([^"']*)["']/)?.[1] ?? argStr).trim();
        if (!name) { out('usage: ./show_history "<name>"\ntry:   ./show_history "Thijs Suijten"'); return; }
        if (name.toLowerCase().includes('thijs')) {
          out('Loading career.log for "' + name + '"...');
          const clone = careerLog.cloneNode(true);
          clone.classList.add('t-block');
          output.appendChild(clone);
          return;
        }
        out('No records found for "' + name + '".\nThis terminal knows exactly one legend: Thijs Suijten.\nTry: ./show_history "Thijs Suijten"');
      };

      const ls = (a) => /(^|\s)-\w*a/.test(a)
        ? FILES + '   .bashrc   .ssh/   .git/   .hopes_and_dreams   .secret_elephant_plans'
        : FILES;

      const C = {
        help: () =>
          'Commands worth trying (typos welcome):\n' +
          '  ls, dir           list your "files"\n' +
          '  cat <file>        print a file (may meow)\n' +
          '  show_history <n>  ./show_history "Thijs Suijten"\n' +
          '  whoami            resolve your identity crisis\n' +
          '  sudo <cmd>        ask the universe politely\n' +
          '  hack              hack the planet 🌍\n' +
          '  coffee            brew up ☕\n' +
          '  vim               enter the editor (exit not included)\n' +
          '  cowsay <text>     consult the cow\n' +
          '  fortune           wisdom of dubious origin\n' +
          '  echo date ping git npm ssh history weather top ...\n' +
          '  clear             wipe the screen\n' +
          '\nMore are hidden. Poke around — nothing here can actually break.',
        ls: ls,
        dir: ls,
        cat: (a) => {
          const f = a.replace(/^\.\//, '').trim().toLowerCase();
          const files = {
            'secrets.env': '# nice try 😏',
            'passwords.txt': 'hunter2\n(yes, everyone but you can read those asterisks)',
            'todo.md': '- [x] protect elephants\n- [x] keep kids safer online\n- [ ] finally exit vim',
            'career.log': 'Binary file. Run:  ./show_history "Thijs Suijten"',
            'ascii_cat.png': CAT,
            'not_a_virus.exe': 'Running... just kidding. (also: never run a file named this)',
          };
          if (!f) return 'usage: cat <file>   (no actual cats were harmed)';
          return files[f] || ('cat: ' + a + ': No such file — but it sounds important.');
        },
        whoami: () => pick([
          'An absolute legend. Also: a very welcome guest.',
          'root@curiosity — privileges: unlimited snooping.',
          'Someone with excellent taste in personal websites.',
        ]),
        pwd: () => '/home/you/probably/should/be/working',
        cd: () => 'There is no escape. You live in this terminal now.',
        mkdir: () => 'Directory created in your heart. ❤️  (not on disk)',
        touch: () => 'boop. 👆',
        date: () => new Date().toString() + '\n(time is a flat circle anyway)',
        uptime: () => 'up 4 elephants, 2 satellites — load average: chill, chill, chill',
        sudo: (a) => a
          ? 'We do not serve that level of confidence here. Permission denied.'
          : 'usage: sudo <thing you definitely should not run>',
        rm: (a) => /-rf|[\/*]/.test(a)
          ? 'Phew — I only PRETENDED to run that. Everything is fine. 🔥😅'
          : "rm: not authorized to delete Thijs's stuff. Nice try though.",
        vim: () => 'You are in Vim now. To exit: :q!  — or just close the tab, no judgement.',
        vi: () => C.vim(),
        nano: () => 'nano? in this economy? bold. respect.',
        emacs: () => 'emacs: a fine operating system — shame about the editor.',
        exit: () => 'You can check out any time you like, but you can never leave. 🎸',
        quit: () => C.exit(),
        logout: () => C.exit(),
        echo: (a) => a || '(echo... echo... echo...)',
        history: () => '  1  ./show_history "Thijs Suijten"\n  2  trying to look cool\n  3  sudo make me a sandwich\n  4  history',
        man: () => 'No manuals here, only vibes. Try:  help',
        ping: () => 'PING the-rainforest (10.0.0.1): reply via satellite, time=873ms\nslow, remote, but it works — that is the whole job.',
        ssh: () => 'ssh: connect to host gabon port 22: Operation timed out\n(there is genuinely no wifi in the forest)',
        git: (a) => /push/.test(a) ? 'Everything up-to-date. Unlike your npm dependencies.'
          : /commit/.test(a) ? '[main 0xC0FFEE] did a thing\n 1 file changed, 200 insertions(+), 0 deletions(-)'
          : /blame/.test(a) ? 'git blame: it was you. it was always you.'
          : 'usage: git <do-something-clever>',
        npm: (a) => /install|(^|\s)i(\s|$)/.test(a)
          ? 'Downloading the internet... [#######...] 70%\nadded 1,402 packages, 3 of which you will actually use.'
          : 'npm: try `npm install`, then go make a coffee.',
        node: () => 'Welcome to Node! ...exiting, because this is not a real REPL. A+ effort.',
        python: () => 'import antigravity ✈️  — but this is not a real REPL. Nice try!',
        coffee: () => "HTTP 418: I'm a teapot. ☕ Cannot brew coffee. Tea, perhaps?",
        brew: () => C.coffee(),
        fortune: () => pick(FORTUNES),
        cowsay: (a) => cowsay(a),
        sl: () => TRAIN,
        weather: () => 'Gabon: 31°C, humid, 100% chance of elephants. 🐘',
        passwd: () => 'New password rejected: must contain 1 elephant, 1 satellite and your last shred of hope.',
        password: () => C.passwd(),
        elephant: () => ELEPHANT,
        hack: () => HACK,
        hello: () => 'Well hello there 👋  Type `help` if you are lost.',
        hi: () => C.hello(),
        hey: () => C.hello(),
        thijs: () => 'Engineer. Nerd. Puts code to work protecting elephants and keeping kids safer online.\nRun:  ./show_history "Thijs Suijten"',
        top: () => 'PID  COMMAND        %CPU\n  1  elephant_ai    42.0\n  2  satellite_up   13.3\n  3  vibes          99.9',
        htop: () => C.top(),
      };

      const runLine = (raw) => {
        pristine = false;          // lock the height floor to the original content
        const line = raw.trim();
        echo(raw.replace(/\s+$/, ''));
        if (!line) { scrollDown(); return; }
        const first = line.split(/\s+/)[0];
        const cmd = first.replace(/^\.\//, '').toLowerCase();
        const argStr = line.slice(first.length).trim();
        const lower = line.toLowerCase().replace(/^\.\//, '');

        // built-ins & phrase easter eggs first
        if (cmd === 'clear' || cmd === 'cls') { output.innerHTML = ''; scrollDown(); return; }
        if (cmd === 'show_history') { showHistory(argStr); scrollDown(); return; }
        if (lower === 'hack the planet') { out(HACK); scrollDown(); return; }
        if (/\bceline\b|\bdion\b/.test(lower)) { out(CELINE); scrollDown(); return; }
        if (lower === 'sudo make me a sandwich') { out('Okay. 🥪'); scrollDown(); return; }
        if (lower === 'make me a sandwich') { out('What? Make it yourself.'); scrollDown(); return; }
        if (lower === 'meaning of life' || line === '42') { out('42. Obviously.'); scrollDown(); return; }

        const fn = C[cmd];
        out(fn ? fn(argStr, line) : pick(NOTFOUND).replace(/%s/g, first));
        scrollDown();
      };

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = input.value;
        input.value = '';
        runLine(v);
        input.focus();
      });
      // clicking anywhere in the terminal focuses the prompt (unless selecting text)
      body.addEventListener('click', () => {
        if (!String(window.getSelection())) input.focus();
      });
    }
  }
})();
