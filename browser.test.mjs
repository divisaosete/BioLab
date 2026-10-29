import {fileURLToPath} from 'node:url';
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchBrowser,startServer,clickStructure,pointInStructure} from './browser-tools.mjs';
import {cellOrganelles,organsFor,SYSTEMS,ORGANS} from './catalog.js';
import {EMPTY_SELECTION} from './selection-panel.js';
let server,browser;
const report={date:'2026-10-29',method:'Playwright + Edge headless; real mouse clicks and browser touchscreen taps',browser:null,cases:[],errors:[]};
const output=new URL('relatorios/',import.meta.url);
before(async()=>{await mkdir(output,{recursive:true});server=await startServer();browser=await launchBrowser();report.browser=browser.version()});
after(async()=>{await writeFile(new URL(process.env.BIOLAB_BROWSER_REPORT||'navegador.json',output),JSON.stringify(report,null,2));await browser?.close();await server?.close()});

async function readPanel(page,panelId,id,entry,system,checkViewport){
  const panel=page.locator(panelId);await page.waitForFunction(({panelId,id})=>document.querySelector(panelId)?.dataset.selectedId===id,{panelId,id});
  assert.equal(await panel.getAttribute('data-selected-id'),id);assert.equal(await panel.locator('h2').innerText(),entry.name);assert.equal(await panel.locator('[data-field="function"]').innerText(),entry.function);assert.equal(await panel.locator('[data-field="description"]').innerText(),entry.detail);
  if(system){assert.equal(await panel.locator('[data-field="system"]').innerText(),SYSTEMS[system].name);assert.equal(await panel.locator('[data-field="location"]').innerText(),entry.location)}
  if(checkViewport)await page.waitForFunction(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return r.top>=-1&&r.bottom<=innerHeight+1},panelId);
  assert.ok(await panel.isVisible());return panel.innerText();
}
for(const config of [{name:'desktop',width:1440,height:1000,touch:false},{name:'celular',width:360,height:800,touch:true},{name:'tablet',width:768,height:1024,touch:true}]){
  if(process.env.BIOLAB_VIEWPORT&&Number(process.env.BIOLAB_VIEWPORT)!==config.width)continue;
  test(`Navegador real · ${config.name} ${config.width}px`,{timeout:600000},async t=>{
    const context=await browser.newContext({viewport:{width:config.width,height:config.height},isMobile:config.touch,hasTouch:config.touch});const page=await context.newPage();page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(45000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    async function item(label,fn){if(process.env.BIOLAB_CASE&&!label.includes(process.env.BIOLAB_CASE))return;if(t.signal.aborted)throw t.signal.reason;await t.test(label,async()=>{try{const detail=await fn();report.cases.push({viewport:config.width,input:config.touch?'toque':'mouse',case:label,passed:true,...detail})}catch(error){report.cases.push({viewport:config.width,case:label,passed:false,error:error.message,url:page.url(),state:await page.evaluate(()=>({selected:document.querySelector('#cell-info,#organ-info')?.dataset.selectedId,hash:location.hash})).catch(()=>null)});await writeFile(new URL('falhas-parciais.json',output),JSON.stringify(report,null,2));await page.screenshot({path:fileURLToPath(new URL(`falha-${config.name}.png`,output))}).catch(()=>{});throw error}})}
    try{
      await page.goto(server.url+'/biolab/#cells');
      await item('Painel começa com a instrução e módulo de proteínas ausente',async()=>{assert.ok((await page.locator('#cell-info').innerText()).includes(EMPTY_SELECTION));assert.deepEqual(await page.locator('nav a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),['#overview','#dna','#cells','#anatomy','#library']);return {panelText:await page.locator('#cell-info').innerText()}});
      for(const type of ['animal','plant']){
        await page.locator(`[data-cell-type="${type}"]`).click();assert.ok((await page.locator('#cell-info').innerText()).includes(EMPTY_SELECTION));
        for(const [id,o]of cellOrganelles(type))await item(`Célula ${type} · ${o.name}`,async()=>{await clickStructure(page,`#cell-svg [data-structure="${id}"]`,config.touch);const panelText=await readPanel(page,'#cell-info',id,o,null,config.width<=1150);assert.ok((await page.locator(`#cell-svg [data-structure="${id}"]`).getAttribute('class')).includes('selected'));await page.mouse.move(0,0);assert.equal(await page.locator('#cell-info h2').innerText(),o.name);return {id,panelText}});
        await item(`Célula ${type} · seleção depois de zoom`,async()=>{await page.locator('[data-zoom="in"]').click();await page.locator('[data-zoom="in"]').click();const [id,o]=cellOrganelles(type).find(([id])=>id==='mitochondria');await clickStructure(page,`#cell-svg [data-structure="${id}"]`,config.touch);const panelText=await readPanel(page,'#cell-info',id,o,null,config.width<=1150);if(config.name==='desktop'&&type==='animal'||config.name==='celular'&&type==='plant')await page.screenshot({path:fileURLToPath(new URL(`celula-${type}-${config.name}.png`,output))});await page.locator('[data-zoom="reset"]').click();return {panelText}});
      }
      await item('Células · arraste não seleciona e o clique seguinte funciona',async()=>{await page.locator('[data-cell-type="animal"]').click();const p=await pointInStructure(page,'#cell-svg [data-structure="nucleus"]');await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+25,p.y+18,{steps:5});await page.mouse.up();assert.ok((await page.locator('#cell-info').innerText()).includes(EMPTY_SELECTION));await clickStructure(page,'#cell-svg [data-structure="mitochondria"]',config.touch);return {panelText:await readPanel(page,'#cell-info','mitochondria',cellOrganelles('animal').find(([id])=>id==='mitochondria')[1],null,config.width<=1150)}});
      await page.goto(server.url+'/biolab/#anatomy');assert.ok((await page.locator('#organ-info').innerText()).includes(EMPTY_SELECTION));
      for(const system of Object.keys(SYSTEMS)){
        await page.locator(`[data-anatomy-system="${system}"]`).click();assert.ok((await page.locator('#organ-info').innerText()).includes(EMPTY_SELECTION));
        for(const [id,o]of organsFor(system))await item(`${SYSTEMS[system].name} · ${o.name}`,async()=>{await clickStructure(page,`#anatomy-svg [data-structure="${id}"]`,config.touch);const panelText=await readPanel(page,'#organ-info',id,o,o.system,config.width<=1150);assert.equal(await page.locator(`#anatomy-svg [data-structure="${id}"]`).getAttribute('aria-pressed'),'true');return {id,system,panelText}});
      }
      await item('Coração · seleção depois de zoom e descrição persistente',async()=>{await page.locator('[data-anatomy-system="cardiovascular"]').click();await page.locator('[data-zoom="in"]').click();await clickStructure(page,'#anatomy-svg [data-structure="heart"]',config.touch);const panelText=await readPanel(page,'#organ-info','heart',ORGANS.heart,'cardiovascular',config.width<=1150);await page.mouse.move(0,0);assert.equal(await page.locator('#organ-info h2').innerText(),'Coração');if(config.name==='celular')await page.screenshot({path:fileURLToPath(new URL(`coracao-${config.name}.png`,output))});return {panelText}});
      await item('Seleção de órgão por teclado',async()=>{await page.locator('[data-anatomy-system="digestive"]').click();await page.locator('#anatomy-svg [data-structure="liver"]').focus();await page.keyboard.press('Enter');return {panelText:await readPanel(page,'#organ-info','liver',ORGANS.liver,'digestive',config.width<=1150)}});
      await item('DNA preservado',async()=>{await page.goto(server.url+'/biolab/#dna');await page.locator('[data-baseindex="4"]').click();assert.equal(await page.locator('#base-index').inputValue(),'5');await page.locator('#rotate-right').click();await page.locator('#zoom').fill('1.2');await page.locator('#zoom').dispatchEvent('input');assert.ok(await page.locator('.helix').isVisible());return {panelText:await page.locator('main h2').innerText()}});
      await item('Biblioteca preservada, navegação e layout sem rolagem lateral',async()=>{await page.goto(server.url+'/biolab/#library');assert.equal(await page.locator('#articles details').count(),13);await page.locator('#search').fill('Ética da edição genética');assert.equal(await page.locator('#articles details').count(),1);await page.goto(server.url+'/biolab/');assert.equal(await page.locator('a[href="#proteins"]').count(),0);assert.equal(await page.locator('.exploration-cards .card').count(),4);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false);return {}});
      await item('Sem erros JavaScript ou de recursos no console',async()=>{assert.deepEqual(errors,[]);return {consoleErrors:errors}});
    }finally{report.errors.push(...errors.map(message=>({viewport:config.width,message})));await context.close()}
  });
}
