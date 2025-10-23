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
        const type = (item.type || 'card').toLowerCase();
        const section = document.createElement('section');
        section.className = 'panel panel--' + type + (item.classes ? ' ' + item.classes : '');

        // image (merch/media)
        if (item.image) {
          const img = document.createElement('img');
          img.className = 'panel__thumb';
          img.src = item.image.src || '';
          img.alt = item.image.alt || '';
          img.loading = 'lazy';
          if ((item.image.position || '').toLowerCase() === 'left') {
            section.classList.add('panel--media-left');
            section.appendChild(img); // thumb before content
          } else {
            section.appendChild(img);
          }
        }

        // title + body
        const h2 = document.createElement('h2');
        h2.textContent = item.title || '';
        section.appendChild(h2);

        if (item.body) {
          const p = document.createElement('p');
          p.textContent = item.body;
          section.appendChild(p);
        }

        // event meta (dl)
        if (type === 'event' && item.meta) {
          const dl = document.createElement('dl');
          dl.className = 'panel__meta';
          const pushMeta = (labelText, value) => {
            if (!value) return;
            const dt = document.createElement('dt'); dt.textContent = labelText; dl.appendChild(dt);
            const dd = document.createElement('dd'); dd.textContent = value; dl.appendChild(dd);
          };
          pushMeta('Data', item.meta.date);
          pushMeta('Ora', item.meta.time);
          pushMeta('Luogo', item.meta.venue);
          pushMeta('Prezzo', item.meta.price);
          section.appendChild(dl);
        }

        // CTA
        if (item.cta) {
          const a = document.createElement('a');
          a.className = 'cta';
          a.href = item.cta.href || '#';
          a.textContent = item.cta.label || 'Apri';
          if (item.cta.target) a.target = item.cta.target;
          if (item.cta.rel) a.rel = item.cta.rel;
          section.appendChild(a);
        }

        // newsletter handling
        if (type === 'newsletter') {
          // replace CTA with form if form provided
          const form = document.createElement('form');
          form.className = 'panel__newsletter';
          form.addEventListener('submit', function (e) {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            const email = input && input.value;
            const status = form.querySelector('.panel__status');
            if (!email) {
              if (status) status.textContent = 'Inserisci un indirizzo valido';
              return;
            }
            // placeholder: qui chiameresti un endpoint reale
            if (status) status.textContent = 'Grazie! Controlla la tua email.';
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

          const status = document.createElement('div');
          status.className = 'panel__status';
          status.setAttribute('role', 'status');
          form.appendChild(status);

          section.appendChild(form);
        }

        frag.appendChild(section);
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
