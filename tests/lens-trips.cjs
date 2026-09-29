const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[320,740],[390,844],[760,800],[844,390],[1440,1000]]) {
  await page.setViewportSize({width,height}); await page.goto('http://localhost:4173');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`home overflow ${width}`);
  if(width>760){
   assert(await page.locator('#navigation').isVisible());
   await page.locator('.nav-open-btn').click();
   for(const id of ['home','gallery','featured','journey','about','contact']) {
    const link=page.locator(`#navigation a[href="#${id}"]`);await link.scrollIntoViewIfNeeded();
    assert(await link.isVisible());
   }
   await page.locator('#navigation a[href="#journey"]').click();
   await page.waitForTimeout(1100);
   assert.equal(await page.locator('#dial-frame').innerText(),'04');
   await page.locator('.nav-open-btn').click();await page.keyboard.press('Escape');
   assert.equal(await page.locator('.nav-open-btn').getAttribute('aria-expanded'),'false');
  } else {
   await page.locator('#mobile-lens-toggle').click();await page.waitForTimeout(650);
   for(const link of await page.locator('#mobile-lens-options a').all()) {
    const r=await link.boundingBox(); assert(r.x>=0&&r.x+r.width<=width&&r.y>=0&&r.y+r.height<=height,`lens bounds ${width}`);
   }
   if(width===390)await page.screenshot({path:'tests/restored-lens-mobile.png'});
   await page.locator('#mobile-lens-options a[href="#journey"]').click();await page.waitForTimeout(1100);
   assert.equal(await page.locator('.nav-open-btn').getAttribute('aria-expanded'),'false');
  }
  await page.goto('http://localhost:4173/travel.html');
  assert.equal(await page.locator('.trip-folder').count(),3);assert.equal(await page.locator('.trip-trail').evaluate(e=>getComputedStyle(e).position),'static');
  await page.locator('.trip-trail a[href="#trip-goa"]').click();
  assert(await page.locator('#trip-goa').evaluate(e=>e.open));
  await page.locator('#trip-goa summary').click(); assert(!await page.locator('#trip-goa').evaluate(e=>e.open));
  await page.goto('http://localhost:4173/travel.html#trip-varkala');
  assert(await page.locator('#trip-varkala').evaluate(e=>e.open));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`trip overflow ${width}`);
  if(width===1440){await page.locator('#trip-varkala summary').click();await page.locator('#trips').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(500);const heights=await page.locator('.trip-cover img').evaluateAll(imgs=>imgs.map(i=>i.offsetHeight));assert(Math.max(...heights)-Math.min(...heights)<2,'Uniform folder covers');await page.screenshot({path:'tests/trip-folders-desktop.png'});}
  console.log(`PASS lens and folders ${width}x${height}`);
 }
 const nojs=await browser.newPage({javaScriptEnabled:false}); await nojs.goto('http://localhost:4173/travel.html'); await nojs.locator('#trip-goa summary').click(); assert(await nojs.locator('#trip-goa').evaluate(e=>e.open));
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://localhost:4173');await page.locator('.nav-open-btn').click();assert.equal(await page.locator('.focus-dial').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

