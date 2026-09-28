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

  // Keep the reader oriented without taking over native scrolling.
  const chapterLinks = [...document.querySelectorAll('.journey-nav a')];
  const chapterSections = chapterLinks.map(link=>document.querySelector(link.hash));
  let scrollFrame = 0;
  function trackReading() {
    scrollFrame = 0;
    const headerHeight = document.querySelector('.journey-header').getBoundingClientRect().height;
    document.body.style.setProperty('--journey-header-height', `${headerHeight}px`);
    const total = document.documentElement.scrollHeight-innerHeight;
    document.body.style.setProperty('--journey-progress', String(total>0 ? Math.max(0,Math.min(1,scrollY/total)) : 0));
    let active = -1;
    chapterSections.forEach((section,index)=>{if(section.getBoundingClientRect().top <= headerHeight+150) active=index;});
    chapterLinks.forEach((link,index)=>{
      if(index===active) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  function queueReading() { if(!scrollFrame) scrollFrame=requestAnimationFrame(trackReading); }
  window.addEventListener('scroll',queueReading,{passive:true});
  window.addEventListener('resize',queueReading,{passive:true});
  if ('ResizeObserver' in window) new ResizeObserver(queueReading).observe(document.body);
  trackReading();
  function enter(element) {
    if (!element || !motionAllowed()) return;
    element.getAnimations().forEach(animation=>animation.cancel());
    element.animate([{opacity:.25,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
  enter(document.querySelector('#journey-title'));
  document.querySelectorAll('.journey-story').forEach(story=>story.addEventListener('toggle',()=>{
    if(story.open) { enter(story.querySelector('.journey-story-body')); window.nydhTrack?.('Travel story open', { story: story.id.replace('story-','') }); }
  }));
  markers.forEach(marker=>marker.addEventListener('click',()=>enter(document.getElementById(`map-${marker.dataset.stop}`))));

  // A native dialog keeps original photographs in the journal, with a real-link fallback.
  const viewer = document.querySelector('.journey-viewer');
  const viewerImage = viewer.querySelector('img');
  const photoLinks = [...document.querySelectorAll('.journey-moments .journey-image-link')];
  let photoIndex = 0, photoOpener = null, swipeStart = null;
  function showMoment(index) {
    photoIndex = (index+photoLinks.length)%photoLinks.length;
    const link = photoLinks[photoIndex];
    const caption = link.closest('figure').querySelector('figcaption span').textContent;
    viewer.querySelector('.journey-viewer-status').textContent = '';
    viewerImage.hidden=false;
    viewerImage.alt=link.querySelector('img')?.alt || caption;
    viewerImage.src=link.href;
    viewer.querySelector('#journey-viewer-caption').textContent=caption;
    viewer.querySelector('#journey-viewer-count').textContent=`FRAME ${String(photoIndex+1).padStart(2,'0')} / ${String(photoLinks.length).padStart(2,'0')}`;
    viewer.querySelector('.journey-viewer-original').href=link.href;
    viewer.querySelectorAll('[data-viewer-step]').forEach(button=>button.disabled=photoLinks.length<2);
    enter(viewerImage);
  }
  photoLinks.forEach((link,index)=>link.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||typeof viewer.showModal!=='function')return;
    event.preventDefault(); photoOpener=link; showMoment(index); viewer.showModal(); document.body.classList.add('journey-viewer-open');
  }));
  viewer.querySelector('.journey-viewer-close').addEventListener('click',()=>viewer.close());
  viewer.querySelectorAll('[data-viewer-step]').forEach(button=>button.addEventListener('click',()=>showMoment(photoIndex+Number(button.dataset.viewerStep))));
  viewer.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showMoment(photoIndex+(event.key==='ArrowLeft'?-1:1));}
  });
  viewer.addEventListener('click',event=>{
    if(event.target!==viewer)return;
    const box=viewer.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)viewer.close();
  });
  viewer.addEventListener('close',()=>{document.body.classList.remove('journey-viewer-open');photoOpener?.focus({preventScroll:true});});
  viewerImage.addEventListener('error',()=>{viewerImage.hidden=true;viewer.querySelector('.journey-viewer-status').textContent='This photograph could not load. You can still browse the other moments.';});
  viewerImage.addEventListener('touchstart',event=>{swipeStart=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
  viewerImage.addEventListener('touchcancel',()=>{swipeStart=null;});
  viewerImage.addEventListener('touchend',event=>{
    if(!swipeStart||!event.changedTouches.length)return;
    const dx=event.changedTouches[0].clientX-swipeStart.x,dy=event.changedTouches[0].clientY-swipeStart.y;swipeStart=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)showMoment(photoIndex+(dx<0?1:-1));
  },{passive:true});
})();
