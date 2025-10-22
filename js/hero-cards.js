// js/hero-cards.js
// Popola #hero-panels con card lette da data/hero-cards.json

(function () {
  async function loadHeroCards() {
    const container = document.getElementById('hero-panels');
    if (!container) return;

    try {
      const resp = await fetch('data/hero-cards.json', { cache: 'no-cache' });
      if (!resp.ok) throw new Error('Network response was not ok');
      const items = await resp.json();

      const frag = document.createDocumentFragment();

      for (const item of items) {
        if (item.type === 'card') {
          const section = document.createElement('section');
          section.className = 'panel';

          const h2 = document.createElement('h2');
          h2.textContent = item.title || '';
          section.appendChild(h2);

          const p = document.createElement('p');
          p.textContent = item.body || '';
          section.appendChild(p);

          if (item.cta) {
            const a = document.createElement('a');
            a.className = 'cta';
            a.href = item.cta.href || '#';
            a.textContent = item.cta.label || 'Apri';
            section.appendChild(a);
          }

          frag.appendChild(section);
        } else if (item.type === 'newsletter') {
          const section = document.createElement('section');
          section.className = 'panel';

          const h2 = document.createElement('h2');
          h2.textContent = item.title || 'Newsletter';
          section.appendChild(h2);

          const p = document.createElement('p');
          p.textContent = item.body || '';
          section.appendChild(p);

          const form = document.createElement('form');
          form.addEventListener('submit', function (e) {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            const email = input && input.value;
            // qui si potrebbe chiamare un endpoint serverless per registrare l'email
            alert(email ? 'Grazie, registrato: ' + email : 'Inserisci un indirizzo email');
            form.reset();
          });

          const label = document.createElement('label');
          label.className = 'sr-only';
          label.htmlFor = 'hero-newsletter-email';
          label.textContent = 'Email';
          form.appendChild(label);

          const input = document.createElement('input');
          input.type = 'email';
          input.id = 'hero-newsletter-email';
          input.name = 'email';
          input.required = true;
          input.placeholder = (item.form && item.form.placeholder) || 'tua@email.it';
          form.appendChild(input);

          const btn = document.createElement('button');
          btn.type = 'submit';
          btn.className = 'cta';
          btn.textContent = (item.form && item.form.submitLabel) || 'Iscriviti';
          form.appendChild(btn);

          section.appendChild(form);
          frag.appendChild(section);
        }
      }

      container.innerHTML = '';
      container.appendChild(frag);
    } catch (err) {
      console.warn('Unable to load hero cards', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeroCards);
  } else {
    loadHeroCards();
  }
})();
