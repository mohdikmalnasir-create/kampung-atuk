/* ---------- input ---------- */
let down = false;
function pick(e){
  const r = canvas.getBoundingClientRect();
  ptr.set((e.clientX-r.left)/r.width*2-1, -(e.clientY-r.top)/r.height*2+1);
  ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObject(ground)[0];
  if (hit){ const p = hit.point; const d = Math.hypot(p.x,p.z); if (d > R-.8){ p.x *= (R-.8)/d; p.z *= (R-.8)/d; } dest = {x:p.x, z:p.z}; marker.position.set(p.x,.05,p.z); marker.visible = true; }
}
canvas.addEventListener('pointerdown', e=>{ if (!playing) return; down = true; try { canvas.setPointerCapture(e.pointerId); } catch(err) {} pick(e); });
canvas.addEventListener('pointermove', e=>{ if (down && playing) pick(e); });
const up = ()=>{ down = false; };
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
addEventListener('keydown', e=>{ if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return; keys[e.key.toLowerCase()] = true; if (e.key.startsWith('Arrow') && playing) e.preventDefault(); });
addEventListener('keyup', e=>{ keys[e.key.toLowerCase()] = false; });
