/* ---------- station 4: tangkap rama-rama (visual tracking, eye-hand coordination; bees test inhibition) ---------- */
const RM = {spd:[80,140,200], r:[46,38,32], max:[1,2,2], bee:[0,0,1]};
const RM_COL = ['#f06aa0','#ffc93c','#4aa8e8','#b38ce0','#ff8a3d'];
let rm = {};
const rsvg = $('rmSvg');
function bfSvg(r, c){
  return '<ellipse cx="'+(-r*.5)+'" cy="'+(-r*.28)+'" rx="'+(r*.55)+'" ry="'+(r*.42)+'" fill="'+c+'" stroke="#00000033"/>' +
    '<ellipse cx="'+(r*.5)+'" cy="'+(-r*.28)+'" rx="'+(r*.55)+'" ry="'+(r*.42)+'" fill="'+c+'" stroke="#00000033"/>' +
    '<ellipse cx="'+(-r*.38)+'" cy="'+(r*.3)+'" rx="'+(r*.36)+'" ry="'+(r*.3)+'" fill="'+c+'" opacity=".85"/>' +
    '<ellipse cx="'+(r*.38)+'" cy="'+(r*.3)+'" rx="'+(r*.36)+'" ry="'+(r*.3)+'" fill="'+c+'" opacity=".85"/>' +
    '<circle cx="'+(-r*.5)+'" cy="'+(-r*.3)+'" r="'+(r*.14)+'" fill="#ffffffaa"/><circle cx="'+(r*.5)+'" cy="'+(-r*.3)+'" r="'+(r*.14)+'" fill="#ffffffaa"/>' +
    '<ellipse cx="0" cy="0" rx="'+(r*.1)+'" ry="'+(r*.55)+'" fill="#2b1d12"/><path d="M0 '+(-r*.5)+' l'+(-r*.25)+' '+(-r*.3)+' M0 '+(-r*.5)+' l'+(r*.25)+' '+(-r*.3)+'" stroke="#2b1d12" stroke-width="2" fill="none"/>';
}
function beeSvg(r){
  return '<ellipse cx="'+(-r*.3)+'" cy="'+(-r*.45)+'" rx="'+(r*.32)+'" ry="'+(r*.22)+'" fill="#e8f4ff" stroke="#9bb" />' +
    '<ellipse cx="'+(r*.3)+'" cy="'+(-r*.45)+'" rx="'+(r*.32)+'" ry="'+(r*.22)+'" fill="#e8f4ff" stroke="#9bb"/>' +
    '<ellipse cx="0" cy="0" rx="'+(r*.6)+'" ry="'+(r*.42)+'" fill="#ffc21a" stroke="#2b1d12" stroke-width="2"/>' +
    '<rect x="'+(-r*.18)+'" y="'+(-r*.4)+'" width="'+(r*.14)+'" height="'+(r*.8)+'" fill="#2b1d12"/><rect x="'+(r*.12)+'" y="'+(-r*.38)+'" width="'+(r*.14)+'" height="'+(r*.76)+'" fill="#2b1d12"/>' +
    '<circle cx="'+(r*.5)+'" cy="'+(-r*.08)+'" r="'+(r*.07)+'" fill="#2b1d12"/>';
}
function startRama(){
  state = 'rama'; playing = false; adReset();
  rm = {caught:0, miss:0, bee:0, total:nR('rama'), t0:performance.now(), slots:[null,null,null], rts:[], win:{c:0,m:0,b:0}, done:false};
  let flowers = '';
  for (let i=0;i<14;i++){ const x = 30 + i*55 + (i%2)*20, y = 405 - (i%3)*14, c = RM_COL[i%RM_COL.length]; flowers += '<path d="M'+x+' 450 L'+x+' '+(y+8)+'" stroke="#3c9446" stroke-width="4"/><circle cx="'+x+'" cy="'+y+'" r="11" fill="'+c+'"/><circle cx="'+x+'" cy="'+y+'" r="4" fill="#fff6c0"/>'; }
  rsvg.innerHTML = '<rect width="800" height="450" fill="#bfe6f5"/><path d="M0 330 Q200 290 400 320 T800 300 V450 H0Z" fill="#8fcd6a"/>' + flowers +
    [0,1,2].map(i=>'<g id="rm'+i+'" transform="translate(-200 -200)"></g>').join('') + '<g id="rmPop"></g>';
  $('rama').hidden = false; fillSlots(); msgRm(T('Ketik rama-rama untuk menangkapnya.'), false);
  speak(T('Tangkap rama-rama yang terbang. Ketik bila kena.'));
}
function msgRm(t, bad){ const m = $('rmMsg'); m.textContent = t + '  ' + rm.caught + ' / ' + rm.total; m.classList.toggle('bad', !!bad); }
function spawnRm(i, kind){
  const L = level.n - 1, r = RM.r[L];
  rm.slots[i] = {kind, x:120 + Math.random()*560, y:70 + Math.random()*230, a:Math.random()*Math.PI*2, born:performance.now(), r, spd:RM.spd[L]*(kind === 'lebah' ? .8 : 1), ph:Math.random()*6};
  $('rm'+i).innerHTML = kind === 'lebah' ? beeSvg(r) : bfSvg(r, RM_COL[Math.floor(Math.random()*RM_COL.length)]);
}
function clearRm(i){ rm.slots[i] = null; $('rm'+i).setAttribute('transform', 'translate(-200 -200)'); $('rm'+i).innerHTML = ''; }
function fillSlots(){
  if (state !== 'rama' || rm.done) return;
  const L = level.n - 1;
  for (let i=0;i<2;i++){ if (i < RM.max[L]){ if (!rm.slots[i]) spawnRm(i, 'rama'); } else if (rm.slots[i]) clearRm(i); }
  if (RM.bee[L]){ if (!rm.slots[2]) spawnRm(2, 'lebah'); } else if (rm.slots[2]) clearRm(2);
}
function ramaTick(t, dt){
  rm.slots.forEach((s,i)=>{
    if (!s) return;
    s.a += Math.sin(t*.9 + s.ph)*1.8*dt;
    s.x += Math.cos(s.a)*s.spd*dt; s.y += Math.sin(s.a)*s.spd*dt*.8;
    if (s.x < 50 || s.x > 750){ s.a = Math.PI - s.a; s.x = Math.max(50, Math.min(750, s.x)); }
    if (s.y < 50 || s.y > 330){ s.a = -s.a; s.y = Math.max(50, Math.min(330, s.y)); }
    const flap = s.kind === 'lebah' ? 1 : .3 + .7*Math.abs(Math.sin(t*12 + s.ph));
    $('rm'+i).setAttribute('transform', 'translate('+s.x.toFixed(1)+' '+s.y.toFixed(1)+') scale('+flap.toFixed(2)+' 1)');
  });
}
function rmPoint(e){ const pt = rsvg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(rsvg.getScreenCTM().inverse()); }
rsvg.addEventListener('pointerdown', e=>{
  if (state !== 'rama' || rm.done) return;
  unlockAudio();
  const p = rmPoint(e);
  let hit = -1, bd = 1e9;
  rm.slots.forEach((s,i)=>{ if (!s) return; const d = Math.hypot(p.x - s.x, p.y - s.y); if (d < s.r*1.25 && d < bd){ bd = d; hit = i; } });
  if (hit < 0){ rm.miss++; rm.win.m++; if (rm.miss % 3 === 1) msgRm(T('Hampir! Cuba lagi.'), false); return; }
  const s = rm.slots[hit];
  if (s.kind === 'lebah'){
    rm.bee++; rm.win.b++; sfx.no(); msgRm(T('Itu lebah! Biarkan lebah terbang.'), true);
    spawnRm(2, 'lebah'); return;
  }
  rm.caught++; rm.win.c++; rm.rts.push(performance.now() - s.born); sfx.ok();
  $('rmPop').innerHTML = '<circle class="pop" cx="'+s.x.toFixed(0)+'" cy="'+s.y.toFixed(0)+'" r="'+s.r+'"/>';
  clearRm(hit);
  if (rm.caught >= rm.total){ rm.done = true; msgRm(T('Semua rama-rama ditangkap!'), false); speak(T('Bagus! Semua rama-rama ditangkap.')); setTimeout(()=>{ if (state === 'rama') finishRama(); }, 900); return; }
  msgRm([T('Dapat!'), T('Cekap!'), T('Bagus!')][rm.caught % 3], false);
  if (rm.win.c >= 4){ const w = rm.win; adapt(w.m <= 1 && w.b === 0 ? true : (w.m >= 4 || w.b >= 1) ? false : null); rm.win = {c:0, m:0, b:0}; }
  setTimeout(fillSlots, 450);
});
function finishRama(){
  const secs = (performance.now() - rm.t0)/1000, tries = rm.caught + rm.miss + rm.bee, acc = Math.round(rm.caught/Math.max(1, tries)*100);
  const rt = rm.rts.length ? rm.rts.reduce((a,b)=>a+b,0)/rm.rts.length/1000 : 0;
  lastErrs = rm.miss > 3 ? 2 : rm.bee;
  const rec = Object.assign({mod:'rama', s:Math.round(secs), salah:rm.miss + rm.bee, acc, luput:rm.miss, lebah:rm.bee, rt:Math.round(rt*1000)}, adRec());
  const stats = [[Math.round(secs)+' s',T('Masa')],[rm.caught,T('Ditangkap')],[acc+'%',T('Ketepatan ketikan')],[rt.toFixed(1)+' s',T('Purata masa menangkap')]];
  if (ad.max >= 3) stats.push([rm.bee, T('Tersentuh lebah')]);
  stationDone(rec, rm.miss + rm.bee === 0 ? T('Tangkapan sempurna') : T('Semua rama-rama ditangkap'),
    watak.nama + T(' tangkap ') + rm.caught + T(' rama-rama, tahap tertinggi ') + ad.max + '.', stats);
}
$('rmQuit').addEventListener('click', ()=>goHub());
