(function () {
  async function populateNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    try {
      const resp = await fetch('data/navbar.json', { cache: 'no-cache' });
      if (!resp.ok) throw new Error('Network response was not ok');
      const data = await resp.json();

      const fragment = document.createDocumentFragment();
      const currentFile = (location.pathname.split('/').pop() || '').toLowerCase();

      // data is expected to be an object whose values have { label, link }
      for (const key of Object.keys(data)) {
        const item = data[key];
        const a = document.createElement('a');
        a.textContent = item.label || '';
        a.href = item.link || '#';

        // Determine if this link matches the current page and mark it
        const hrefFile = (a.getAttribute('href').split('/').pop() || '').toLowerCase();
        if (hrefFile && hrefFile === currentFile) {
          a.setAttribute('aria-current', 'page');
          a.classList.add('active');
        }

        fragment.appendChild(a);
      }

      // Replace existing links only if we actually built any
      if (fragment.childNodes.length) {
        nav.innerHTML = '';
        nav.appendChild(fragment);
      }
    } catch (err) {
      // Leave the static fallback links in place; log the error for debugging
      console.warn('Impossibile caricare data/navbar.json, uso il menu statico di fallback.', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateNav);
  } else {
    populateNav();
  }
})();
