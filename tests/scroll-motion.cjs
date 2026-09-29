const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});try{
 const page=await browser.newPage({reducedMotion:'no-preference'});
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:844});await page.goto('http://localhost:4173');
  await page.evaluate(()=>scrollTo({top:350,behavior:'instant'}));
  await page.waitForFunction(w=>document.querySelector('.hero-frame').style.scale===(w>760?'1.08':'1'),width);
  assert.equal(await page.locator('.scroll-image-crop').count(),0);
  assert(await page.locator('.hero-frame img,.chapter-photo img,.journey-preview-visual img,.portrait-wrap img').evaluateAll(es=>es.every(e=>!e.style.translate&&!e.style.scale)));
  await page.evaluate(()=>{window.reveals=[];const original=Element.prototype.animate;Element.prototype.animate=function(frames,options){window.reveals.push({className:this.className,frames,options});return original.call(this,frames,options)}});
  await page.locator('#services').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>window.reveals.some(a=>a.className==='section-heading'));
  const reveal=await page.evaluate(()=>window.reveals.find(a=>a.className==='section-heading'));
  assert.equal(reveal.options.duration,800);assert.equal(reveal.frames[0].transform,'translateY(35px)');assert(!('clipPath' in reveal.frames[0]));
  await page.locator('#motion-toggle').click();
  await page.waitForFunction(()=>document.querySelector('.hero-frame').style.scale==='1');
  await page.locator('#motion-toggle').click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('#motion-toggle').getAttribute('aria-pressed')==='true');
  await page.emulateMedia({reducedMotion:'no-preference'});
  console.log(`PASS original hero depth and reveals restored, new parallax absent, pause and reduced motion: ${width}px`);
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
