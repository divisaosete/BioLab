export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

// Capture belongs only to a real drag. A tap commits the original structure on
// pointerup, independently from the browser's retargeted compatibility click.
export function mountSvgControls(root,svg,{width,height,onSelect}){
  const stage=svg.querySelector('[data-viewport]'),view=svg.ownerDocument.defaultView;
  let zoom=1,panX=0,panY=0,press=null;
  const structureFrom=target=>{const g=target?.closest?.('[data-structure]');return g&&svg.contains(g)?g.dataset.structure:null};
  const update=()=>{stage.setAttribute('transform',`translate(${panX} ${panY}) translate(${width/2} ${height/2}) scale(${zoom}) translate(${-width/2} ${-height/2})`);root.querySelector('[data-zoom-value]').textContent=Math.round(zoom*100)+'%';root.querySelector('[data-zoom="out"]').disabled=zoom<=1;root.querySelector('[data-zoom="in"]').disabled=zoom>=2.5};
  const controls=e=>{const b=e.target.closest?.('[data-zoom]');if(!b||b.disabled)return;if(b.dataset.zoom==='reset'){zoom=1;panX=panY=0}else zoom=clamp(zoom+(b.dataset.zoom==='in'?0.25:-0.25),1,2.5);update()};
  const click=e=>{if(!view.PointerEvent||e.detail===0){const id=structureFrom(e.target);if(id)onSelect(id)}};
  const key=e=>{const id=structureFrom(e.target);if(id&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onSelect(id);return}if(!['+','=','-','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='+'||e.key==='=')zoom=clamp(zoom+0.25,1,2.5);if(e.key==='-')zoom=clamp(zoom-0.25,1,2.5);if(e.key==='ArrowLeft')panX+=20;if(e.key==='ArrowRight')panX-=20;if(e.key==='ArrowUp')panY+=20;if(e.key==='ArrowDown')panY-=20;update()};
  const down=e=>{if(press||e.isPrimary===false||e.button!==undefined&&e.button!==0)return;press={pointerId:e.pointerId,x:e.clientX,y:e.clientY,px:panX,py:panY,id:structureFrom(svg.ownerDocument.elementFromPoint?.(e.clientX,e.clientY)||e.target),moved:false}};
  const move=e=>{if(!press||e.pointerId!==press.pointerId)return;const dx=e.clientX-press.x,dy=e.clientY-press.y;if(!press.moved&&Math.hypot(dx,dy)>6){press.moved=true;try{svg.setPointerCapture?.(e.pointerId)}catch{}}if(!press.moved)return;const r=svg.getBoundingClientRect(),scale=Math.min(r.width/width||1,r.height/height||1);panX=clamp(press.px+dx/scale,-width,width);panY=clamp(press.py+dy/scale,-height,height);update()};
  const release=pointerId=>{try{if(svg.hasPointerCapture?.(pointerId))svg.releasePointerCapture(pointerId)}catch{}};
  const up=e=>{if(!press||e.pointerId!==press.pointerId)return;const completed=press;press=null;release(e.pointerId);if(!completed.moved&&completed.id&&svg.contains(e.target))onSelect(completed.id)};
  const cancel=e=>{if(!press||e.pointerId!==press.pointerId)return;press=null;release(e.pointerId)};
  root.addEventListener('click',controls);svg.addEventListener('click',click);svg.addEventListener('keydown',key);svg.addEventListener('pointerdown',down);svg.addEventListener('pointermove',move);svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',cancel);view.addEventListener('pointerup',up);view.addEventListener('pointercancel',cancel);update();
  return ()=>{if(press)release(press.pointerId);press=null;root.removeEventListener('click',controls);svg.removeEventListener('click',click);svg.removeEventListener('keydown',key);svg.removeEventListener('pointerdown',down);svg.removeEventListener('pointermove',move);svg.removeEventListener('pointerup',up);svg.removeEventListener('pointercancel',cancel);view.removeEventListener('pointerup',up);view.removeEventListener('pointercancel',cancel)};
}
export const zoomToolbar=()=>`<div class="zoom-toolbar" role="group" aria-label="Zoom da visualização"><button data-zoom="out" aria-label="Afastar">−</button><output data-zoom-value aria-live="polite">100%</output><button data-zoom="in" aria-label="Aproximar">+</button><button data-zoom="reset">Centralizar</button></div>`;
