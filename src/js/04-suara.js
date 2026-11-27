/* ---------- voice: prefer a clear Malaysian Malay female voice the device has ---------- */
const FEMALE = /yasmin|amira|gadis|damayanti|female|wanita|perempuan|ms-my-standard-a|ms-my-wavenet-a|ms-my-standard-c/i, MALE = /osman|ardi|rizwan|male|lelaki/i;
const FEMALE_EN = /libby|sonia|jenny|aria|samantha|karen|moira|serena|zira|hazel|susan|female|natasha|clara/i;
function rankVoice(v){
  if (LANG === 'en'){
    let e = /^en[-_](GB|US|AU|IE|NZ|SG|MY)/i.test(v.lang) ? 100 : /^en/i.test(v.lang) ? 90 : -999;
    if (/natural|online|neural|wavenet|google|enhanced|premium/i.test(v.name)) e += 20;
    if (FEMALE_EN.test(v.name)) e += 15;
    return e;
  }
  let s = /^ms[-_]MY/i.test(v.lang) ? 100 : /^ms/i.test(v.lang) ? 90 : /^id/i.test(v.lang) ? 40 : -999;
  if (/natural|online|neural|wavenet|google|enhanced|premium/i.test(v.name)) s += 20;
  if (FEMALE.test(v.name)) s += 15; else if (MALE.test(v.name)) s -= 15;
  return s;
}
let voices = [], voiceName = store.get('ka.suara.' + LANG, '');
function loadVoices(){
  try { voices = speechSynthesis.getVoices().filter(v=>rankVoice(v) > 0).sort((a,b)=>rankVoice(b)-rankVoice(a)); } catch(e) { voices = []; }
  const sel = $('suara');
  if (!voices.length){ sel.innerHTML = T('<option value="">Tiada suara Melayu pada peranti ini</option>'); sel.disabled = true; return; }
  sel.disabled = false;
  if (!voices.some(v=>v.name === voiceName)) voiceName = voices[0].name;
  sel.innerHTML = voices.map(v=>'<option value="'+esc(v.name)+'"'+(v.name===voiceName?' selected':'')+'>'+esc(v.name.replace(/^Microsoft |\s*-.*$/g,''))+' ('+esc(v.lang)+')</option>').join('');
}
try { speechSynthesis.onvoiceschanged = loadVoices; } catch(e) {}
function speak(text){
  try {
    const u = new SpeechSynthesisUtterance(text), v = voices.find(v=>v.name === voiceName) || voices[0];
    if (v){ u.voice = v; u.lang = v.lang; } else u.lang = LANG === 'en' ? 'en-GB' : 'ms-MY';
    u.rate = .88; u.pitch = 1.05;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch(e) {}
}
