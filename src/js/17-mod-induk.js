/* ---------- Mod Induk: PIN-locked analysis for parents and OT ---------- */
const VAL = {gembira:2, tenang:2, penat:1, risau:0, marah:0};
const ZON = {gembira:T('Zon Hijau'), tenang:T('Zon Hijau'), penat:T('Zon Biru'), risau:T('Zon Kuning'), marah:T('Zon Merah')};
const STL = {kuat:T('Kekuatan'), kembang:T('Sedang berkembang'), perlu:T('Perlu perhatian'), data:T('Data belum cukup'), pantau:T('Dipantau')};
const JNAMA = [T('lengkung mudah'),T('bentuk S'),'zig-zag'];
function allRecs(){ try { const a = JSON.parse(store.get('ka.sesi','[]')); return Array.isArray(a) ? a : []; } catch(e) { return []; } }
async function hashPin(p){
  const s = 'kampung-atuk:' + p;
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join(''); }
  catch(e) { let h = 5381; for (const ch of s) h = ((h<<5)+h+ch.charCodeAt(0))|0; return 'd'+h; }
}
let pinStage = 'open', resetArm = false, delArm = false, mName = '';
function msgPin(t, bad){ const m = $('pinMsg'); m.textContent = t; m.classList.toggle('bad', !!bad); }
function openPin(){
  hideOverlays(); state = 'menu'; playing = false;
  const has = !!store.get('ka.pin','');
  pinStage = has ? 'open' : 'new';
  $('pinT').textContent = has ? T('Mod Induk') : T('Tetapkan PIN Mod Induk');
  $('pinP').textContent = has ? T('Untuk ibu bapa dan OT sahaja. Masukkan PIN.') : T('Pilih PIN 4 hingga 6 digit. PIN ini diperlukan setiap kali membuka analisis.');
  $('pin2Row').hidden = has; $('pinReset').hidden = !has;
  $('pinIn').value = ''; $('pin2').value = ''; msgPin('', false);
  resetArm = false; $('pinReset').textContent = T('Lupa PIN?');
  $('pin').hidden = false; setTimeout(()=>{ try { $('pinIn').focus(); } catch(e) {} }, 60);
}
async function submitPin(){
  const p = $('pinIn').value.trim();
  if (!/^\d{4,6}$/.test(p)) return msgPin(T('PIN mesti 4 hingga 6 digit nombor.'), true);
  if (pinStage === 'new'){
    if (p !== $('pin2').value.trim()) return msgPin(T('PIN tidak sama. Cuba lagi.'), true);
    store.set('ka.pin', await hashPin(p)); openMaster(); return;
  }
  const lock = +store.get('ka.pinLock', 0);
  if (Date.now() < lock){ msgPin(T('Terlalu banyak cubaan. Cuba lagi selepas ') + Math.ceil((lock - Date.now())/1000) + T(' saat.'), true); return; }
  if (await hashPin(p) === store.get('ka.pin','')){ store.set('ka.pinFail', 0); store.set('ka.pinLocks', 0); openMaster(); return; }
  const fails = +store.get('ka.pinFail', 0) + 1;
  $('pinIn').value = '';
  if (fails >= 5){
    const n = +store.get('ka.pinLocks', 0) + 1, wait = Math.min(30*Math.pow(2, n-1), 3600);
    store.set('ka.pinLocks', n); store.set('ka.pinFail', 0); store.set('ka.pinLock', Date.now() + wait*1000);
    msgPin(T('Terlalu banyak cubaan. Cuba lagi selepas ') + wait + T(' saat.'), true);
  } else { store.set('ka.pinFail', fails); msgPin(T('PIN salah.'), true); }
}
$('pinForm').addEventListener('submit', e=>{ e.preventDefault(); submitPin(); });
$('pinCancel').addEventListener('click', ()=>{ hideOverlays(); $('start').hidden = false; });
$('pinReset').addEventListener('click', ()=>{
  if (!resetArm){ resetArm = true; $('pinReset').textContent = T('Tekan lagi: padam SEMUA rekod dan PIN'); msgPin(T('Tanpa PIN, satu-satunya cara ialah memadam semua rekod dalam peranti ini.'), true); return; }
  const keep = allRecs().map(r=>r.nama||'');
  store.set('ka.sesi','[]'); store.set('ka.pin',''); store.set('ka.consent','{}');
  [...new Set(keep)].forEach(n=>{ try { localStorage.removeItem('ka.nota.'+n); } catch(e) {} });
  openPin(); msgPin(T('Semua rekod dipadam. Tetapkan PIN baru.'), false);
});
$('masterBtn').addEventListener('click', ()=>{ unlockAudio(); openPin(); });

