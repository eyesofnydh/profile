'use strict';
try { if (localStorage.getItem('nydh-motion-paused') === 'true') document.documentElement.classList.add('motion-paused'); } catch {}
const motionAllowed = () => !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('motion-paused');
(() => {
  const nav = document.querySelector('[data-navbar]');
  const toggle = document.querySelector('.nav-open-btn');
  function closeMenu(returnFocus = false) {
    nav.classList.remove('active');
    document.body.classList.remove('menu-open');
    toggle.querySelector('.menu-label').textContent = 'Menu';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('active');
    document.body.classList.toggle('menu-open', open);
    toggle.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('active')) closeMenu(true); });
  document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
  document.addEventListener('focusin', e => { if (!e.target.closest('.header')) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();

// A real moving focus wheel: page scroll rolls the labels past a fixed pointer.
(() => {
  const dial = document.querySelector('.focus-dial');
  const track = dial.querySelector('.dial-track');
  const links = [...dial.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.hash));
  const desktop = matchMedia('(min-width: 761px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0, pending = false, settleTimer, wheelTotal = 0, lastWheel = 0;
  let preview = null;
  function paint(position, snap = false) {
    const visual = preview ?? position;
    dial.classList.toggle('dial-snapping', snap && motionAllowed());
    track.style.setProperty('--dial-position', visual);
    dial.style.setProperty('--tick-offset', `${-visual * 76}px`);
    links.forEach((link, index) => {
      const distance = Math.abs(index - visual);
      link.style.setProperty('--dial-scale', Math.max(.76, 1 - distance * .1));
      link.style.setProperty('--dial-opacity', Math.max(.25, 1 - distance * .29));
    });
  }
  function updatePosition() {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    document.documentElement.style.setProperty('--read-progress', max ? Math.min(1, Math.max(0, scrollY / max)) : 0);
    const stops = sections.map((section, index) => index ? Math.max(0, Math.min(max, section.getBoundingClientRect().top + scrollY - 100)) : 0);
    let position = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      if (scrollY >= stops[i]) position = i + Math.min(1, Math.max(0, (scrollY - stops[i]) / Math.max(1, stops[i + 1] - stops[i])));
    }
    selected = Math.round(position);
    links.forEach((link, index) => {
      if (index === selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    document.querySelector('#dial-frame').textContent = String(selected + 1).padStart(2, '0');
    paint(motionAllowed() ? position : selected);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => paint(selected, true), 140);
    pending = false;
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(updatePosition); } }
  addEventListener('scroll', () => { preview = null; schedule(); }, {passive: true});
  addEventListener('resize', schedule);
  new ResizeObserver(schedule).observe(document.body);
  desktop.addEventListener('change', () => { preview = null; schedule(); });
  reduced.addEventListener('change', schedule);
  document.addEventListener('nydh:motion', schedule);
  function navigate(index) {
    preview = null;
    links[Math.max(0, Math.min(links.length - 1, index))].click();
  }
  // Only a deliberate wheel gesture over the dial changes chapters.
  dial.addEventListener('wheel', event => {
    if (dial.classList.contains('active') || !desktop.matches || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const direction = Math.sign(event.deltaY);
    if (!direction || (selected === 0 && direction < 0) || (selected === links.length - 1 && direction > 0)) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheel < 650) return;
    wheelTotal += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(wheelTotal) >= 35) {
      navigate(selected + Math.sign(wheelTotal));
      wheelTotal = 0; lastWheel = now;
    }
  }, {passive: false});
  links.forEach((link, index) => {
    // Clipped wheel entries remain reachable using Tab and arrow keys.
    link.addEventListener('focus', () => { preview = index; paint(index, true); });
    link.addEventListener('click', () => { preview = null; schedule(); });
    link.addEventListener('keydown', event => {
      const step = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1}[event.key];
      if (step) { event.preventDefault(); links[(index + step + links.length) % links.length].focus({preventScroll: true}); }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault(); links[event.key === 'Home' ? 0 : links.length - 1].focus({preventScroll: true});
      }
    });
  });
  dial.addEventListener('focusout', event => { if (!dial.contains(event.relatedTarget)) { preview = null; paint(selected, true); } });
  updatePosition();
})();

// Deliberately manual: visitors choose the pace of the photographic opening.
(() => {
  const scenes = [
    {file: 'f4.png', title: 'A world of green', alt: 'A quiet waterway through green fields and coconut palms beneath a Kerala sky'},
    {file: 'f3.png', title: 'Drawn to the sea', alt: 'An illuminated beachside building beneath a blue evening sky'},
    {file: 'fp2.png', title: 'Together by the ocean', alt: 'Two people standing together on the beach beneath a pink sunset'}
  ];
  const image = document.querySelector('#scene-image');
  const choices = [...document.querySelectorAll('[data-scene]')];
  const controls = document.querySelector('.scene-selector');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0;
  function select(index) {
    selected = (index + scenes.length) % scenes.length;
    const scene = scenes[selected];
    image.src = `./assets/images/${scene.file}`;
    image.alt = scene.alt;
    document.querySelector('#scene-title').textContent = `${String(selected + 1).padStart(2, '0')} — ${scene.title}`;
    choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
    image.getAnimations().forEach(animation => animation.cancel());
    if (motionAllowed()) image.animate([{clipPath: 'inset(0 100% 0 0)', transform: 'scale(1.08)'}, {clipPath: 'inset(0 0% 0 0)', transform: 'scale(1)'}], {duration: 850, easing: 'cubic-bezier(.2,.65,.3,1)'});
  }
  choices.forEach((button, index) => button.addEventListener('click', () => select(index)));
  document.querySelector('#scene-prev').addEventListener('click', () => select(selected - 1));
  document.querySelector('#scene-next').addEventListener('click', () => select(selected + 1));
  controls.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    select(selected + (event.key === 'ArrowRight' ? 1 : -1));
    choices[selected].focus();
  });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) image.getAnimations().forEach(animation => animation.cancel()); });
})();

