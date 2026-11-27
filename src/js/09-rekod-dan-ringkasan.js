/* ---------- history and summaries ---------- */
function saveRec(rec){
  if (!recording) return [];
  let all = [];
  try { all = JSON.parse(store.get('ka.sesi','[]')); if (!Array.isArray(all)) all = []; } catch(e) {}
  rec.nama = $('nama').value.trim(); rec.ts = Date.now(); rec.v = GAME_VER; if (cbMode) rec.cb = 1; rec.d = new Date().toLocaleDateString('ms-MY',{day:'numeric',month:'short'});
  all.unshift(rec); all = all.slice(0,80);
  store.set('ka.sesi', JSON.stringify(all));
  return all.filter(h=>(h.nama||'') === rec.nama);
}
const LABEL = {warna:T('cari warna'), arahan:T('ikut arahan'), siram:T('siram bunga'), jejak:T('jejak ayam'), rama:T('tangkap rama-rama'), rehat:T('pondok rehat')};
const feelName = id => (FEELS.find(f=>f.id===id)||{nama:'-'}).nama;
function histRow(h){
  if (h.mod === 'rehat') return [h.d + ' · ' + LABEL.rehat, h.s + ' s · ' + (h.kitaran||0) + T(' kitaran')];
  if (h.mod === 'perasaan') return [T('Perasaan ') + feelName(h.masuk) + ' → ' + feelName(h.keluar), h.d];
  return [h.d + ' · T' + h.tahap + ' ' + (LABEL[h.mod] || h.warna || ''), h.s + ' s · ' + h.acc + '%' + (h.salah ? ' · ' + h.salah + T(' salah') : '')];
}
function showEnd({title, para, stats, listTitle, rows, again=true, menuLabel=T('Balik ke kampung'), kind='station'}){
  playing = false; endKind = kind; hideOverlays();
  $('endT').textContent = title; $('endP').textContent = para;
  $('stats').innerHTML = stats.map(([b,s])=>'<div><b>'+esc(b)+'</b><span>'+esc(s)+'</span></div>').join('');
  $('hist').innerHTML = '<li><span>'+esc(listTitle)+'</span><span></span></li>' + rows.map(([a,b])=>'<li><span>'+esc(a)+'</span><span>'+esc(b)+'</span></li>').join('');
  $('again').hidden = !again;
  $('again').textContent = level.n < 3 && lastErrs <= 1 ? T('Cuba tahap ') + (level.n+1) : T('Main lagi');
  $('menu').textContent = menuLabel;
  $('end').hidden = false;
}
function stationDone(rec, title, para, stats){
  sfx.win();
  const nm = $('nama').value.trim();
  setTimeout(()=>speak(T('Syabas') + (nm ? ', ' + nm : '') + '!'), 700);
  day.done.add(station.id); day.acts.push([station.nama + (rec.mod === 'rehat' ? '' : ' T' + (rec.tahap || level.n)), rec.mod === 'rehat' ? (rec.kitaran + T(' kitaran')) : rec.acc + '%']);
  const mm = missionDone(station.id, rec);
  if (mm){ setTimeout(()=>{ toast(mm); if (day.hadiah && mm.indexOf(day.hadiahNama || '§') >= 0) speak(mm); }, 1800); }
  const hist = saveRec(rec).slice(0,5);
  if (rec.naik || rec.turun) para += ' ' + T('Tahap: ') + rec.tahapMula + ' → ' + rec.tahapAkhir + '.';
  if (mm) para += ' ' + mm;
  showEnd({title: title + (nm ? ', ' + nm + '!' : '!'), para, stats, listTitle: recording ? T('Sesi lepas') + (nm ? ' · ' + nm : '') : T('Rekod tidak disimpan (tiada persetujuan)'), rows:hist.map(histRow)});
}
