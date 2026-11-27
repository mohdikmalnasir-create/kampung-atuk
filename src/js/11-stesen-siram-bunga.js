/* ---------- station 2: siram bunga (graded hold and release) ---------- */
const SI = {pots:5, speed:[.16,.24,.34], w:[.24,.15,.10]};
let si = {};
const POT_TOP = 126, POT_H = 128;
function startSiram(){
  state = 'siram'; playing = false;
  adReset();
  si = {pot:0, ok:0, over:0, holds:0, t0:performance.now(), level:0, pour:false, busy:false, res:[], dripT:0, total:nR('siram')};
  $('siram').hidden = false; newPot();
}
function newPot(){
  const w = SI.w[level.n-1];
  si.level = 0; si.lo = .45 + Math.random()*(.9 - w - .45); si.hi = si.lo + w; si.busy = false; si.pour = false;
  $('flower').classList.remove('on');
  msgSi(T('Pasu ') + (si.pot+1) + ' / ' + si.total + T(': tahan, lepas di jalur hijau.'), false);
  drawSi();
}
function msgSi(t, bad){ const m = $('siMsg'); m.textContent = t; m.classList.toggle('bad', !!bad); }
function drawSi(){
  const y = l => POT_TOP + POT_H - l*POT_H;
  const wy = y(Math.min(si.level, 1.05));
  $('water').setAttribute('y', wy); $('water').setAttribute('height', Math.max(0, 260 - wy));
  $('band').setAttribute('y', y(si.hi)); $('band').setAttribute('height', (si.hi-si.lo)*POT_H);
  ['bandTop','bandBot'].forEach((id,i)=>{ const yy = y(i ? si.lo : si.hi); $(id).setAttribute('y1', yy); $(id).setAttribute('y2', yy); });
  $('can').setAttribute('transform', si.pour ? 'rotate(28 60 57)' : '');
  const st = $('stream');
  if (si.pour){ st.setAttribute('y', 66); st.setAttribute('height', Math.max(0, wy - 66)); } else st.setAttribute('height', 0);
  $('siHold').classList.toggle('on', si.pour);
  $('siPots').innerHTML = Array.from({length:si.total}, (_,i)=>'<i class="'+(si.res[i]||'')+'"></i>').join('');
}
function siDown(e){
  if (state !== 'siram' || si.busy || si.pour) return;
  if (e && e.pointerId !== undefined) try { $('siHold').setPointerCapture(e.pointerId); } catch(err) {}
  unlockAudio(); si.pour = true; si.holds++; drawSi();
}
function siUp(){
  if (state !== 'siram' || !si.pour) return;
  si.pour = false; drawSi();
  if (si.busy) return;
  if (si.level >= si.lo){
    si.busy = true; si.ok++; si.res[si.pot] = 'ok'; sfx.ok(); $('flower').classList.add('on');
    msgSi([T('Cantik!'),T('Tepat sekali!'),T('Bunga dah kembang!')][si.ok % 3], false); drawSi(); adapt(true);
    setTimeout(nextPot, 1400);
  } else msgSi(T('Sikit lagi. Tekan semula.'), false);
}
function siOverflow(){
  si.pour = false; si.busy = true; si.over++; si.res[si.pot] = 'x'; si.level = 1.05; sfx.no();
  msgSi(T('Melimpah! Cuba lepas lebih awal.'), true); drawSi(); adapt(false);
  setTimeout(nextPot, 1500);
}
function nextPot(){
  if (state !== 'siram') return;
  si.pot++;
  if (si.pot >= si.total) return finishSiram();
  newPot();
}
function finishSiram(){
  const secs = (performance.now()-si.t0)/1000, acc = Math.round(si.ok/si.total*100);
  lastErrs = si.over;
  const rec = Object.assign({mod:'siram', s:Math.round(secs), salah:si.over, acc, tekan:si.holds, pasu:si.total}, adRec());
  stationDone(rec, si.over === 0 ? T('Semua bunga kembang') : T('Bunga dah disiram'),
    watak.nama + T(' siram ') + si.total + T(' pasu, tahap tertinggi ') + ad.max + '.',
    [[Math.round(secs)+' s',T('Masa')],[si.ok+' / '+si.total,T('Pasu tepat')],[si.over,T('Melimpah')],[(si.holds/si.total).toFixed(1),T('Purata tekanan setiap pasu')]]);
}
$('siHold').addEventListener('pointerdown', siDown);
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>$('siHold').addEventListener(ev, siUp));
$('siHold').addEventListener('contextmenu', e=>e.preventDefault());
addEventListener('keydown', e=>{ if (state === 'siram' && e.code === 'Space'){ e.preventDefault(); if (!e.repeat) siDown(); } });
addEventListener('keyup', e=>{ if (state === 'siram' && e.code === 'Space'){ e.preventDefault(); siUp(); } });
