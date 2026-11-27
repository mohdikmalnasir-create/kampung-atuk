/* ---------- menus ---------- */
function drawChars(){
  $('chars').innerHTML = CHARS.map(c=>'<button class="ch" type="button" data-id="'+c.id+'" aria-pressed="'+(c===watak)+'">'+(THUMB[c.id] ? '<img alt="" src="'+THUMB[c.id]+'">' : '')+c.nama+'<small>'+c.baju+'</small></button>').join('');
}
$('chars').addEventListener('click', e=>{
  const b = e.target.closest('.ch'); if (!b) return;
  watak = CHARS.find(c=>c.id === b.dataset.id); setPlayer(watak); store.set('ka.watak', watak.id); drawChars();
});
$('nama').value = store.get('ka.nama','');
$('nama').addEventListener('input', ()=>{ store.set('ka.nama', $('nama').value.trim()); updConsentStatus(); });
$('suara').addEventListener('change', e=>{ voiceName = e.target.value; store.set('ka.suara.' + LANG, voiceName); });
$('cuba').addEventListener('click', ()=>speak(T('Assalamualaikum. Jom tolong Atuk di kampung.')));
['langMs','langEn'].forEach(id=>{
  const b = $(id), mine = id === 'langEn' ? 'en' : 'ms';
  b.setAttribute('aria-pressed', LANG === mine);
  b.addEventListener('click', ()=>{ if (LANG === mine) return; store.set('ka.lang', mine); try { location.reload(); } catch(e) {} });
});
function drawOpts(){
  $('lenSeg').innerHTML = TEMPOH.map(k=>'<button class="lg" type="button" data-len="'+k+'" aria-pressed="'+(k === tempoh)+'">'+TEMPOH_NAMA[k]+'</button>').join('');
  $('adBtn').textContent = adaptif ? T('Hidup') : T('Mati'); $('adBtn').setAttribute('aria-pressed', adaptif);
}
$('lenSeg').addEventListener('click', e=>{ const b = e.target.closest('[data-len]'); if (!b) return; tempoh = b.dataset.len; store.set('ka.tempoh', tempoh); drawOpts(); });
$('adBtn').addEventListener('click', ()=>{ adaptif = !adaptif; store.set('ka.adaptif', adaptif ? '1' : '0'); drawOpts(); });
drawOpts();
