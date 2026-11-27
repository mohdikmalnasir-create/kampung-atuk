/* ---------- PDPA: parent consent, once per child per notice version ---------- */
const CONSENT_VER = '1.0';
function consents(){ try { const o = JSON.parse(store.get('ka.consent','{}')); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch(e) { return {}; } }
function consentFor(n){ const c = consents()[n]; if (!c || c.versi !== CONSENT_VER || Date.now() - (+c.ts||0) > 365*864e5) return null; return c; }
function consentLine(n){ const c = consentFor(n); return c ? c.penjaga + ' (' + c.hubungan + '), ' + c.tarikh : ''; }
function updConsentStatus(){
  const n = $('nama').value.trim(), el = $('cst'), c = consentFor(n);
  if (!n){ el.textContent = T('Tanpa nama, permainan tidak menyimpan rekod.'); return; }
  el.innerHTML = c ? T('Persetujuan: <b>') + esc(consentLine(n)) + T('</b>. Tarik balik dalam Mod Induk.') : T('Tiada persetujuan lagi. Ibu bapa akan diminta setuju sebelum rekod disimpan.');
}
function beginDay(){
  hideOverlays(); day = {masuk:'', keluar:'', done:new Set(), acts:[], misi:todayMisi($('nama').value.trim()), hadiah:false};
  loadKebun();
  player.position.set(0,0,0); player.rotation.y = 0; redrawLabels(); askFeeling('masuk');
  if (!recording) setTimeout(()=>toast(T('Mod tanpa rekod: keputusan tidak disimpan')), 400);
}
function cnValid(){ $('cnYes').disabled = !($('cnChk').checked && $('cnName').value.trim().length >= 2); }
$('cnChk').addEventListener('change', cnValid);
$('cnName').addEventListener('input', cnValid);
$('cnYes').addEventListener('click', ()=>{
  const n = $('nama').value.trim(), all = consents();
  all[n] = {penjaga:$('cnName').value.trim(), hubungan:$('cnRel').value, tarikh:new Date().toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'}), ts:Date.now(), versi:CONSENT_VER};
  store.set('ka.consent', JSON.stringify(all)); recording = true; updConsentStatus(); beginDay();
});
$('cnNo').addEventListener('click', ()=>{ recording = false; beginDay(); });
$('go').addEventListener('click', ()=>{
  unlockAudio();
  const n = $('nama').value.trim();
  if (!n){ recording = false; beginDay(); return; }
  if (consentFor(n)){ recording = true; beginDay(); return; }
  hideOverlays(); $('cnFor').textContent = T('Sebelum rekod ') + n + T(' disimpan, ibu bapa atau penjaga perlu membaca notis ini dan memberi persetujuan.');
  $('cnChk').checked = false; $('cnName').value = ''; cnValid(); $('consent').hidden = false;
});
$('modes').addEventListener('click', e=>{ const b = e.target.closest('.lv'); if (!b) return; mode = b.dataset.m; store.set('ka.mod', mode); drawLevels(); });
$('lvs').addEventListener('click', e=>{ const b = e.target.closest('.lv'); if (!b) return; level = LEVELS[b.dataset.n-1]; lvMap[station.id] = level.n; store.set('ka.tahap.'+station.id, level.n); drawLevels(); });
$('stGo').addEventListener('click', ()=>{ unlockAudio(); startStation(); });
$('stNo').addEventListener('click', ()=>{ $('stc').hidden = true; playing = true; });
$('again').addEventListener('click', ()=>{
  unlockAudio();
  if (level.n < 3 && lastErrs <= 1){ level = LEVELS[level.n]; lvMap[station.id] = level.n; store.set('ka.tahap.'+station.id, level.n); }
  startStation();
});
$('menu').addEventListener('click', ()=>{
  if (endKind === 'day'){ hideOverlays(); state = 'menu'; playing = false; showStationsInWorld(true); player.position.set(0,0,0); $('start').hidden = false; return; }
  goHub();
});
$('stop').addEventListener('click', ()=>{
  if (state === 'buah'){ goHub(); return; }
  if (state === 'hub') askFeeling('keluar');
});
$('siQuit').addEventListener('click', ()=>goHub());
$('jjQuit').addEventListener('click', ()=>goHub());
$('say').addEventListener('click', ()=>{ unlockAudio(); if (state === 'buah' && mode === 'arahan') replays++; say(); });
loadVoices(); drawChars(); updConsentStatus();
$('dot').style.display = 'none'; renderHub();