const avg = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;
function trendNote(rs, unit){
  if (rs.length < 4) return '';
  const a = avg(rs.slice(0,2).map(r=>+r.acc||0)), b = avg(rs.slice(-2).map(r=>+r.acc||0));
  if (b - a >= 10) return T('Ketepatan meningkat daripada ') + Math.round(a) + T('% kepada ') + Math.round(b) + T('% sejak sesi awal') + unit + '.';
  if (a - b >= 10) return T('Ketepatan menurun daripada ') + Math.round(a) + T('% kepada ') + Math.round(b) + T('%. Semak faktor seperti keletihan, masa sesi atau tahap yang terlalu tinggi.');
  return '';
}
function domain(id, nama, rangka, rs){
  const recent = rs.slice(-3), acc = Math.round(avg(recent.map(r=>+r.acc||0))), maxT = recent.length ? Math.max(...recent.map(r=>+r.tahap||1)) : 0;
  const st = rs.length < 2 ? 'data' : acc >= 85 && maxT >= 2 ? 'kuat' : acc >= 65 ? 'kembang' : 'perlu';
  return {id, nama, rangka, n:rs.length, acc, maxT, st, series:rs.slice(-10).map(r=>+r.acc||0), metrics:[], notes:[], tips:[]};
}
function analyse(name){
  const recs = allRecs().filter(r=>(r.nama||'') === name).reverse();
  const by = m => recs.filter(r=>r.mod === m), out = [];

  { const rs = by('warna'), d = domain('vp',T('Persepsi visual'),T('OTPF-4 kemahiran proses (Attends, Chooses) · selari dengan konstruk persepsi visual Beery VMI'), rs), r3 = rs.slice(-3);
    if (rs.length){
      const sal = avg(r3.map(r=>+r.salah||0)), per = avg(r3.map(r=>(+r.s||0)/Math.max(1, +r.n || LEVELS[(+r.tahap||1)-1].target)));
      d.metrics = [[d.acc+'%',T('Ketepatan, 3 sesi terakhir')],[T('Tahap ')+d.maxT,T('Tahap tertinggi')],[sal.toFixed(1),T('Purata sentuhan salah')],[per.toFixed(1)+' s',T('Purata masa setiap buah')]];
      if (sal >= 3) d.notes.push(T('Kerap menyentuh buah warna pengalih. Pertimbangkan saringan persepsi visual (diskriminasi warna, figure-ground) dan semakan penglihatan warna.'));
      if (d.st === 'kuat') d.notes.push(T('Diskriminasi warna stabil walaupun dengan banyak pengalih.'));
      const tn = trendNote(rs, ''); if (tn) d.notes.push(tn);
    }
    d.tips = [T('Isih barang harian ikut warna dan bentuk (stokin, blok, butang).'),T('Permainan cari objek dalam gambar yang sesak.'),T('Padan kad gambar yang hampir serupa.')];
    out.push(d); }

  { const rs = by('arahan'), d = domain('wm',T('Memori kerja dan ikut arahan'),T('Fungsi eksekutif: memori kerja · OTPF-4 kemahiran proses (Heeds, Sequences)'), rs), r3 = rs.slice(-3);
    if (rs.length){
      const seq = avg(r3.map(r=>+r.urutan||0)), col = avg(r3.map(r=>+r.warnaSalah||0)), ul = avg(r3.map(r=>+r.ulang||0));
      d.metrics = [[d.acc+'%',T('Ketepatan, 3 sesi terakhir')],[T('Tahap ')+d.maxT,d.maxT >= 2 ? T('Tertinggi (arahan disorok)') : T('Tertinggi (arahan nampak)')],[seq.toFixed(1),T('Purata salah urutan')],[col.toFixed(1),T('Purata salah warna')],[ul.toFixed(1),T('Purata minta ulang')]];
      if (seq > col && seq >= 1) d.notes.push(T('Salah urutan lebih kerap daripada salah warna: kesukaran utama pada mengekalkan urutan dalam memori kerja, bukan pengecaman warna.'));
      if (col > seq && col >= 1) d.notes.push(T('Salah warna lebih kerap daripada salah urutan: semak perhatian terhadap arahan dan diskriminasi warna.'));
      if (ul >= 2) d.notes.push(T('Kerap meminta arahan diulang. Pertimbangkan sokongan visual seperti kad arahan bergambar, dan semak pemprosesan auditori.'));
      const t1 = rs.filter(r=>+r.tahap === 1), t2 = rs.filter(r=>+r.tahap >= 2);
      if (t1.length && t2.length){ const a = avg(t1.map(r=>+r.acc)), b = avg(t2.map(r=>+r.acc)); if (a - b >= 20) d.notes.push(T('Prestasi menurun apabila arahan disorok (') + Math.round(a) + T('% kepada ') + Math.round(b) + T('%): beban memori kerja menjadi faktor utama.')); }
      const tn = trendNote(rs, ''); if (tn) d.notes.push(tn);
    }
    d.tips = [T('Beri arahan 2 langkah dalam rutin harian (ambil kasut, lepas tu letak di rak).'),T('Minta anak ulang semula arahan dengan suara sendiri sebelum bertindak.'),T('Permainan "Simon kata" dengan dua atau tiga langkah.')];
    out.push(d); }

  { const rs = by('siram'), d = domain('inh',T('Kawalan motor bergred dan inhibisi'),T('OTPF-4 kemahiran motor (Calibrates) dan proses (Terminates) · fungsi eksekutif: kawalan inhibisi'), rs), r3 = rs.slice(-3);
    if (rs.length){
      const rate = avg(r3.map(r=>+r.salah||0))/5*100, holds = avg(r3.map(r=>+r.tekan||5))/5;
      d.metrics = [[d.acc+'%',T('Pasu tepat, 3 sesi terakhir')],[T('Tahap ')+d.maxT,T('Tahap tertinggi')],[Math.round(rate)+'%',T('Kadar melimpah')],[holds.toFixed(1),T('Purata tekanan setiap pasu')]];
      if (rate >= 40) d.notes.push(T('Kerap melimpah: corak sukar menghentikan tindakan tepat pada masanya (impulsif). Sesuai dengan aktiviti mula-berhenti.'));
      if (holds >= 2.5 && rate < 20) d.notes.push(T('Banyak tekanan kecil dengan sedikit limpahan: pendekatan berhati-hati. Kawalan baik, tetapi mungkin kurang yakin atau perlukan maklum balas yang lebih jelas.'));
      const tn = trendNote(rs, ''); if (tn) d.notes.push(tn);
    }
    d.tips = [T('Permainan "lampu merah, lampu hijau" dan patung cendana mengikut muzik.'),T('Tuang air ke dalam cawan yang ada garisan sasaran.'),T('Tekan doh atau span dengan kuat dan perlahan bergilir-gilir.')];
    out.push(d); }

  { const rs = by('jejak'), d = domain('vmi',T('Integrasi visual-motor'),T('Selari dengan konstruk integrasi visual-motor Beery VMI · kesediaan menulis'), rs), r3 = rs.slice(-3);
    if (rs.length){
      const offs = avg(r3.map(r=>+r.salah||0))/TRIALS, per = avg(r3.map(r=>+r.s||0))/TRIALS;
      d.metrics = [[d.acc+'%',T('Ketepatan dalam jejak')],[T('Tahap ')+d.maxT, JNAMA[d.maxT-1] || ''],[offs.toFixed(1),T('Purata terkeluar setiap laluan')],[per.toFixed(0)+' s',T('Purata masa setiap laluan')]];
      if (offs >= 2 && d.maxT <= 1) d.notes.push(T('Kerap terkeluar jejak walaupun pada lengkung mudah. Pertimbangkan penilaian formal integrasi visual-motor (contohnya Beery VMI) dan pemerhatian genggaman pensel.'));
      if (d.st === 'kuat' && d.maxT === 3) d.notes.push(T('Mampu mengikut laluan zig-zag dengan tepat: asas yang baik untuk membentuk huruf bersudut.'));
      const tn = trendNote(rs, ''); if (tn) d.notes.push(tn);
    }
    d.tips = [T('Lukis bentuk dengan jari di dulang pasir atau garam.'),T('Ikut garisan tebal dengan krayon, kemudian labirin mudah dan sambung titik.'),T('Uli dan gulung plastisin untuk menguatkan tangan.')];
    out.push(d); }

  { const rs = by('rama'), d = domain('eh',T('Penjejakan visual dan koordinasi mata-tangan'),T('OTPF-4 kemahiran motor (Reaches, Coordinates) · koordinasi mata-tangan · kawalan inhibisi (lebah)'), rs), r3 = rs.slice(-3);
    if (rs.length){
      const rt = avg(r3.map(r=>+r.rt||0))/1000, luput = avg(r3.map(r=>+r.luput||0)), lebah = avg(r3.map(r=>+r.lebah||0));
      d.metrics = [[d.acc+'%',T('Ketepatan ketikan, 3 sesi terakhir')],[T('Tahap ')+d.maxT,T('Tahap tertinggi')],[rt.toFixed(1)+' s',T('Purata masa menangkap')],[luput.toFixed(1),T('Purata ketikan tersasar')]];
      if (d.maxT >= 3) d.metrics.push([lebah.toFixed(1),T('Purata tersentuh lebah')]);
      if (rt > 3) d.notes.push(T('Masa menangkap agak perlahan. Perhatikan penjejakan mata (mata mengikut objek bergerak) dan kelajuan memulakan gerakan tangan.'));
      if (luput >= 5) d.notes.push(T('Banyak ketikan tersasar: mungkin sukar menganggar kedudukan sasaran bergerak. Cuba tahap lebih perlahan dengan sasaran lebih besar.'));
      if (lebah >= 1.5) d.notes.push(T('Kerap menyentuh lebah: tindak balas impulsif terhadap objek bergerak. Gabungkan dengan latihan mula-berhenti.'));
      const tn = trendNote(rs, ''); if (tn) d.notes.push(tn);
    }
    d.tips = [T('Tiup dan tangkap buih sabun.'),T('Baling dan sambut bola lembut atau belon.'),T('Ikut cahaya lampu suluh yang bergerak di dinding dengan jari.')];
    out.push(d); }

  { const rs = by('perasaan'), d = domain('reg',T('Regulasi emosi'),T('Selari dengan konsep The Zones of Regulation (semak masuk dan keluar)'), rs);
    d.st = rs.length < 2 ? 'data' : 'pantau'; d.series = rs.slice(-10).map(r=>(VAL[r.masuk] ?? 1)*50);
    if (rs.length){
      const neg = rs.filter(r=>VAL[r.masuk] === 0).length, tired = rs.filter(r=>r.masuk === 'penat').length;
      const better = rs.filter(r=>(VAL[r.keluar] ?? 1) > (VAL[r.masuk] ?? 1)).length, worse = rs.filter(r=>(VAL[r.keluar] ?? 1) < (VAL[r.masuk] ?? 1)).length;
      const cnt = {}; rs.forEach(r=>cnt[r.masuk] = (cnt[r.masuk]||0)+1);
      const top = Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];
      d.metrics = [[rs.length,T('Sesi semak masuk')],[feelName(top),T('Perasaan masuk paling kerap')],[better+' / '+rs.length,T('Lebih baik selepas main')],[worse+' / '+rs.length,T('Menurun selepas main')]];
      if (rs.length >= 2 && neg/rs.length >= .5){ d.st = 'perlu'; d.notes.push(T('Separuh atau lebih sesi bermula dengan perasaan risau atau marah (Zon Kuning atau Merah). Bincang pencetus dengan ibu bapa dan rancang strategi menenangkan sebelum aktiviti.')); }
      if (rs.length >= 2 && tired/rs.length >= .5) d.notes.push(T('Kerap penat (Zon Biru) di awal sesi: semak tidur, waktu sesi dan tahap kewaspadaan.'));
      if (rs.length >= 2 && better/rs.length >= .5) d.notes.push(T('Perasaan selalunya bertambah baik selepas bermain: aktiviti ini mungkin membantu murid beralih ke Zon Hijau.'));
      const rehat = recs.filter(r=>r.mod === 'rehat').length; d.metrics.push([rehat, T('Kali guna pondok rehat')]);
      if (rehat >= 3) d.notes.push(T('Kerap menggunakan pondok rehat: murid sedang mengamalkan strategi bertenang.'));
      const last = rs[rs.length-1]; d.notes.push(T('Sesi terakhir: ') + feelName(last.masuk) + ' (' + (ZON[last.masuk]||'-') + T(') kepada ') + feelName(last.keluar) + ' (' + (ZON[last.keluar]||'-') + ').');
    }
    d.tips = [T('Semak perasaan setiap pagi dengan kad muka atau warna.'),T('Latihan tiup belon: tarik nafas 4 kiraan, hembus perlahan.'),T('Sediakan sudut tenang dengan bantal dan barang sensori.')];
    out.push(d); }

  { const rs = recs.filter(r=>r.mod !== 'perasaan' && r.mod !== 'rehat'), d = domain('eng',T('Penglibatan dan ketahanan tugasan'),T('OTPF-4 kemahiran proses (Paces, Attends) · penglibatan dalam aktiviti'), rs);
    d.st = rs.length < 3 ? 'data' : 'pantau'; d.series = [];
    if (rs.length){
      const days = new Set(rs.map(r=>r.d)).size, mins = avg(rs.map(r=>+r.s||0))/60, cnt = {};
      rs.forEach(r=>cnt[r.mod] = (cnt[r.mod]||0)+1);
      const fav = Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];
      d.metrics = [[rs.length,T('Aktiviti dimainkan')],[days,T('Hari bermain')],[mins.toFixed(1)+' min',T('Purata masa setiap aktiviti')],[LABEL[fav]||fav,T('Aktiviti paling kerap')]];
      const never = ['warna','arahan','siram','jejak','rama'].filter(m=>!cnt[m]).map(m=>LABEL[m]);
      if (never.length) d.notes.push(T('Belum dicuba: ') + never.join(', ') + '.');
      if (mins > 8) d.notes.push(T('Purata aktiviti melebihi 8 minit. Pertimbangkan tahap lebih rendah atau sesi lebih pendek untuk mengekalkan perhatian.'));
    }
    d.tips = [T('Sesi pendek 10 hingga 15 minit dengan jadual visual.'),T('Puji usaha secara spesifik ("Bagus, kamu berhenti tepat pada garisan!").')];
    out.push(d); }
  return out;
}
function spark(series){
  if (series.length < 2) return '';
  const W = 120, H = 34, pts = series.map((v,i)=>(i/(series.length-1)*W).toFixed(1)+','+(H-3-(v/100)*(H-6)).toFixed(1)).join(' ');
  return '<svg class="spk" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><polyline points="'+pts+'"/></svg>';
}
function openMaster(){
  hideOverlays(); state = 'master'; playing = false; delArm = false;
  const names = [...new Set(allRecs().map(r=>r.nama||''))], cur = $('nama').value.trim();
  mName = names.includes(cur) ? cur : (names.length ? names[0] : cur);
  $('mSel').innerHTML = names.length ? names.map(n=>'<option value="'+esc(n)+'"'+(n===mName?' selected':'')+'>'+esc(n||T('(tanpa nama)'))+'</option>').join('') : T('<option value="">Tiada rekod lagi</option>');
  $('mSet').hidden = true; $('mOut').hidden = true; $('mMsg').textContent = ''; $('dataBox').hidden = true; $('impGo').hidden = true; $('mDel').textContent = T('Tarik balik persetujuan dan padam rekod');
  setAmb(); renderMaster(); $('master').hidden = false;
}
function renderMaster(){
  const A = analyse(mName), recs = allRecs().filter(r=>(r.nama||'') === mName);
  const cl = consentLine(mName);
  $('mSum').textContent = (recs.length ? (mName || T('(tanpa nama)')) + ' · ' + recs.length + T(' rekod · ') + recs[recs.length-1].d + T(' hingga ') + recs[0].d : T('Belum ada rekod. Main beberapa sesi dengan nama murid dimasukkan dahulu.')) + (mName ? T(' · Persetujuan: ') + (cl || T('tiada atau tamat tempoh')) : '') + (recs.some(r=>(r.v||'') !== GAME_VER) ? T(' · Ada rekod dari versi lain') : '');
  $('mDom').innerHTML = A.map(d=>'<article class="dom"><div class="dh"><h3>'+d.nama+'</h3><span class="pill '+d.st+'">'+STL[d.st]+'</span></div><p class="rk">'+d.rangka+'</p>' +
    (d.metrics.length ? '<dl>'+d.metrics.map(([v,l])=>'<div><dt>'+esc(l)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>' : T('<p class="rk">Belum dimainkan.</p>')) +
    spark(d.series) + (d.notes.length ? '<ul>'+d.notes.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul>' : '') + '</article>').join('');
  const focus = A.filter(d=>d.st === 'perlu' || d.st === 'kembang');
  const list = focus.length ? focus : A.filter(d=>d.n);
  $('mTips').innerHTML = list.length ? list.map(d=>'<li><b>'+d.nama+':</b> '+d.tips.map(esc).join(' ')+'</li>').join('') : T('<li>Main beberapa sesi dahulu untuk mendapat cadangan.</li>');
  $('mNote').value = store.get('ka.nota.'+mName, '');
}
function reportText(){
  const A = analyse(mName), recs = allRecs().filter(r=>(r.nama||'') === mName);
  const vers = [...new Set(recs.map(r=>r.v || T('sebelum 0.9.0')))];
  const L = [T('LAPORAN PEMERHATIAN: KAMPUNG ATUK'), T('Versi permainan dalam rekod: ') + vers.join(', '), T('Nama: ') + (mName || T('(tanpa nama)')), T('Persetujuan penjaga: ') + (consentLine(mName) || T('tiada atau tamat tempoh')), recs.length ? T('Tempoh: ') + recs[recs.length-1].d + T(' hingga ') + recs[0].d + ' (' + recs.length + T(' rekod)') : T('Tiada rekod'), ''];
  A.forEach(d=>{
    L.push(d.nama.toUpperCase() + ': ' + STL[d.st]); L.push(T('Rangka: ') + d.rangka);
    d.metrics.forEach(([v,l])=>L.push('  - ' + l + ': ' + v));
    d.notes.forEach(n=>L.push('  * ' + n)); L.push('');
  });
  const focus = A.filter(d=>d.st === 'perlu' || d.st === 'kembang');
  if (focus.length){ L.push(T('CADANGAN AKTIVITI')); focus.forEach(d=>L.push('  - ' + d.nama + ': ' + d.tips.join(' '))); L.push(''); }
  const note = $('mNote').value.trim(); if (note){ L.push(T('CATATAN OT / IBU BAPA')); L.push(note); L.push(''); }
  L.push(T('Penafian: dijana daripada data permainan, bukan ujian piawai. Untuk pemerhatian dan pemantauan sahaja; keputusan klinikal oleh jurupulih carakerja bertauliah.'));
  return L.join('\n');
}
$('mSel').addEventListener('change', e=>{ mName = e.target.value; delArm = false; $('mDel').textContent = T('Tarik balik persetujuan dan padam rekod'); renderMaster(); });
$('mNote').addEventListener('input', ()=>store.set('ka.nota.'+mName, $('mNote').value));
$('mCopy').addEventListener('click', async ()=>{
  const txt = reportText();
  try { await navigator.clipboard.writeText(txt); $('mMsg').textContent = T('Laporan disalin. Tampal ke nota klinikal atau mesej.'); $('mOut').hidden = true; }
  catch(e) { $('mOut').value = txt; $('mOut').hidden = false; $('mOut').select(); $('mMsg').textContent = T('Salin teks laporan di bawah secara manual.'); }
});
$('mSetBtn').addEventListener('click', ()=>{ $('mSet').hidden = !$('mSet').hidden; });
$('mClose').addEventListener('click', ()=>{ hideOverlays(); state = 'menu'; $('start').hidden = false; });
$('pinChange').addEventListener('click', ()=>{ store.set('ka.pin',''); openPin(); });
$('mDel').addEventListener('click', ()=>{
  if (!delArm){ delArm = true; $('mDel').textContent = T('Tekan lagi untuk sahkan padam'); return; }
  store.set('ka.sesi', JSON.stringify(allRecs().filter(r=>(r.nama||'') !== mName)));
  try { localStorage.removeItem('ka.nota.'+mName); } catch(e) {}
  const all = consents(); delete all[mName]; store.set('ka.consent', JSON.stringify(all));
  if ($('nama').value.trim() === mName) recording = false;
  updConsentStatus(); openMaster(); $('mMsg').textContent = T('Persetujuan ditarik balik dan rekod dipadam.');
});
$('ambBtn').addEventListener('click', ()=>{ unlockAudio(); amb.on = !amb.on; setAmb(); });
$('ambBtn2').addEventListener('click', ()=>{ unlockAudio(); amb.on = !amb.on; setAmb(); });
$('ambVol').addEventListener('input', e=>{ amb.vol = +e.target.value; setAmb(); });
setAmb();

/* colour-blind-friendly mode: Okabe-Ito colours + fruit names in every instruction */
function setCb(){ $('cbBtn').textContent = cbMode ? T('Hidup') : T('Mati'); $('cbBtn').setAttribute('aria-pressed', cbMode); try { localStorage.setItem('ka.cb', cbMode ? '1' : '0'); } catch(e) {} }
$('cbBtn').addEventListener('click', ()=>{ cbMode = !cbMode; setCb(); });
setCb();

/* backup: export / import all records, consents and notes on this device (PDPA data portability) */
function exportData(){
  const notes = {};
  try { for (let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); if (k && k.startsWith('ka.nota.')) notes[k.slice(8)] = localStorage.getItem(k); } } catch(e) {}
  return JSON.stringify({app:'kampung-atuk', v:GAME_VER, dieksport:new Date().toISOString(), sesi:allRecs(), persetujuan:consents(), nota:notes}, null, 1);
}
$('expBtn').addEventListener('click', ()=>{
  const txt = exportData(), box = $('dataBox');
  box.value = txt; box.hidden = false; box.readOnly = true; $('impGo').hidden = true;
  let saved = false;
  try {
    const a = document.createElement('a'), url = URL.createObjectURL(new Blob([txt], {type:'application/json'}));
    a.href = url; a.download = 'kampung-atuk-sandaran-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 4000); saved = true;
  } catch(e) {}
  $('mMsg').textContent = (saved ? T('Fail sandaran dimuat turun jika pelayar membenarkan. ') : '') + T('Teks sandaran juga dipaparkan di bawah: salin dan simpan di tempat selamat. Ia mengandungi data peribadi sensitif murid.');
  try { box.select(); } catch(e) {}
});
const IMPORT_MAX = 2000, IMPORT_BYTES = 5*1024*1024, BAD_KEYS = new Set(['__proto__','constructor','prototype']);
const MODS = new Set(['warna','arahan','siram','jejak','rama','rehat','perasaan']), FEEL_IDS = new Set(['gembira','tenang','penat','risau','marah']);
const cleanStr = (v, n) => typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, '').slice(0, n) : '';
const cleanNum = (v, lo, hi) => { const x = Number(v); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : 0; };
function cleanRec(r){
  if (!r || typeof r !== 'object' || !MODS.has(r.mod)) return null;
  const o = {mod:r.mod, nama:cleanStr(r.nama, 40), d:cleanStr(r.d, 20), ts:cleanNum(r.ts, 0, Date.now() + 864e5), v:cleanStr(r.v, 12)};
  if (r.mod === 'perasaan'){ o.masuk = FEEL_IDS.has(r.masuk) ? r.masuk : ''; o.keluar = FEEL_IDS.has(r.keluar) ? r.keluar : ''; return o; }
  ['tahap','tahapMula','tahapAkhir'].forEach(k=>{ if (r[k] !== undefined) o[k] = cleanNum(r[k], 1, 3); });
  o.s = cleanNum(r.s, 0, 36000); o.acc = cleanNum(r.acc, 0, 100); o.salah = cleanNum(r.salah, 0, 9999);
  ['urutan','warnaSalah','ulang','n','tekan','pasu','dalam','luar','laluan','luput','lebah','rt','kitaran','naik','turun'].forEach(k=>{ if (r[k] !== undefined) o[k] = cleanNum(r[k], 0, 1e7); });
  if (typeof r.warna === 'string') o.warna = cleanStr(r.warna, 20);
  if (['pendek','sederhana','panjang'].includes(r.tempoh)) o.tempoh = r.tempoh;
  if (r.cb) o.cb = 1;
  return o;
}
function cleanConsent(c){
  if (!c || typeof c !== 'object') return null;
  const ts = cleanNum(c.ts, 0, Date.now() + 864e5);
  if (!ts || c.versi !== CONSENT_VER) return null;
  return {penjaga:cleanStr(c.penjaga, 40), hubungan:['Ibu','Bapa','Penjaga sah'].includes(c.hubungan) ? c.hubungan : '', tarikh:cleanStr(c.tarikh, 20), ts, versi:CONSENT_VER};
}
function mergeData(txt){
  let d;
  if (typeof txt !== 'string' || txt.length > IMPORT_BYTES){ $('mMsg').textContent = T('Fail terlalu besar untuk diimport.'); return; }
  try { d = JSON.parse(txt); } catch(e) { $('mMsg').textContent = T('Teks bukan data sandaran yang sah.'); return; }
  if (!d || d.app !== 'kampung-atuk' || !Array.isArray(d.sesi)){ $('mMsg').textContent = T('Fail ini bukan sandaran Kampung Atuk.'); return; }
  const cur = allRecs(), key = r => [r.nama||'', r.ts||'', r.mod||'', r.d||''].join('|'), have = new Set(cur.map(key));
  const add = d.sesi.slice(0, IMPORT_MAX).map(cleanRec).filter(r=>r && !have.has(key(r)));
  const all = cur.concat(add).sort((a,b)=>(+b.ts||0)-(+a.ts||0)).slice(0, IMPORT_MAX);
  store.set('ka.sesi', JSON.stringify(all));
  const cons = consents(); let nc = 0;
  if (d.persetujuan && typeof d.persetujuan === 'object') for (const [n0,c0] of Object.entries(d.persetujuan)){
    const n = cleanStr(n0, 40), c = cleanConsent(c0);
    if (!n || BAD_KEYS.has(n) || !c) continue;
    const own = Object.prototype.hasOwnProperty.call(cons, n) ? cons[n] : null;
    if (!own || c.ts > (+own.ts||0)){ cons[n] = c; nc++; }
  }
  store.set('ka.consent', JSON.stringify(cons));
  let nn = 0;
  if (d.nota && typeof d.nota === 'object') for (const [n0,t] of Object.entries(d.nota)){ const n = cleanStr(n0, 40); if (n && !BAD_KEYS.has(n) && typeof t === 'string' && !store.get('ka.nota.'+n,'')){ store.set('ka.nota.'+n, t.slice(0, 4000)); nn++; } }
  updConsentStatus(); openMaster(); $('mSet').hidden = false;
  $('mMsg').textContent = T('Digabungkan: ') + add.length + T(' rekod baru, ') + nc + T(' persetujuan, ') + nn + T(' catatan. Rekod sedia ada tidak diubah.');
}
$('impFile').addEventListener('change', e=>{
  const f = e.target.files && e.target.files[0]; if (!f) return;
  if (f.size > IMPORT_BYTES){ $('mMsg').textContent = T('Fail terlalu besar untuk diimport.'); e.target.value = ''; return; }
  const r = new FileReader(); r.onload = ()=>mergeData(String(r.result)); r.readAsText(f); e.target.value = '';
});
$('impPaste').addEventListener('click', ()=>{ const box = $('dataBox'); box.readOnly = false; box.value = ''; box.hidden = false; $('impGo').hidden = false; box.focus(); $('mMsg').textContent = T('Tampal teks sandaran, kemudian tekan Gabungkan.'); });
$('impGo').addEventListener('click', ()=>mergeData($('dataBox').value));
