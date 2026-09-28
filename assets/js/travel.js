'use strict';
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.journey-motion');
  let paused = false;
  try { paused = localStorage.getItem('nydh-motion-paused') === 'true'; } catch {}
  const motionAllowed = () => !paused && !preference.matches;
  function syncMotion() {
    document.body.classList.toggle('motion-paused', paused || preference.matches);
    toggle.textContent = preference.matches ? 'Reduced motion' : paused ? 'Enable motion' : 'Pause motion';
    toggle.disabled = preference.matches;
    toggle.setAttribute('aria-pressed', String(paused || preference.matches));
    if (!motionAllowed()) document.getAnimations().forEach(animation => animation.cancel());
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('nydh-motion-paused', String(paused)); } catch {}
    syncMotion();
  });
  preference.addEventListener('change', syncMotion);
  syncMotion();
  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  // Local story URLs work on a static host and remain useful without JS.
  function openStory(hash, focus = false) {
    const story = [...document.querySelectorAll('.journey-story')].find(element => `#${element.id}` === hash);
    if (!story) return;
    story.open = true;
    if (focus) story.querySelector('summary').focus({preventScroll:true});
    requestAnimationFrame(() => story.scrollIntoView({block:'start',behavior:motionAllowed()?'smooth':'instant'}));
  }
  document.querySelectorAll('a[href^="#story-"]').forEach(link => link.addEventListener('click', () => openStory(link.hash, true)));
  window.addEventListener('hashchange', () => openStory(location.hash));
  openStory(location.hash);

  const rail = document.querySelector('.journey-destinations');
  const railControls = document.querySelector('.journey-rail-controls');
  if (rail && railControls) {
    railControls.hidden = false;
    const buttons = [...railControls.querySelectorAll('button')];
    function updateRail() {
      buttons[0].disabled = rail.scrollLeft < 2;
      buttons[1].disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      const first = rail.querySelector('.journey-destination');
      const amount = first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).gap) : rail.clientWidth;
      rail.scrollBy({left:Number(button.dataset.rail)*amount, behavior:motionAllowed()?'smooth':'instant'});
    }));
    rail.addEventListener('scroll', updateRail, {passive:true});
    if ('ResizeObserver' in window) new ResizeObserver(updateRail).observe(rail);
    updateRail();
  }

  // No remote map service: the accessible location sketch works offline.
  const markers = [...document.querySelectorAll('[data-stop]')];
  const panels = [...document.querySelectorAll('.journey-map-detail')];
  function selectStop(marker) {
    const panel = document.getElementById(`map-${marker.dataset.stop}`);
    if (!panel) return;
    panels.forEach(item => item.hidden = item !== panel);
    markers.forEach(item => item.setAttribute('aria-pressed', String(item === marker)));
    document.querySelector('.journey-map-status').textContent = `Selected ${panel.querySelector('h3').textContent}. Photo, memory, and story link shown below the map.`;
  }
  markers.forEach(marker => {
    marker.setAttribute('role','button');
    marker.setAttribute('aria-controls',`map-${marker.dataset.stop}`);
    marker.addEventListener('click', event => { event.preventDefault(); selectStop(marker); });
    marker.addEventListener('keydown', event => {
      if (event.key === ' ') { event.preventDefault(); selectStop(marker); }
    });
  });
  if (markers.length) selectStop(markers[0]);

  function imageFallback(image) {
    if (!image.isConnected) return;
    const placeholder = document.createElement('span');
    placeholder.className = 'journey-missing';
    placeholder.setAttribute('role','img');
    placeholder.setAttribute('aria-label',image.alt || 'Photograph unavailable');
    placeholder.textContent = 'This photograph is taking the scenic route. The story is still here.';
    image.replaceWith(placeholder);
  }
  document.querySelectorAll('main img').forEach(image => {
    image.addEventListener('error', () => imageFallback(image), {once:true});
    if (image.complete && !image.naturalWidth) imageFallback(image);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (motionAllowed()) entry.target.animate([{opacity:.5,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});
    }),{threshold:.1});
    document.querySelectorAll('.journey-destination,.journey-memory').forEach(element => observer.observe(element));
  }
})();
