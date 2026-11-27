/* ---------- session length, adaptive difficulty, daily missions and the growing kampung ---------- */
const TEMPOH = ['pendek','sederhana','panjang'];
const TEMPOH_NAMA = {pendek:T('Pendek'), sederhana:T('Sederhana'), panjang:T('Panjang')};
const ROUNDS = {warna:[1,2,3], arahan:[3,5,8], siram:[5,8,12], jejak:[3,5,7], rama:[8,14,20], rehat:[3,5,6]};
let tempoh = TEMPOH.includes(store.get('ka.tempoh','')) ? store.get('ka.tempoh','') : 'sederhana';
let adaptif = store.get('ka.adaptif','1') === '1';
const nR = k => ROUNDS[k][TEMPOH.indexOf(tempoh)];

/* adaptive: two clear successes in a row move up a level, two struggles in a row move down */
let ad = {start:1, max:1, ups:0, downs:0, good:0, bad:0};
function adReset(){ ad = {start:level.n, max:level.n, ups:0, downs:0, good:0, bad:0}; }
function setLv(n){ level = LEVELS[n-1]; if (station){ lvMap[station.id] = n; store.set('ka.tahap.'+station.id, n); } }
function adapt(ok){
  if (!adaptif || ok === null) return '';
  let said = '';
  if (ok){ ad.good++; ad.bad = 0; if (ad.good >= 2 && level.n < 3){ setLv(level.n+1); ad.ups++; ad.good = 0; said = T('Hebat! Naik ke tahap ') + level.n + '.'; sfx.ding(); } }
  else { ad.bad++; ad.good = 0; if (ad.bad >= 2 && level.n > 1){ setLv(level.n-1); ad.downs++; ad.bad = 0; said = T('Kita cuba tahap ') + level.n + T(' dulu.'); } }
  ad.max = Math.max(ad.max, level.n);
  if (said) toast(said);
  return said;
}
const adRec = () => ({tahap:ad.max, tahapMula:ad.start, tahapAkhir:level.n, naik:ad.ups, turun:ad.downs, tempoh});

/* daily missions: three activities picked from the child's name and today's date, so the day stays the same if the game is reopened */
const MISI_POOL = [
  {id:'buah-warna', st:'buah', mod:'warna', nama:T('Kutip buah ikut warna')},
  {id:'buah-arahan', st:'buah', mod:'arahan', nama:T('Kutip buah ikut arahan')},
  {id:'siram', st:'siram', nama:T('Siram bunga Nenek')},
  {id:'jejak', st:'jejak', nama:T('Bantu ibu ayam')},
  {id:'rama', st:'rama', nama:T('Tangkap rama-rama')}
];
function seeded(str){ let h = 2166136261; for (const ch of str){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
function todayMisi(nm){
  const r = seeded((nm || '-') + '|' + new Date().toISOString().slice(0,10)), pool = MISI_POOL.slice(), out = [];
  while (out.length < 3){ const i = Math.floor(r()*pool.length); out.push(pool.splice(i,1)[0]); }
  return out.map(m=>Object.assign({done:false}, m));
}
function kebunKey(nm){ return 'ka.kebun.' + (nm || '-'); }
function kebunLevel(nm){ const v = +store.get(kebunKey(nm), 0); return v >= 0 && v <= KEBUN.length ? v : 0; }
let kebunSesi = 0;
function loadKebun(){
  const nm = $('nama').value.trim();
  kebunSesi = recording ? kebunLevel(nm) : 0;
  resetKebun(); showKebun(kebunSesi, false);
}
function missionDone(stId, rec){
  const m = day.misi.find(x=>!x.done && x.st === stId && (!x.mod || x.mod === rec.mod));
  if (!m) return '';
  m.done = true;
  if (day.misi.every(x=>x.done) && !day.hadiah){
    day.hadiah = true;
    if (kebunSesi < KEBUN.length){
      kebunSesi++;
      if (recording) store.set(kebunKey($('nama').value.trim()), kebunSesi);
      day.hadiahNama = KEBUN[kebunSesi-1].nama;
      showKebun(kebunSesi, true);
      return T('Semua misi selesai! Hadiah Atuk: ') + day.hadiahNama + '.';
    }
    return T('Semua misi selesai! Kampung kamu sudah lengkap.');
  }
  return T('Misi selesai: ') + m.nama + ' (' + day.misi.filter(x=>x.done).length + '/3).';
}
