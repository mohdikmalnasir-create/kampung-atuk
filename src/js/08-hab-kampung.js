/* ---------- hub ---------- */
function renderHub(){
  $('dot').style.display = 'none';
  $('goal').textContent = 'Kampung Atuk';
  $('prog').innerHTML = '<span class="steps">' + STATIONS.map(s=>'<span class="sp"><i style="background:'+(day.done.has(s.id)?'#5bbf3a':'#ffc93c')+'"></i>'+s.nama+'</span>').join('') + '</span>';
  $('stop').textContent = T('Balik rumah');
}
function goHub(){
  clearFruits(); plan = []; hideOverlays();
  state = 'hub'; playing = true; dest = null; marker.visible = false;
  showStationsInWorld(true); redrawLabels(); renderHub();
  STATIONS.forEach(st=>{ st.cool = Math.hypot(player.position.x-st.x, player.position.z-st.z) < 2; });
}
function openStation(st){
  station = st; playing = false; dest = null; marker.visible = false;
  level = LEVELS[lvMap[st.id]-1];
  $('stT').textContent = st.nama; $('stP').textContent = st.desc;
  $('stModes').hidden = st.id !== 'buah';
  drawLevels(); $('stc').hidden = false; speak(st.cakap);
}
function drawLevels(){
  $('modes').innerHTML = MODES.map(m=>'<button class="lv" type="button" data-m="'+m.id+'" aria-pressed="'+(m.id===mode)+'">'+m.label+'<small>'+m.sub+'</small></button>').join('');
  $('lvs').innerHTML = LEVELS.map(l=>{
    const sub = station && station.subs ? station.subs[l.n-1] : (mode === 'arahan' ? l.ar.sub : l.sub);
    return '<button class="lv" type="button" data-n="'+l.n+'" aria-pressed="'+(l===level)+'">'+T('Tahap ')+l.n+'<small>'+sub+'</small></button>';
  }).join('');
}
function startStation(){
  hideOverlays();
  if (station.id === 'buah') startRound();
  if (station.id === 'siram') startSiram();
  if (station.id === 'jejak') startJejak();
}
