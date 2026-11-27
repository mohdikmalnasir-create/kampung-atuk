/* ---------- kampung soundscape, generated in code ---------- */
const amb = {on: store.get('ka.amb','1') === '1', vol: Math.min(1, Math.max(0, +store.get('ka.ambvol','0.6'))), started:false, gain:null, nextBird:0, nextRooster:0, nextCluck:0};
function startAmbient(){
  if (!ac || amb.started) return;
  amb.started = true;
  amb.gain = ac.createGain(); amb.gain.gain.value = amb.on ? amb.vol*.6 : 0; amb.gain.connect(ac.destination);
  const buf = ac.createBuffer(1, ac.sampleRate*2, ac.sampleRate), d = buf.getChannelData(0);
  for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
  const loop = () => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
  // angin: low-passed noise that swells slowly
  const wf = ac.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 420;
  const wg = ac.createGain(); wg.gain.value = .12;
  const wl = ac.createOscillator(); wl.frequency.value = .07; const wlg = ac.createGain(); wlg.gain.value = .08; wl.connect(wlg).connect(wg.gain); wl.start();
  loop().connect(wf).connect(wg).connect(amb.gain);
  // cengkerik: narrow band noise, pulsed, fading in and out
  const cf = ac.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 4800; cf.Q.value = 12;
  const cg = ac.createGain(); cg.gain.value = 0;
  const tr = ac.createOscillator(); tr.type = 'square'; tr.frequency.value = 28; const tg = ac.createGain(); tg.gain.value = .05; tr.connect(tg).connect(cg.gain); tr.start();
  const sl = ac.createOscillator(); sl.frequency.value = .12; const sg = ac.createGain(); sg.gain.value = .04; sl.connect(sg).connect(cg.gain); sl.start();
  loop().connect(cf).connect(cg).connect(amb.gain);
  const n = performance.now(); amb.nextBird = n + 1500; amb.nextRooster = n + 9000; amb.nextCluck = n + 2000;
}
function ambOut(){ if (ac.createStereoPanner){ const p = ac.createStereoPanner(); p.pan.value = Math.random()*1.6-.8; p.connect(amb.gain); return p; } return amb.gain; }
function bird(){
  const out = ambOut(), base = 2200 + Math.random()*1800, n = 2 + Math.floor(Math.random()*4), t0 = ac.currentTime;
  for (let i=0;i<n;i++){
    const o = ac.createOscillator(), g = ac.createGain(), t = t0 + i*(.09+Math.random()*.05);
    o.frequency.setValueAtTime(base, t); o.frequency.exponentialRampToValueAtTime(base*(1.3+Math.random()*.4), t+.06); o.frequency.exponentialRampToValueAtTime(base*.9, t+.1);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.06, t+.01); g.gain.exponentialRampToValueAtTime(.001, t+.11);
    o.connect(g).connect(out); o.start(t); o.stop(t+.13);
  }
}
function rooster(){
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 2; f.connect(ambOut());
  [[560,.12],[700,.12],[640,.14],[820,.6]].reduce((t,[fr,dur],i)=>{
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(fr, t);
    if (i === 3){ o.frequency.linearRampToValueAtTime(fr*1.08, t+.15); o.frequency.exponentialRampToValueAtTime(fr*.6, t+dur); }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t+.02); g.gain.setValueAtTime(.05, t+dur-.05); g.gain.exponentialRampToValueAtTime(.001, t+dur);
    o.connect(g).connect(f); o.start(t); o.stop(t+dur+.02); return t + dur + .03;
  }, ac.currentTime + .05);
}
function cluck(){
  const out = ambOut(), t0 = ac.currentTime, k = 2 + Math.floor(Math.random()*3);
  for (let i=0;i<k;i++){
    const t = t0 + i*.13, o = ac.createOscillator(), g = ac.createGain(); o.type = 'square';
    o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(260, t+.07);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.025, t+.01); g.gain.exponentialRampToValueAtTime(.001, t+.08);
    o.connect(g).connect(out); o.start(t); o.stop(t+.1);
  }
}
function ambTick(){
  if (!amb.started || !amb.on || !amb.vol) return;
  const n = performance.now();
  if (n > amb.nextBird){ bird(); amb.nextBird = n + 2500 + Math.random()*6000; }
  if (n > amb.nextRooster){ rooster(); amb.nextRooster = n + 45000 + Math.random()*40000; }
  if (n > amb.nextCluck){ if (player && Math.hypot(player.position.x-8, player.position.z-7.5) < 7) cluck(); amb.nextCluck = n + 1500 + Math.random()*3000; }
}
function setAmb(){
  store.set('ka.amb', amb.on ? '1' : '0'); store.set('ka.ambvol', amb.vol);
  if (amb.gain) amb.gain.gain.setTargetAtTime(amb.on ? amb.vol*.6 : 0, ac.currentTime, .3);
  ['ambBtn','ambBtn2'].forEach(id=>{ $(id).textContent = amb.on ? T('Hidup') : T('Mati'); $(id).setAttribute('aria-pressed', amb.on); });
  $('ambVol').value = amb.vol;
}
