const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async()=>{const browser=await chromium.launch();try{
const page=await browser.newPage({reducedMotion:'no-preference'});
for(const width of [390,1440]){
 await page.setViewportSize({width,height:844});await page.goto('http://localhost:4173');
 await page.waitForFunction(()=>!!document.querySelector('#scene-image').style.translate);
 const before=await page.locator('#scene-image').evaluate(e=>e.style.translate);
 await page.evaluate(()=>scrollTo({top:350,behavior:'instant'}));
 await page.waitForFunction(before=>document.querySelector('#scene-image').style.translate!==before,before);
 await page.locator('#motion-toggle').click();
 assert.equal(await page.locator('#scene-image').evaluate(e=>getComputedStyle(e).translate),'none');
 assert.equal(await page.locator('#scene-image').evaluate(e=>getComputedStyle(e).scale),'none');
 await page.locator('#motion-toggle').click();
 await page.locator('.journey-preview-visual').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>!!document.querySelector('.scroll-image-crop img').style.translate);
 assert.equal(await page.locator('.scroll-image-crop').count(),2);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.scroll-image-crop img')).translate==='none');
 assert.equal(await page.locator('.scroll-image-crop img').first().evaluate(e=>getComputedStyle(e).scale),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 console.log(`PASS scroll-linked motion, crop bounds, pause/resume and system reduced motion: ${width}px`);
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
