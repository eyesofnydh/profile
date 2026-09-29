const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});try{
const page=await browser.newPage({reducedMotion:'reduce'});
for(const width of [320,375,390,480,600,760]){
 await page.setViewportSize({width,height:844}); await page.goto('http://localhost:4173');
 const motion=await page.locator('#motion-toggle').boundingBox(), menu=await page.locator('.nav-open-btn').boundingBox();
 assert(Math.abs(motion.y-menu.y)<2 && motion.x+motion.width<=menu.x,'Header controls must share a row');
 assert(await page.locator('#services .section-heading').evaluate(e=>e.offsetHeight<350),'Services heading has dead space');
 await page.locator('[data-layout="grid"]').click();
 const cards=await page.locator('.photo-card').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {y:r.y,x:r.x}}));
 for(let i=0;i+1<cards.length;i+=2) assert(Math.abs(cards[i].y-cards[i+1].y)<2,'Photo wall has an empty grid cell');
 await page.locator('#load-more').click(); assert.equal(await page.locator('.photo-card').count(),24);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 console.log(`PASS compact header, services spacing, photo wall and More moments: ${width}px`);
}
await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:4173');
await page.screenshot({path:'tests/mobile-header-after.png'});
await page.locator('#services').screenshot({path:'tests/mobile-services-after.png'});
const fs=require('node:fs'); const urls=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(urls.length,29);
for(const url of urls){const local=url.replace('https://eyesofnydh.netlify.app','http://localhost:4173');const r=await page.goto(local);assert.equal(r.status(),200);assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),url);assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/^index,follow/);assert.equal(await page.locator('h1').count(),1);assert(await page.locator('meta[name="description"]').getAttribute('content'));for(const json of await page.locator('script[type="application/ld+json"]').allTextContents())JSON.parse(json);}
console.log('PASS all 29 sitemap pages: HTTP 200, canonical, robots, heading, description and structured data');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
