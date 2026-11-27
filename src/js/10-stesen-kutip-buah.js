/* ---------- station 1: kutip buah ---------- */
let plan = [], stepIdx = 0, stepGot = 0, trial = 0, seqErr = 0, colErr = 0, replays = 0, hideAt = Infinity, hiddenPlan = false, between = false;
function shuffle(a){ for (let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
function planText(){
  if (LANG === 'en'){
    const q = plan.map(s=>WORDS[s.n] + ' ' + L(s.key) + (cbMode ? (s.n > 1 ? 's' : '') : (s.n > 1 ? ' fruits' : ' fruit')));
    return 'Collect ' + q[0] + ', then ' + q[1] + (q[2] ? ', and finally ' + q[2] : '') + '.';
  }
  const p = plan.map(s=>WORDS[s.n] + (cbMode ? ' ' : ' buah ') + L(s.key));
  return T('Kutip ') + p[0] + ', lepas tu ' + p[1] + (p[2] ? ', akhir sekali ' + p[2] : '') + '.';
}
function newTrial(){
  if (!playing || state !== 'buah') return;
  const A = level.ar; clearFruits(); between = false;
  plan = shuffle(A.cols.slice()).slice(0, A.steps).map(key=>({key, n:1+Math.floor(Math.random()*A.maxN)}));
  plan.forEach(s=>{ for (let i=0;i<s.n+2;i++) addFruit(s.key); });
  const others = A.cols.filter(k=>!plan.some(s=>s.key===k)), pool = others.length ? others : plan.map(s=>s.key);
  for (let i=0;i<A.distract;i++) addFruit(pool[i%pool.length]);
  stepIdx = 0; stepGot = 0; hiddenPlan = false; hideAt = performance.now() + A.show;
  renderSteps(); speak(planText());
}
function renderSteps(){
  $('dot').style.display = 'none';
  $('goal').textContent = T('Arahan ') + Math.min(trial+1, TRIALS) + ' / ' + TRIALS;
  $('prog').innerHTML = '<span class="steps">' + plan.map((s,i)=>{
    const done = i < stepIdx, now = i === stepIdx, show = !hiddenPlan || done;
    const cnt = now ? stepGot + '/' + s.n : s.n;
    return '<span class="sp'+(done?' done':'')+(now?' now':'')+'"><i style="background:'+(show?CSS(s.key):'#c9cfc6')+'"></i>'+(show ? cnt + ' ' + L(s.key) : (i+1) + '. ?')+'</span>';
  }).join('<span class="arr">'+(LANG === 'en' ? 'then' : 'lepas tu')+'</span>') + '</span>';
}
function pickArahan(f){
  const cur = plan[stepIdx];
  if (f.key === cur.key){
    f.pop = .001; got++; stepGot++; sfx.ok();
    if (stepGot >= cur.n){ stepIdx++; stepGot = 0; }
    if (stepIdx >= plan.length){
      between = true; trial++; renderSteps(); sfx.ding();
      if (trial >= TRIALS) setTimeout(()=>{ if (playing && state === 'buah') finishBuah(); }, 600);
      else { toast(T('Bagus! Arahan seterusnya...')); speak(T('Bagus!')); setTimeout(newTrial, 1600); }
    } else renderSteps();
    return;
  }
  f.cool = true; f.shake = .5; wrong++; sfx.no();
  if (plan.slice(stepIdx+1).some(s=>s.key===f.key)){ seqErr++; toast(hiddenPlan ? T('Belum lagi. Ingat urutan!') : T('Ikut urutan: ') + L(cur.key) + T(' dulu!')); }
  else { colErr++; toast(hiddenPlan ? T('Itu tiada dalam arahan.') : T('Itu ') + L(f.key) + T('. Tiada dalam arahan.')); }
}
function startRound(){
  clearFruits(); hideOverlays();
  state = 'buah'; playing = true; dest = null; showStationsInWorld(false);
  got = 0; wrong = 0; seqErr = 0; colErr = 0; replays = 0; trial = 0; t0 = performance.now();
  $('stop').textContent = T('Berhenti');
  if (mode === 'arahan'){ newTrial(); return; }
  plan = [];
  goalKey = level.cols[Math.floor(Math.random()*level.cols.length)];
  const others = level.cols.filter(k=>k!==goalKey);
  for (let i=0;i<level.target;i++) addFruit(goalKey);
  for (let i=0;i<level.distract;i++) addFruit(others[i%others.length]);
  $('dot').style.display = ''; $('dot').style.background = CSS(goalKey);
  $('goal').textContent = T('Kutip ') + L(goalKey);
  updProg(); say();
}
function updProg(){ $('prog').textContent = got + ' / ' + level.target + T(' dalam bakul'); }
function say(){
  if (state === 'buah' && mode === 'arahan' && plan.length) speak(planText());
  else if (state === 'buah') speak(cbMode ? T('Jom, kutip ') + L(goalKey) + '.' : T('Jom, kutip buah warna ') + COLORS[goalKey].nama + '.');
  else speak(T('Jalan ke bulatan kuning untuk mula main.'));
}
function finishBuah(){
  playing = false;
  const secs = (performance.now()-t0)/1000, acc = Math.round(got/(got+wrong)*100), ar = mode === 'arahan';
  lastErrs = wrong;
  const rec = {mod:mode, tahap:level.n, warna:ar ? '' : COLORS[goalKey].nama, s:Math.round(secs), salah:wrong, acc, urutan:seqErr, warnaSalah:ar ? colErr : wrong, ulang:replays, n:ar ? got : level.target};
  const stats = ar
    ? [[Math.round(secs)+' s',T('Masa')],[acc+'%',T('Ketepatan')],[seqErr,T('Salah urutan')],[colErr,T('Salah warna')],[replays,T('Minta ulang arahan')],[(secs/TRIALS).toFixed(0)+' s',T('Purata setiap arahan')]]
    : [[Math.round(secs)+' s',T('Masa')],[got,T('Kutipan betul')],[wrong,T('Sentuhan salah')],[acc+'%',T('Ketepatan')],[(secs/got).toFixed(1)+' s',T('Purata setiap buah')]];
  stationDone(rec, wrong === 0 ? T('Tepat semua') : T('Bakul penuh'),
    ar ? watak.nama + T(' siap ') + TRIALS + T(' arahan di tahap ') + level.n + ' (' + level.ar.sub + ').' : watak.nama + T(' kutip ') + (cbMode ? L(goalKey) : LANG === 'en' ? COLORS[goalKey].nama + ' fruit' : 'buah ' + COLORS[goalKey].nama) + T(' di tahap ') + level.n + '.', stats);
}
