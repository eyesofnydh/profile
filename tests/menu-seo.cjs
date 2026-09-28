const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});try{
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.SITE_URL||'http://localhost:4173';await page.goto(base);
 assert.equal(await page.locator('.header-journey').count(),0);assert.equal(await page.locator('#navigation a').count(),6);assert.equal(await page.locator('#mobile-lens-options a').count(),6);
 for(const [width,height] of [[320,640],[375,812],[390,844],[414,896],[667,375],[760,900],[768,900],[1024,900],[1280,900],[1440,1000],[1920,1080]]){
  await page.setViewportSize({width,height});await page.locator('.nav-open-btn').click();
  const nav=page.locator(width<=760?'#mobile-lens-options':'#navigation');
  if(width<=760){const boxes=await nav.locator('a').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return{x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height}}));
   for(const b of boxes){assert.ok(b.x>=0&&b.y>=0&&b.right<=width&&b.bottom<=height,`menu clipped ${width}`);assert.ok(b.width>=44&&b.height>=44);}
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(a.right<=b.x||b.right<=a.x||a.bottom<=b.y||b.bottom<=a.y,`menu links overlap ${width}`);}
  }
  await nav.locator('a[href="#journey"]').click();
  await page.waitForFunction(()=>document.querySelector('#navigation a[href="#journey"]').getAttribute('aria-current')==='location');
  assert.equal(await page.locator('.nav-open-btn').getAttribute('aria-expanded'),'false');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 for(const path of ['/','/travel.html']){
  await page.goto(base+path);
  assert.equal(await page.locator('link[rel=canonical]').count(),1);assert.equal(await page.locator('meta[name=description]').count(),1);assert.equal(await page.locator('h1').count(),1);
  for(const selector of ['meta[property="og:title"]','meta[property="og:description"]','meta[property="og:image"]','meta[name="twitter:card"]'])assert.ok(await page.locator(selector).getAttribute('content'));
  const duplicate=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id).filter((id,i,ids)=>ids.indexOf(id)!==i));assert.deepEqual(duplicate,[]);
 }
 await page.goto(base);
 assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/^index,follow/);
 const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());assert.deepEqual(schema['@graph'].map(x=>x['@type']),['Person','WebSite','WebPage']);
 const robots=await page.request.get(base+'/robots.txt');assert.equal(robots.status(),200);assert.match(await robots.text(),/Sitemap: https:\/\/nydh.netlify.app\/sitemap.xml/);
 const sitemap=await page.request.get(base+'/sitemap.xml');assert.equal(sitemap.status(),200);assert.ok(!(await sitemap.text()).includes('/travel.html'));assert.equal(((await sitemap.text()).match(/<image:image>/g)||[]).length,27);
 await page.setViewportSize({width:390,height:844});await page.locator('.nav-open-btn').click();await page.screenshot({path:'tests/menu-six-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS: six-item menus across 11 viewport/landscape sizes, touch bounds/no overlap, Journey tracking, metadata, canonical, heading/ID integrity, structured data, robots and image sitemap.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
