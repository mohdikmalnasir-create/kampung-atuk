/* ---------- feelings check-in / check-out ---------- */
let feelMode = 'masuk';
function faceSvg(f){
  const eyes = f.eyes === 'o' ? '<circle cx="-11" cy="-6" r="4.5"/><circle cx="11" cy="-6" r="4.5"/>'
    : f.eyes === 'u' ? '<path d="M-16 -6 Q-11 -11 -6 -6 M6 -6 Q11 -11 16 -6" fill="none" stroke="#1a1410" stroke-width="3.5" stroke-linecap="round"/>'
    : '<path d="M-16 -5 L-6 -5 M6 -5 L16 -5" stroke="#1a1410" stroke-width="3.5" stroke-linecap="round"/>';
  return '<svg viewBox="-40 -40 80 80" aria-hidden="true"><circle r="34" fill="'+f.c+'" stroke="#0002" stroke-width="2"/><g fill="#1a1410">'+eyes+'</g>' +
    (f.brows ? '<path d="'+f.brows+'" stroke="#1a1410" stroke-width="3.5" stroke-linecap="round"/>' : '') +
    '<path d="'+f.mouth+'" fill="none" stroke="#1a1410" stroke-width="3.5" stroke-linecap="round"/></svg>';
}
$('faces').innerHTML = FEELS.map(f=>'<button class="face" type="button" data-f="'+f.id+'">'+faceSvg(f)+f.nama+'</button>').join('');
function askFeeling(m){
  feelMode = m; state = 'feel'; playing = false; hideOverlays();
  const nm = $('nama').value.trim();
  $('feelT').textContent = LANG === 'en' ? (m === 'masuk' ? (nm ? 'How is ' + nm + ' feeling today?' : 'How are you feeling today?') : (nm ? 'After playing, how is ' + nm + ' feeling now?' : 'After playing, how are you feeling now?')) : (m === 'masuk' ? 'Apa perasaan ' + (nm || 'kamu') + ' hari ini?' : 'Lepas main, apa perasaan ' + (nm || 'kamu') + ' sekarang?');
  $('feel').hidden = false;
  speak(m === 'masuk' ? T('Apa perasaan kamu hari ini?') : T('Lepas main, apa perasaan kamu sekarang?'));
}
$('faces').addEventListener('click', e=>{
  const b = e.target.closest('.face'); if (!b) return;
  const f = FEELS.find(x=>x.id === b.dataset.f); sfx.ding();
  if (feelMode === 'masuk'){
    day.masuk = f.id; goHub();
    if (f.id === 'risau' || f.id === 'marah'){ speak(T('Terima kasih kerana memberitahu. Jom singgah di Pondok rehat dulu.')); toast(T('Cuba Pondok rehat dulu, kemudian misi hari ini.')); }
    else speak(T('Terima kasih. Misi hari ini: ') + day.misi.map(m=>m.nama).join(', ') + '.');
    return;
  }
  day.keluar = f.id;
  saveRec({mod:'perasaan', masuk:day.masuk, keluar:day.keluar});
  const nm = $('nama').value.trim();
  speak(T('Terima kasih. Jumpa lagi') + '!');
  state = 'day'; level = LEVELS[0]; lastErrs = 9;
  showEnd({title:T('Jumpa lagi') + (nm ? ', ' + nm : '') + '!', para:T('Ringkasan hari ini di kampung Atuk.'),
    stats:[[feelName(day.masuk),T('Perasaan masuk')],[feelName(day.keluar),T('Perasaan keluar')],[day.misi.filter(m=>m.done).length + ' / 3',T('Misi selesai')],[day.acts.length,T('Aktiviti dimainkan')],[kebunSesi + ' / ' + KEBUN.length,T('Kampung membesar')]].concat(day.hadiahNama ? [[day.hadiahNama,T('Hadiah hari ini')]] : []),
    listTitle:T('Aktiviti hari ini'), rows:day.acts.length ? day.acts : [[T('Tiada aktiviti'),'']], again:false, menuLabel:T('Selesai'), kind:'day'});
});
