const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try {
  const page=await browser.newPage({reducedMotion:'reduce'}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.SITE_URL||'http://localhost:4173');
  for(const width of [320,375,390,760,768,1440]){
   await page.setViewportSize({width,height:900});
   for(const mode of ['stack','shelf','grid']){
    await page.locator(`[data-layout=${mode}]`).click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${mode}`);
    if(mode!=='grid'){
     const stage=await page.locator('#deck-stage').boundingBox(),card=await page.locator('.deck-card[aria-pressed=true]').boundingBox();
     assert.ok(card.y>=stage.y&&card.y+card.height<=stage.y+stage.height,`selected card clipped ${width} ${mode}`);
     const prev=await page.locator('#deck-prev').boundingBox(), next=await page.locator('#deck-next').boundingBox();
     assert.ok(Math.abs(prev.y-next.y)<1,`arrows misaligned ${width}`);
    } else {
     assert.ok(await page.locator('.archive-tools').evaluate(e=>e.open));
     for(const card of await page.locator('.photo-card').all()){
      const title=await card.locator('h3').boundingBox(),save=await card.locator('.save-photo').boundingBox();
      assert.ok(title.y+title.height<=save.y||title.x+title.width<=save.x,`Save overlaps title at ${width}`);
     }
    }
   }
  }
  await page.setViewportSize({width:320,height:900});
  await page.locator('[data-layout=stack]').click();
  assert.ok(await page.locator('.archive-tools').evaluate(e=>e.open),'layout switch must not hide active filters');
  await page.locator('#deck-save').click();
  await page.locator('#saved-filter').click();
  await page.locator('#deck-save').click();
  assert.ok(await page.locator('#deck-reset').evaluate(e=>e===document.activeElement));
  assert.equal(await page.locator('.deck-controls').isVisible(),false);
  assert.equal(await page.locator('.deck-scrubber').isVisible(),false);
  await page.locator('#deck-reset').click();
  await page.locator('#deck-open').click();
  await page.evaluate(()=>{
   Object.defineProperty(navigator,'share',{value:undefined,configurable:true});
   Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('blocked')}},configurable:true});
  });
  await page.locator('#photo-share').click();
  const caption=await page.locator('#photo-caption').innerText();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#photo-caption').innerText(),caption,'editing copied link must not change photos');
  await page.keyboard.press('Escape');
  await page.locator('.archive-tools').evaluate(e=>e.open=false);
  await page.locator('[data-layout=shelf]').click();
  await page.locator('#deck-stage').evaluate(e=>e.scrollIntoView({block:'center'}));
  await page.screenshot({path:'tests/gallery-ui-mobile.png'});
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('[data-layout=grid]').click();
  await page.locator('#photo-grid').evaluate(e=>e.scrollIntoView({block:'start'}));
  await page.screenshot({path:'tests/gallery-ui-desktop.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: three layouts at six widths, unclipped selected cards, aligned navigation, non-overlapping Save controls, filter preservation, empty-state focus and share-link keyboard editing.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
