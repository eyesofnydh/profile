const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'no-preference'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.SITE_URL||'http://localhost:4173');
    assert.equal(await page.locator('#motion-toggle').innerText(),'Pause motion');
    await page.locator('#motion-toggle').click();
    assert.equal(await page.locator('#motion-toggle').innerText(),'Enable motion');
    await page.reload();
    assert.equal(await page.locator('#motion-toggle').innerText(),'Enable motion');
    await page.locator('#motion-toggle').click();
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>document.querySelector('#motion-toggle').textContent==='Reduced motion');
    assert.equal(await page.locator('#motion-toggle').innerText(),'Reduced motion');
    assert.equal(await page.locator('#motion-toggle').getAttribute('aria-disabled'),'true');
    await page.locator('#featured').evaluate(e=>e.scrollIntoView());
    await page.locator('#chapter-image').evaluate(i=>i.decode());
    await page.locator('#chapter-detail').evaluate(i=>i.decode());
    await page.screenshot({path:'tests/chapters-desktop.png'});
    await page.locator('#chapter-open').click();
    assert.equal(await page.locator('#photo-caption').innerText(),'Drawn to the sea');
    assert.equal(await page.locator('.filmstrip-thumb').count(),3);
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#photo-caption').innerText(),'Together by the ocean');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#chapter-open').evaluate(e=>e===document.activeElement),true);
    await page.locator('[data-chapter="green"]').click();
    assert.equal(await page.locator('#chapter-title').innerText(),'Room to breathe.');
    await page.locator('#chapter-photo').click();
    assert.equal(await page.locator('#photo-caption').innerText(),'A world of green');
    await page.keyboard.press('Escape');
    await page.locator('[data-chapter="green"]').focus();await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#chapter-title').innerText(),'When the light changes.');
    await page.locator('#chapter-next').click();assert.equal(await page.locator('#chapter-progress').innerText(),'01 / 03');
    await page.locator('#chapter-prev').click();assert.equal(await page.locator('#chapter-progress').innerText(),'03 / 03');
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:1000});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow ${width}`);
      assert.equal(await page.locator('#motion-toggle').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>0),true);
    }
    await page.setViewportSize({width:390,height:1000});
    await page.locator('.chapter-explorer').evaluate(e=>e.scrollIntoView());
    await page.locator('#chapter-image').evaluate(i=>i.decode());
    await page.screenshot({path:'tests/chapters-mobile.png'});
    assert.deepEqual(errors,[]);console.log('PASS: clear motion labels, persistence, system reduced motion, all story selections, curated lightbox, keyboard controls, focus, four responsive widths, and no browser errors.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
