/* ---------- station 3: jejak ayam (visual-motor tracing) ---------- */
const JJ = {tol:[46,34,26], N:240};
let jj = {};
const jsvg = $('jjSvg');
function pathPt(n, t, s){
  if (n === 1) return [90+620*t, 300 - 150*t + 70*s*Math.sin(Math.PI*t)];
  if (n === 2) return [90+620*t, 225 + 120*s*Math.sin(2*Math.PI*t)];
  return [90+620*t, 225 + 125*s*Math.sin(3*Math.PI*t)];
}
function startJejak(){
  state = 'jejak'; playing = false;
  jj = {trial:0, t0:performance.now(), inside:0, out:0, offs:0};
  $('jejak').hidden = false; newPath();
}
function newPath(){
  const s = Math.random() < .5 ? 1 : -1;
  jj.pts = Array.from({length:JJ.N}, (_,i)=>pathPt(level.n, i/(JJ.N-1), s));
  jj.tol = JJ.tol[level.n-1]; jj.prog = 0; jj.tr = false; jj.off = false; jj.busy = false;
  drawJejak();
  msgJj(T('Laluan ') + (jj.trial+1) + ' / ' + TRIALS + T(': letak jari di bulatan kuning.'), false);
}
function msgJj(t, bad){ const m = $('jjMsg'); m.textContent = t; m.classList.toggle('bad', !!bad); }
function drawJejak(){
  const P = jj.pts, N = P.length, d = 'M' + P.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');
  let feet = '';
  for (let i=8;i<N-8;i+=14){
    const [x,y] = P[i], [x2,y2] = P[i+1], a = Math.atan2(y2-y, x2-x)*180/Math.PI;
    feet += '<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+(a+90).toFixed(1)+') translate('+((i/14)%2 ? 7 : -7)+' 0)"><path d="M0 7 L0 -3 M0 -1 L-6 -8 M0 -1 L6 -8 M0 -1 L0 -9"/></g>';
  }
  const [hx,hy] = P[0], [nx,ny] = P[N-1];
  jsvg.innerHTML =
    '<path class="cor" id="cor" d="'+d+'" stroke-width="'+(jj.tol*2)+'"/>' +
    '<g class="feet">'+feet+'</g>' +
    '<polyline class="donep" id="jjDone" points=""/>' +
    '<g transform="translate('+(hx-46)+' '+(hy-6)+')"><ellipse cx="0" cy="0" rx="26" ry="20" fill="#fff8ec" stroke="#d8c6a8" stroke-width="2"/><path d="M-24 -6 L-38 -16 L-34 2 Z" fill="#e9dcc4"/><circle cx="18" cy="-18" r="11" fill="#fff8ec" stroke="#d8c6a8" stroke-width="2"/><path d="M12 -30 Q16 -38 20 -30 Q24 -38 27 -28 Z" fill="#e0362c"/><path d="M28 -18 L38 -15 L28 -12 Z" fill="#ffb020"/><circle cx="21" cy="-20" r="2.5" fill="#1a1410"/><path d="M-6 18 L-6 28 M6 18 L6 28" stroke="#ffb020" stroke-width="3"/></g>' +
    '<g transform="translate('+(nx+44)+' '+(ny+4)+')"><ellipse cx="0" cy="6" rx="38" ry="15" fill="#a0703a"/><path d="M-36 2 Q0 -6 36 2" stroke="#c9954a" stroke-width="4" fill="none"/><ellipse cx="-12" cy="-2" rx="9" ry="12" fill="#fff6e4"/><ellipse cx="4" cy="-5" rx="9" ry="12" fill="#fff6e4"/><ellipse cx="18" cy="-1" rx="9" ry="12" fill="#fff6e4"/></g>' +
    '<circle class="cur" id="jjCur" r="16"/>';
  updJj();
}
function updJj(){
  const P = jj.pts;
  $('jjDone').setAttribute('points', P.slice(0, jj.prog+1).map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '));
  const c = P[jj.prog]; $('jjCur').setAttribute('cx', c[0]); $('jjCur').setAttribute('cy', c[1]);
}
function toSvg(e){ const pt = jsvg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(jsvg.getScreenCTM().inverse()); }
jsvg.addEventListener('pointerdown', e=>{
  if (state !== 'jejak' || jj.busy) return;
  unlockAudio();
  const p = toSvg(e), c = jj.pts[jj.prog];
  if (Math.hypot(p.x-c[0], p.y-c[1]) > Math.max(jj.tol*1.3, 40)){ msgJj(T('Mula dari bulatan kuning.'), true); return; }
  jj.tr = true; try { jsvg.setPointerCapture(e.pointerId); } catch(err) {}
  msgJj(T('Bagus, teruskan ikut tapak kaki.'), false);
});
jsvg.addEventListener('pointermove', e=>{
  if (!jj.tr || jj.busy) return;
  const p = toSvg(e), P = jj.pts;
  let best = -1, bd = 1e9;
  for (let i=Math.max(0,jj.prog-6); i<Math.min(P.length, jj.prog+18); i++){ const d = Math.hypot(p.x-P[i][0], p.y-P[i][1]); if (d < bd){ bd = d; best = i; } }
  if (bd <= jj.tol){
    jj.inside++;
    if (jj.off){ jj.off = false; $('cor').classList.remove('bad'); msgJj(T('Bagus, teruskan.'), false); }
    if (best > jj.prog){ jj.prog = best; updJj(); if (jj.prog % 20 === 0) sfx.step(); }
    if (jj.prog >= P.length-4) donePath();
  } else {
    jj.out++;
    if (!jj.off){ jj.off = true; jj.offs++; sfx.no(); $('cor').classList.add('bad'); msgJj(T('Terkeluar jejak. Balik ke bulatan kuning.'), true); }
  }
});
['pointerup','pointercancel'].forEach(ev=>jsvg.addEventListener(ev, ()=>{ jj.tr = false; }));
function donePath(){
  jj.busy = true; jj.tr = false; jj.trial++; sfx.ok(); sfx.ding();
  msgJj(T('Ibu ayam jumpa sarang!'), false); speak(T('Bagus! Ibu ayam jumpa sarang.'));
  setTimeout(()=>{ if (state !== 'jejak') return; if (jj.trial >= TRIALS) finishJejak(); else newPath(); }, 1500);
}
function finishJejak(){
  const secs = (performance.now()-jj.t0)/1000, acc = Math.round(jj.inside/Math.max(1, jj.inside+jj.out)*100);
  lastErrs = jj.offs;
  const rec = {mod:'jejak', tahap:level.n, s:Math.round(secs), salah:jj.offs, acc, dalam:jj.inside, luar:jj.out};
  stationDone(rec, jj.offs === 0 ? T('Jejak sempurna') : T('Semua sarang dijumpai'),
    watak.nama + T(' ikut ') + TRIALS + T(' jejak di tahap ') + level.n + ' (' + STATIONS[2].subs[level.n-1].toLowerCase() + ').',
    [[Math.round(secs)+' s',T('Masa')],[acc+'%',T('Ketepatan dalam jejak')],[jj.offs,T('Kali terkeluar')],[(secs/TRIALS).toFixed(0)+' s',T('Purata setiap laluan')]]);
}
