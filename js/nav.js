(function () {
  // helpers for focus management
  function getFocusable(container) {
    if (!container) return [];
    const nodes = Array.from(container.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'));
    return nodes.filter(n => !n.hasAttribute('disabled') && n.offsetParent !== null);
  }

  async function populateNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const toggle = document.getElementById('nav-toggle');
    const hamburger = document.querySelector('.hamburger');
    const sideDrawer = document.querySelector('.side-drawer');
    let previousActive = null;

    // wire aria attributes for the hamburger
    if (hamburger) {
      hamburger.setAttribute('aria-controls', nav ? nav.id || 'main-nav' : 'main-nav');
      hamburger.setAttribute('aria-expanded', toggle && toggle.checked ? 'true' : 'false');
    }

    function closeDrawer() {
      if (toggle) {
        toggle.checked = false;
        toggle.dispatchEvent(new Event('change'));
      }
    }

    function handleKeydown(e) {
      if (!sideDrawer) return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeDrawer();
        e.preventDefault();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusable(sideDrawer);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }

    if (toggle) {
      toggle.addEventListener('change', function () {
        const open = !!toggle.checked;
        if (hamburger) hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          previousActive = document.activeElement;
          // trap focus into drawer
          setTimeout(() => {
            const focusable = getFocusable(sideDrawer);
            if (focusable.length) focusable[0].focus();
          }, 50);
          document.addEventListener('keydown', handleKeydown);
        } else {
          document.removeEventListener('keydown', handleKeydown);
          if (previousActive && typeof previousActive.focus === 'function') previousActive.focus();
        }
      });
    }

    try {
      const resp = await fetch('data/navbar.json', { cache: 'no-cache' });
      if (!resp.ok) throw new Error('Network response was not ok');
      const data = await resp.json();

      const fragment = document.createDocumentFragment();
      const currentFile = (location.pathname.split('/').pop() || '').toLowerCase();

      // data is expected to be an object whose values have { label, link }
      for (const key of Object.keys(data)) {
        const item = data[key] || {};
        const a = document.createElement('a');
        a.textContent = item.label || '';
        a.href = item.link || '#';
        if (item.target) a.target = item.target;
        if (item.rel) a.rel = item.rel;
        if (item.classes) a.className = String(item.classes);

        // Determine if this link matches the current page and mark it
        const hrefFile = (a.getAttribute('href').split('/').pop() || '').toLowerCase();
        if (hrefFile && hrefFile === currentFile) {
          a.setAttribute('aria-current', 'page');
          a.classList.add('active');
        }

        // close drawer when link clicked (for CSS-only toggle pattern)
        a.addEventListener('click', function (ev) {
          // if the link opens a new tab we still close the drawer
          closeDrawer();
        });

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
