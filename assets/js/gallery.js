'use strict';
(() => {
  const photos = [
    { file: 'f1.png', title: 'Nature’s great masterpiece', category: 'Nature' },
    { file: 'fp2.png', title: 'Together by the ocean', category: 'Coast' },
    { file: 'f3.png', title: 'Drawn to the sea', category: 'Coast' },
    { file: 'f4.png', title: 'A world of green', category: 'Nature' },
    { file: 'f5.png', title: 'After the light fades', category: 'Travel' },
    { file: 'rp1.png', title: 'The journey begins', category: 'Travel' }
  ];
  const grid = document.querySelector('#photo-grid');
  const search = document.querySelector('#photo-search');
  const savedButton = document.querySelector('#saved-filter');
  const dialog = document.querySelector('#photo-dialog');
  let saved = new Set();
  try { const value = JSON.parse(localStorage.getItem('nydh-saved') || '[]'); if (Array.isArray(value)) saved = new Set(value.filter(file => photos.some(p => p.file === file))); } catch {}
  let category = 'All', savedOnly = false, active = 0, collection = photos, opener;
  function showPhoto(items, index, source) {
    collection = items; active = (index + items.length) % items.length;
    const photo = items[active];
    document.querySelector('#dialog-image').src = photo.src || `./assets/images/${photo.file}`;
    document.querySelector('#dialog-image').alt = photo.title;
    document.querySelector('#photo-caption').textContent = photo.title;
    document.querySelector('.dialog-controls').hidden = items.length < 2;
    if (!dialog.open) { opener = source; dialog.showModal(); document.body.classList.add('photo-open'); }
  }
  function render() {
    const query = search.value.trim().toLowerCase();
    const visible = photos.filter(p => (category === 'All' || p.category === category) && (!savedOnly || saved.has(p.file)) && `${p.title} ${p.category} ${p.category === 'Coast' ? 'beach ocean' : ''}`.toLowerCase().includes(query));
    grid.replaceChildren();
    visible.forEach((p, index) => {
      const card = document.createElement('article'); card.className = 'photo-card';
      const view = document.createElement('button'); view.className = 'photo-view'; view.setAttribute('aria-label', `View ${p.title}`);
      const img = document.createElement('img'); img.src = `./assets/images/${p.file}`; img.alt = p.title; img.loading = 'lazy'; img.width = 640; img.height = 480; view.append(img);
      view.addEventListener('click', () => showPhoto(visible, index, view));
      const info = document.createElement('div'); info.className = 'photo-info';
      const title = document.createElement('h3'); title.textContent = p.title;
      const tag = document.createElement('p'); tag.textContent = p.category;
      const save = document.createElement('button'); save.className = 'save-photo'; save.textContent = saved.has(p.file) ? '♥ Saved' : '♡ Save'; save.setAttribute('aria-pressed', String(saved.has(p.file))); save.setAttribute('aria-label', `Save ${p.title}`);
      save.addEventListener('click', () => {
        saved.has(p.file) ? saved.delete(p.file) : saved.add(p.file);
        let stored = true; try { localStorage.setItem('nydh-saved', JSON.stringify([...saved])); } catch { stored = false; }
        render();
        const replacement = [...grid.querySelectorAll('.save-photo')].find(b => b.getAttribute('aria-label') === `Save ${p.title}`);
        (replacement || savedButton).focus();
        if (!stored) document.querySelector('#gallery-status').textContent += ' Browser storage is unavailable; favorites are saved for this visit only.';
      });
      info.append(tag, title, save); card.append(view, info); grid.append(card);
    });
    document.querySelector('#saved-count').textContent = saved.size;
    document.querySelector('#gallery-status').textContent = visible.length ? `${visible.length} photographs to explore` : 'No photographs match. Try another search or turn off a filter.';
  }
  let lastDiscovery = -1;
  document.querySelector('#surprise-photo').addEventListener('click', event => {
    // Draw without immediately repeating the previous discovery.
    const candidates = photos.map((_, index) => index).filter(index => index !== lastDiscovery);
    lastDiscovery = candidates[Math.floor(Math.random() * candidates.length)];
    showPhoto(photos, lastDiscovery, event.currentTarget);
  });
  search.addEventListener('input', render);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); render();
  }));
  savedButton.addEventListener('click', () => { savedOnly = !savedOnly; savedButton.setAttribute('aria-pressed', String(savedOnly)); render(); });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('photo-open'); opener?.focus(); });
  document.querySelector('#photo-prev').addEventListener('click', () => showPhoto(collection, active - 1));
  document.querySelector('#photo-next').addEventListener('click', () => showPhoto(collection, active + 1));
  dialog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); showPhoto(collection, active + (e.key === 'ArrowLeft' ? -1 : 1)); } });
  document.querySelectorAll('.feature-card, .recent-post-card, .popular-card').forEach(card => {
    const image = card.querySelector('img'); const title = card.querySelector('h3, h4')?.textContent.trim();
    if (!image || !title) return;
    image.alt = title;
    card.querySelectorAll('h3 a, h4 a, .card-btn').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showPhoto([{src: image.src, title}], 0, link); }));
  });
  document.querySelectorAll('.insta-post').forEach(link => { link.href = 'https://www.instagram.com/eyesofnydh/'; });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  render();
})();
