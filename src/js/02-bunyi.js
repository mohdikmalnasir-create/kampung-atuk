/* ---------- sound, generated in code ---------- */
let ac = null;
function tone(f, t0, dur, type='sine', vol=.18){
  if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0;
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t+.015); g.gain.exponentialRampToValueAtTime(.001, t+dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t+dur+.05);
}
const sfx = {
  ok(){ tone(660,0,.15,'triangle'); tone(990,.08,.22,'triangle'); },
  no(){ tone(220,0,.18,'square',.07); tone(180,.1,.2,'square',.06); },
  win(){ [523,659,784,1047].forEach((f,i)=>tone(f,i*.12,.35,'triangle')); },
  step(){ tone(140+Math.random()*30,0,.05,'sine',.04); },
  drip(){ tone(380+Math.random()*260,0,.06,'sine',.05); },
  ding(){ tone(880,0,.25,'sine',.12); }
};
function unlockAudio(){ try { ac = ac || new (window.AudioContext||window.webkitAudioContext)(); ac.resume(); startAmbient(); } catch(e) {} }
