const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});try{
 const page=await browser.newPage({reducedMotion:'reduce'});await page.goto(process.env.SITE_URL||'http://localhost:4173');await page.locator('[data-layout=shelf]').click();
 for(const width of [320,375,390,414,768,1024,1280,1440,1920]){
  await page.setViewportSize({width,height:1000});
  for(const index of [0,5,26]){
   await page.locator('#deck-range').evaluate((e,i)=>{e.value=i;e.dispatchEvent(new Event('input',{bubbles:true}));},index);
   await page.locator('#deck-stage').evaluate(e=>e.scrollIntoView({block:'center'}));
   const result=await page.locator('.deck-card[aria-pressed=true]').evaluate(card=>{
    const r=card.getBoundingClientRect(),s=card.closest('.deck-stage').getBoundingClientRect(),css=getComputedStyle(card);
    const clear=[.05,.5,.95].every(x=>[.1,.5,.9].every(y=>card.contains(document.elementFromPoint(r.x+r.width*x,r.y+r.height*y))));
    return {clear,left:parseFloat(css.borderLeftWidth),right:parseFloat(css.borderRightWidth),paddingLeft:css.paddingLeft,paddingRight:css.paddingRight,fits:r.x>=s.x&&r.right<=s.right&&r.y>=s.y&&r.bottom<=s.bottom};
   });
   assert.ok(result.clear,`obscured selected card ${width} frame ${index}`);assert.ok(result.fits,`clipped ${width}`);assert.equal(result.left,result.right);assert.equal(result.paddingLeft,result.paddingRight);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('#deck-range').evaluate(e=>{e.value=5;e.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.locator('.deck-card[aria-pressed=true] img').evaluate(i=>i.decode());
 await page.locator('#deck-stage').evaluate(e=>e.scrollIntoView({block:'center'}));await page.screenshot({path:'tests/shelf-fix-mobile.png'});
 await page.setViewportSize({width:1440,height:1000});await page.locator('#deck-stage').evaluate(e=>e.scrollIntoView({block:'center'}));await page.screenshot({path:'tests/shelf-fix-desktop.png'});
 console.log('PASS: clean, symmetric shelf frames; selected photograph unobscured and unclipped at nine widths, including first/last wraparound.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
