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
})();
