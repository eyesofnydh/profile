const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4173');
 const lens=page.locator('#mobile-lens-toggle');
 assert.equal(await lens.isVisible(),true);
 await lens.tap();
 assert.equal(await page.locator('.nav-open-btn').getAttribute('aria-expanded'),'true');
 await page.waitForTimeout(650);
 await page.screenshot({path:'tests/lens-mobile-open.png'});
 for(const id of ['gallery','featured','about','contact','home']){
   if(await lens.getAttribute('aria-expanded')==='false')await lens.tap();
   await page.locator(`#mobile-lens-options a[href="#${id}"]`).tap();
   await page.waitForFunction(id=>document.querySelector('#mobile-lens-options a[aria-current]')?.hash===`#${id}`,id);
   assert.equal(await lens.getAttribute('aria-expanded'),'false');
   await page.waitForTimeout(900);
   assert.equal(await page.locator('#mobile-lens-options a[aria-current]').getAttribute('href'),`#${id}`);
 }
 await page.locator('.nav-open-btn').tap();
 assert.equal(await lens.getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Escape');
 assert.equal(await lens.evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('ArrowUp');
 await page.keyboard.press('ArrowRight');
 assert.equal(await page.locator('#mobile-lens-options a[href="#gallery"]').evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('Escape');
 await lens.tap();await page.mouse.click(10,300);
 assert.equal(await lens.getAttribute('aria-expanded'),'false');
 for(const [width,height] of [[320,640],[760,900],[667,375]]){
   await page.setViewportSize({width,height});await lens.tap();await page.waitForTimeout(600);
   for(const a of await page.locator('#mobile-lens-options a').all()){
    const b=await a.boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=width&&b.y+b.height<=height,`bounds ${width}`);
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.keyboard.press('Escape');
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.lens-ring').evaluate(e=>parseFloat(getComputedStyle(e).transitionDuration)),0);
 await page.setViewportSize({width:1440,height:1000});
 assert.equal(await lens.isVisible(),false);
 await page.locator('.nav-open-btn').click();
 assert.equal(await page.locator('.focus-dial').evaluate(e=>e.classList.contains('active')),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: touch navigation for five sections, scroll tracking, top menu, keyboard, outside dismissal, 320px and landscape bounds, reduced motion and desktop menu.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
