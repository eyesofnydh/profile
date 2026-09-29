'use strict';
(() => {
  const chapters = [
    {id:'coast', title:'A slower kind of blue.', number:'01', copy:'A pink horizon, a glowing beachside building, and the tide finding its way back. Three different ways to pause by the water.', label:'COAST & CONNECTION', note:'a little closer to the sea', files:['f3.png','fp2.png','ip6.png']},
    {id:'green', title:'Room to breathe.', number:'02', copy:'Follow the water through palms, look up toward the mountains, and find a clearing in the green. A small collection for taking the long way home.', label:'NATURE & STILLNESS', note:'a place to slow down', files:['f4.png','t1.png','t4.png']},
    {id:'night', title:'When the light changes.', number:'03', copy:'The familiar becomes something else after sunset. A figure beneath the stars, a temple against a dark sky, and a quiet crescent moon.', label:'LIGHT & SHADOW', note:'stay a little longer', files:['f5.png','t3.png','rp4.png']}
  ];
  let index = 0;
  const tabs = [...document.querySelectorAll('[data-chapter]')];
  const main = document.querySelector('#chapter-image');
  const detail = document.querySelector('#chapter-detail');
  function render() {
    const chapter=chapters[index];
    const images=chapter.files.map(file=>window.NYDH_PHOTOS.find(photo=>photo.file===file));
    [main,detail].forEach((image,i)=>{
      window.setPhotoPreview(image, images[i]); image.alt=images[i].alt;
      image.width=images[i].width; image.height=images[i].height;
      image.getAnimations().forEach(a=>a.cancel());
      if(motionAllowed())image.animate([{opacity:.25,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:500,easing:'ease-out'});
    });
    document.querySelector('#chapter-title').textContent=chapter.title;
    document.querySelector('#chapter-description').textContent=chapter.copy;
    document.querySelector('#chapter-number').textContent=`A PHOTO SERIES / ${chapter.number}`;
    document.querySelector('#chapter-count').textContent=`03 FRAMES / ${chapter.label}`;
    document.querySelector('#chapter-print-caption').textContent=chapter.note;
    document.querySelector('#chapter-progress').textContent=`${chapter.number} / 03`;
    document.querySelector('#chapter-photo').setAttribute('aria-label',`Open ${chapter.title} photo story`);
    tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.chapter===chapter.id)));
  }
  function select(next){index=(next+chapters.length)%chapters.length;render();}
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(i));
    tab.addEventListener('keydown',e=>{
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
      e.preventDefault();select(index+(e.key==='ArrowRight'?1:-1));tabs[index].focus();
    });
  });
  document.querySelector('#chapter-prev').addEventListener('click',()=>select(index-1));
  document.querySelector('#chapter-next').addEventListener('click',()=>select(index+1));
  [document.querySelector('#chapter-open'),document.querySelector('#chapter-photo')].forEach(button=>button.addEventListener('click',event=>{
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('nydh:open-story',{detail:{files:chapters[index].files,trigger:button}}));
  }));
})();
