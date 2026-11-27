/* ---------- station 5: pondok rehat (guided balloon breathing for self-regulation) ---------- */
const RH = {masuk:4, tahan:1.5, keluar:5};
let rh = {};
function startRehat(){
  state = 'rehat'; playing = false;
  rh = {t:0, kitaran:0, total:nR('rehat'), fasa:'', t0:performance.now(), done:false};
  $('rehat').hidden = false; $('rhDone').hidden = true;
  $('rhCount').textContent = '0 / ' + rh.total;
  speak(T('Jom rehat sekejap. Ikut belon, tarik nafas dan hembus perlahan.'));
}
function rehatTick(dt){
  if (rh.done) return;
  rh.t += dt;
  const cyc = RH.masuk + RH.tahan + RH.keluar, k = rh.t % cyc, n = Math.floor(rh.t / cyc);
  if (n > rh.kitaran){
    rh.kitaran = n; $('rhCount').textContent = rh.kitaran + ' / ' + rh.total; $('rhDone').hidden = false;
    if (rh.kitaran >= rh.total){ rh.done = true; $('rhCue').textContent = T('Bagus. Badan dah lebih tenang.'); speak(T('Bagus. Badan dah lebih tenang.')); $('blon').setAttribute('r', 60); setTimeout(finishRehat, 2200); return; }
  }
  const fasa = k < RH.masuk ? 'masuk' : k < RH.masuk + RH.tahan ? 'tahan' : 'keluar';
  const r = fasa === 'masuk' ? 50 + 70*(k/RH.masuk) : fasa === 'tahan' ? 120 : 120 - 70*((k - RH.masuk - RH.tahan)/RH.keluar);
  $('blon').setAttribute('r', r.toFixed(1));
  if (fasa !== rh.fasa){
    rh.fasa = fasa;
    const cue = {masuk:T('Tarik nafas...'), tahan:T('Tahan sekejap...'), keluar:T('Hembus perlahan...')}[fasa];
    $('rhCue').textContent = cue;
    if (rh.kitaran < 2 || fasa !== 'tahan') speak(cue);
    if (fasa === 'masuk') tone(392, 0, .6, 'sine', .05);
  }
}
function finishRehat(){
  if (state !== 'rehat') return;
  if (rh.kitaran < 1){ goHub(); return; }
  const secs = (performance.now() - rh.t0)/1000;
  lastErrs = 9; level = LEVELS[0];
  const rec = {mod:'rehat', tahap:1, s:Math.round(secs), salah:0, acc:100, kitaran:rh.kitaran};
  stationDone(rec, T('Rehat yang tenang'), watak.nama + T(' bernafas perlahan sebanyak ') + rh.kitaran + T(' kali.'),
    [[Math.round(secs)+' s',T('Masa')],[rh.kitaran,T('Kitaran nafas')]]);
}
$('rhDone').addEventListener('click', finishRehat);
$('rhQuit').addEventListener('click', ()=>goHub());
