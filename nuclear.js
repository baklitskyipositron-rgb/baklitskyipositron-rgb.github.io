(() => {
  const menu = document.querySelector('.nuclear-nav');
  if (!menu) return;
  const reveal = (hash, scroll) => {
    if (!/^#nuclear-(world|ukraine|reactors|monitoring)$/.test(hash)) return;
    const target = document.querySelector(hash);
    if (!target) return;
    target.open = true;
    menu.open = false;
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  };
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => reveal(a.hash, false)));
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  window.addEventListener('hashchange', () => reveal(location.hash, true));
  reveal(location.hash, true);
})();