// A quiet view keeps the image and filmstrip, with an always-visible way back.
(() => {
  const hero = document.querySelector('.cinematic-hero');
  const toggle = document.querySelector('#quiet-toggle');
  const heading = hero.querySelector('.hero-heading');
  function setQuiet(quiet) {
    hero.classList.toggle('quiet-view', quiet);
    toggle.setAttribute('aria-pressed', String(quiet));
    toggle.textContent = quiet ? '◉ Bring back the story' : '◉ Just the photograph';
    heading.inert = quiet;
    if (quiet) heading.setAttribute('aria-hidden', 'true');
    else heading.removeAttribute('aria-hidden');
  }
  toggle.addEventListener('click', () => setQuiet(toggle.getAttribute('aria-pressed') !== 'true'));
  hero.addEventListener('keydown', event => { if (event.key === 'Escape') setQuiet(false); });
})();

// Optional motion is user-controlled; animations never gate access to content.
(() => {
  const toggle = document.querySelector('#motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  function refresh() {
    const paused = !motionAllowed();
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', preference.matches ? 'Reduced motion is enabled in your system settings' : paused ? 'Enable animations' : 'Pause animations');
    toggle.textContent = preference.matches ? 'Reduced motion' : paused ? 'Enable motion' : 'Pause motion';
    toggle.setAttribute('aria-disabled', String(preference.matches));
    toggle.title = preference.matches ? 'Your device requests reduced motion. Animations stay off.' : paused ? 'Turn on scroll, card, and photo transitions.' : 'Turn off scroll, card, and photo transitions. Photos and navigation still work.';
    if (paused) document.getAnimations().forEach(animation => animation.cancel());
    document.dispatchEvent(new Event('nydh:motion'));
  }
  toggle.addEventListener('click', () => {
    if (preference.matches) return;
    const paused = document.documentElement.classList.toggle('motion-paused');
    try { localStorage.setItem('nydh-motion-paused', String(paused)); } catch {}
    refresh();
  });
  preference.addEventListener('change', refresh);
  refresh();

  // Finite entrance and section reveals, no permanent hidden initial states.
  if (motionAllowed()) {
    document.querySelectorAll('.title-line > *').forEach((line, index) => line.animate(
      [{transform:'translateY(110%) rotate(3deg)',opacity:0},{transform:'translateY(0) rotate(0)',opacity:1}],
      {duration:1100,delay:120+index*150,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    if (motionAllowed()) entry.target.animate(
      [{opacity:0,transform:'translateY(35px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:800,easing:'cubic-bezier(.16,1,.3,1)'});
  }), {threshold:.12});
  document.querySelectorAll('.section-heading,.feature-card,.about-copy,.portrait-wrap,.contact').forEach(el => observer.observe(el));
  const grid = document.querySelector('#photo-grid');
  const photoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    photoObserver.unobserve(entry.target);
    if (motionAllowed()) entry.target.animate(
      [{opacity:.15, transform:'translateY(30px)', clipPath:'inset(8% 0 0 0)'}, {opacity:1, transform:'translateY(0)', clipPath:'inset(0 0 0 0)'}],
      {duration:700,delay:Number(entry.target.dataset.revealOrder || 0)*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
  }), {threshold:.1});
  new MutationObserver(records => records.forEach(record => {
    record.addedNodes.forEach(node => { if (node.nodeType === 1) photoObserver.observe(node); });
    record.removedNodes.forEach(node => { if (node.nodeType === 1) photoObserver.unobserve(node); });
  })).observe(grid, {childList:true});


  // A soft light follows the pointer on glass surfaces; native cursors stay intact.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.cinematic-hero');
  let frame;
  hero.addEventListener('pointermove', event => {
    if (!finePointer.matches || !motionAllowed()) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--light-x', `${event.clientX-r.left}px`);
      hero.style.setProperty('--light-y', `${event.clientY-r.top}px`);
    });
  });
  hero.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); hero.style.removeProperty('--light-x'); hero.style.removeProperty('--light-y'); });
})();

// Scroll-linked depth: finite, clamped movement using the native document scroll.
(() => {
  const hero = document.querySelector('.cinematic-hero');
  const frame = hero.querySelector('.hero-frame');
  const ribbon = document.querySelector('.frame-ribbon');
  let pending = false;
  function draw() {
    const top = hero.getBoundingClientRect().top;
    const depth = motionAllowed() && innerWidth > 760 ? Math.min(65, Math.max(0, -top * .15)) : 0;
    frame.style.translate = `0 ${depth}px`;
    frame.style.scale = depth ? '1.08' : '1';
    const r = ribbon.getBoundingClientRect();
    const progress = motionAllowed() ? Math.max(-1,Math.min(1,(innerHeight*.5-r.top)/innerHeight)) : 0;
    ribbon.querySelectorAll('b').forEach((star,index) => { star.style.rotate = `${progress * (index%2 ? -100 : 100)}deg`; });
    pending = false;
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(draw); } }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  document.addEventListener('nydh:motion',schedule);
  draw();
})();
