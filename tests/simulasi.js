const fs=require('fs');
// Simulasi satu hari permainan. Guna: node tests/simulasi.js [index.html]; LANGX=en untuk BI; REAL3=1 untuk Three.js sebenar.
// Simulates a full day of play. Usage: node tests/simulasi.js [index.html]; LANGX=en for English; REAL3=1 for the real Three.js.
const path=require('path');
const file=process.argv[2]||path.join(__dirname,'..','index.html');
const html=fs.readFileSync(file,'utf8');
const mm=html.match(/window\.kampungAtuk = function\(\)\{\n([\s\S]*?)\n\};\n<\/script>/);
if(!mm) throw new Error('Tidak jumpa kod permainan dalam '+file);
const code=mm[1];
// ---- fake THREE
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}clone(){return new V(this.x,this.y,this.z)}setScalar(s){this.x=this.y=this.z=s;return this}lerp(v,a){this.x+=(v.x-this.x)*a;this.y+=(v.y-this.y)*a;this.z+=(v.z-this.z)*a;return this}}
class Obj{constructor(){this.position=new V();this.rotation=new V();this.scale=new V(1,1,1);this.children=[];this.userData={};this.visible=true}add(...c){this.children.push(...c);return this}remove(c){this.children=this.children.filter(x=>x!==c)}clone(){const o=new this.constructor();o.position.copy(this.position);o.material=this.material;return o}lookAt(){}}
class Mesh extends Obj{constructor(g,m){super();this.material=m||{color:{set(){}}}}}
const geo=()=>class{constructor(){}rotateX(){return this}};
const ctx=new Proxy({},{get:()=>()=>{} ,set:()=>true});
let SCENE=null;class SceneC extends Obj{constructor(){super();if(!SCENE)SCENE=this}}
const THREE_STUB={Scene:SceneC,Vector3:V,Vector2:class{set(){}},Object3D:Obj,Group:Obj,Mesh,Sprite:Mesh,
 PerspectiveCamera:class extends Obj{updateProjectionMatrix(){}},HemisphereLight:Obj,
 DirectionalLight:class extends Obj{constructor(){super();this.shadow={mapSize:{set(){}},camera:{}}}},
 Color:class{set(){}},Fog:class{},WebGLRenderer:class{constructor(){this.shadowMap={};this.domElement={toDataURL:()=>'data:'}}setPixelRatio(){}setSize(){}render(){}dispose(){}forceContextLoss(){}},
 MeshStandardMaterial:class{constructor(o){Object.assign(this,o);this.color={set(){}}}},MeshBasicMaterial:class{constructor(){this.color={set(){}}}},SpriteMaterial:class{},
 CanvasTexture:class{},Raycaster:class{setFromCamera(){}intersectObject(){return []}},
 Clock:class{constructor(){this.elapsedTime=0}getDelta(){this.elapsedTime+=.05;return .05}},DoubleSide:2,PCFSoftShadowMap:1};
['CircleGeometry','RingGeometry','CylinderGeometry','IcosahedronGeometry','BoxGeometry','SphereGeometry','ConeGeometry'].forEach(n=>THREE_STUB[n]=geo());
// REAL3=1: guna Three.js r128 sebenar (vendor/), hanya WebGLRenderer digantikan / use the real Three.js r128, only the renderer is stubbed
let THREE=THREE_STUB;
if(process.env.REAL3){
  const real=require(path.join(__dirname,'..','vendor','three.r128.min.js'));
  class RealScene extends real.Scene{constructor(){super();if(!SCENE)SCENE=this}}
  THREE=Object.assign({},real,{Scene:RealScene,Clock:THREE_STUB.Clock,WebGLRenderer:THREE_STUB.WebGLRenderer,CanvasTexture:class extends real.Texture{constructor(img){super(img)}}});
}
// ---- fake DOM
const els={};const listeners={};
function el(id){ if(!els[id]){ const L=[]; els[id]={id,hidden:false,style:{},dataset:{},_attrs:{},
  classList:{s:new Set(),add(c){this.s.add(c)},remove(c){this.s.delete(c)},toggle(c,on){on?this.s.add(c):this.s.delete(c)},contains(c){return this.s.has(c)}},
  setAttribute(k,v){this._attrs[k]=v},getAttribute(k){return this._attrs[k]},addEventListener(ev,fn){(listeners[id+':'+ev]=listeners[id+':'+ev]||[]).push(fn)},
  setPointerCapture(){},getBoundingClientRect:()=>({left:0,top:0,width:800,height:450}),clientWidth:800,clientHeight:450,
  createSVGPoint(){return {x:0,y:0,matrixTransform(){return {x:this.x,y:this.y}}}},getScreenCTM(){return {inverse(){return {}}}},
  select(){},focus(){},value:'', textContent:'', innerHTML:'', disabled:false, tagName:'DIV'} } return els[id]; }
const winL={};
const document={documentElement:{},body:{querySelectorAll:()=>[]},createTreeWalker:()=>({nextNode:()=>null}),getElementById:el,createElement:()=>({width:0,height:0,getContext:()=>ctx}),fonts:{load:()=>Promise.resolve()}};
const store={};
const sandbox={NodeFilter:{SHOW_TEXT:4},location:{reload(){reloaded=true}},THREE,document,devicePixelRatio:1,localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>store[k]=String(v)},
 speechSynthesis:{getVoices:()=>[{name:'Microsoft Yasmin Online (Natural) - Malay (Malaysia)',lang:'ms-MY'},{name:'Microsoft Osman',lang:'ms-MY'}],cancel(){},speak(u){spoken.push(u.text)}},
 SpeechSynthesisUtterance:class{constructor(t){this.text=t}},ResizeObserver:class{observe(){}},
 requestAnimationFrame:f=>{raf=f},addEventListener:(ev,fn)=>{(winL[ev]=winL[ev]||[]).push(fn)},performance:{now:()=>now},setTimeout:(f,ms)=>{timers.push([now+ms,f])},clearTimeout(){},
 AudioContext:class{constructor(){this.currentTime=0;this.destination={};this.sampleRate=8000}resume(){}createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)}}createBufferSource(){return {connect:x=>x,start(){}}}createBiquadFilter(){return {frequency:{value:0},Q:{value:0},connect:x=>x}}createStereoPanner(){return {pan:{value:0},connect:x=>x}}createOscillator(){return {type:'',frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}},connect:x=>x,start(){},stop(){}}}createGain(){return {gain:{value:0,setTargetAtTime(){},setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect:x=>x}}},
 crypto:globalThis.crypto,TextEncoder,navigator:{clipboard:{writeText:async t=>{clip=t}}},console,Math,JSON,Array,Set,Object,String,Number,Date,Promise,Infinity};
sandbox.window=sandbox;
let clip='';let reloaded=false;if(process.env.LANGX)store['ka.lang']=process.env.LANGX;store['ka.tempoh']='pendek';if(process.env.KEBUN9)store['ka.kebun.Ayu']='9';let raf=null, now=0, timers=[], spoken=[];
// make 'closest' events
function fire(id,ev,e={}){ (listeners[id+':'+ev]||[]).forEach(f=>f(e)); }
function click(id,data){ const target={closest:()=>({dataset:data})}; fire(id,'click',{target}); }
function step(n=1){ for(let i=0;i<n;i++){ now+=50; const due=timers.filter(t=>t[0]<=now); timers=timers.filter(t=>t[0]>now); due.forEach(t=>t[1]()); raf(); } }
const fn=new Function(...Object.keys(sandbox),code);
fn(...Object.values(sandbox));
const log=(...a)=>console.log(...a);
const player=()=>SCENE.children.filter(o=>o.userData&&o.userData.legL).at(-1);
function goTo(x,z){const p=player();p.position.set(x+1.6,0,z);step(3);p.position.set(x,0,z);let k=0;while(el('stc').hidden&&k<5){step();k++}}
// ---- scenario
step(2);
click('go'); log('feel shown', !el('feel').hidden, spoken.at(-1));
click('faces',{f:'penat'}); log('hub', el('goal').textContent, 'feel hidden', el('feel').hidden);
// simulate walking: keyboard to siram station (-6,5): press left+down
const kd=k=>winL.keydown.forEach(f=>f({key:k,target:{tagName:'BODY'},preventDefault(){}})), ku=k=>winL.keyup.forEach(f=>f({key:k}));
kd('ArrowLeft'); kd('ArrowDown'); let k=0; while(el('stc').hidden && k<200){ step(); k++; } ku('ArrowLeft'); ku('ArrowDown');
log('station card', !el('stc').hidden, el('stT').textContent, 'after steps', k);
fire('stGo','click'); log('siram shown', !el('siram').hidden, el('siMsg').textContent);
// play 5 pots: hold until within band then release; make pot 3 overflow
for(let p=0;p<5;p++){
  fire('siHold','pointerdown',{});
  let g=0; const lo=+el('band')._attrs.y; 
  while(g<400){ step(); g++; const wy=+el('water')._attrs.y; const bandBot=+el('bandBot')._attrs.y1; const bandTop=+el('bandTop')._attrs.y1;
    if(p===2){ if(el('siMsg').textContent.startsWith('Melimpah')) break; } else if(wy < (bandTop+bandBot)/2) break; }
  fire('siHold','pointerup',{}); log(' pot',p+1, el('siMsg').textContent); step(40);
}
log('end shown', !el('end').hidden, el('endT').textContent, '|', el('stats').innerHTML.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
log('again label', el('again').textContent);
fire('menu','click'); log('back hub', el('goal').textContent, 'end hidden', el('end').hidden);
// go to jejak station (7,7): right + down
goTo(7,7);
log('station card', el('stT').textContent, k);
fire('stGo','click'); log('jejak shown', !el('jejak').hidden, el('jjMsg').textContent);
// trace path: we need pts: parse polyline? use cor path d
for(let tr=0;tr<3;tr++){
  const d=(el('jjSvg').innerHTML.match(/class="cor" id="cor" d="([^"]+)"/)||[])[1]; const pts=d.slice(1).split(' L').map(s=>s.split(' ').map(Number));
  fire('jjSvg','pointerdown',{clientX:pts[0][0],clientY:pts[0][1],pointerId:1});
  for(let i=0;i<pts.length;i+=3){ const off=(tr===1&&i===60)?200:0; fire('jjSvg','pointermove',{clientX:pts[i][0],clientY:pts[i][1]+off}); }
  fire('jjSvg','pointermove',{clientX:pts.at(-1)[0],clientY:pts.at(-1)[1]});
  log(' trial',tr+1, el('jjMsg').textContent); step(40);
}
log('end', el('endT').textContent,'|', el('stats').innerHTML.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
fire('menu','click');
// buah station (5,-5): right + up; arahan mode
goTo(5,-5);
log('station', el('stT').textContent, 'modes hidden?', el('stModes').hidden);
click('modes',{m:'arahan'}); fire('stGo','click'); step(2);
log('arahan HUD', el('goal').textContent, el('prog').innerHTML.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '), '|', spoken.at(-1));
fire('stop','click'); log('after stop', el('goal').textContent, el('stop').textContent);
fire('stop','click'); log('checkout', !el('feel').hidden, el('feelT').textContent);
click('faces',{f:'gembira'}); log('day', el('endT').textContent,'|', el('stats').innerHTML.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '), '|', el('hist').innerHTML.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
log('again hidden', el('again').hidden, 'menu', el('menu').textContent);
fire('menu','click'); log('start shown', !el('start').hidden);
log('saved after unnamed day', store['ka.sesi']||'(none)');

(async()=>{
 // second day with a name, play siram badly at level 1 twice and jejak
 el('nama').value='Danish';
 for(let dayN=0; dayN<3; dayN++){
  click('go');
  if(!el('consent').hidden){ log('consent shown for', el('cnFor').textContent); log('yes disabled', el('cnYes').disabled===undefined?'(n/a)':el('cnYes').disabled);
    el('cnName').value='Puan Aminah'; fire('cnName','input'); log('still disabled w/o tick', el('cnYes').disabled);
    el('cnChk').checked=true; fire('cnChk','change'); log('enabled', !el('cnYes').disabled); fire('cnYes','click'); log('cst', el('cst').innerHTML); }
  click('faces',{f: dayN<2?'risau':'tenang'});
  goTo(-6,5); fire('stGo','click');
  for(let p=0;p<5;p++){ fire('siHold','pointerdown',{}); let g=0; while(g<400 && !el('siMsg').textContent.startsWith('Melimpah')){ step(); g++; } fire('siHold','pointerup',{}); step(40); }
  fire('menu','click');
  goTo(5,-5); click('modes',{m:'arahan'}); fire('stGo','click'); step(2);
  fire('stop','click'); // abandon
  fire('stop','click'); click('faces',{f:'gembira'}); fire('menu','click');
 }
 log('records', JSON.parse(store['ka.sesi']).length);
 fire('masterBtn','click'); log('pin new', !el('pin').hidden, el('pinT').textContent, 'pin2 hidden', el('pin2Row').hidden);
 el('pinIn').value='1234'; el('pin2').value='1235'; fire('pinForm','submit',{preventDefault(){}}); await new Promise(r=>setTimeout(r,20)); log('mismatch', el('pinMsg').textContent);
 el('pinIn').value='1234'; el('pin2').value='1234'; fire('pinForm','submit',{preventDefault(){}}); await new Promise(r=>setTimeout(r,50));
 log('master open', !el('master').hidden, el('mSum').textContent);
 const txt = el('mDom').innerHTML.replace(/<\/(article|li|div)>/g,'\n').replace(/<[^>]+>/g,' ').replace(/[ ]+/g,' ');
 log(txt);
 log('TIPS', el('mTips').innerHTML.replace(/<[^>]+>/g,' ').slice(0,300));
 await new Promise(r=>{ fire('mCopy','click'); setTimeout(r,20); }); log('copied chars', clip.length, '\n'+clip.slice(0,500));
 fire('mClose','click'); log('closed', el('master').hidden, !el('start').hidden);
 fire('masterBtn','click'); el('pinIn').value='9999'; fire('pinForm','submit',{preventDefault(){}}); await new Promise(r=>setTimeout(r,50)); log('wrong pin', el('pinMsg').textContent, 'master hidden', el('master').hidden);
 fire('ambBtn','click'); log('amb', el('ambBtn').textContent, store['ka.amb']);
 // ===================== 0.10.0: misi, adaptif, rama-rama, pondok rehat, kampung membesar =====================
 log('\n=== 0.10.0 ===');
 function seeded(str){ let h = 2166136261; for (const ch of str){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
 const POOL=['buah-warna','buah-arahan','siram','jejak','rama'];
 function misiFor(nm){ const r=seeded(nm+'|'+new Date().toISOString().slice(0,10)), pool=POOL.slice(), out=[]; while(out.length<3){ out.push(pool.splice(Math.floor(r()*pool.length),1)[0]); } return out; }
 let kid=null; for (const n of ['Aina','Ali','Siti','Mei','Raju','Ayu','Bala','Chong','Dina','Eka','Farah','Gopal']){ const m=misiFor(n); if(!m.some(x=>x.startsWith('buah'))){ kid=n; break; } }
 log('kid', kid, misiFor(kid));
 el('nama').value=kid; fire('nama','input');
 click('go'); el('cnName').value='Puan Ros'; fire('cnName','input'); el('cnChk').checked=true; fire('cnChk','change'); fire('cnYes','click');
 click('faces',{f:'risau'}); log('hub goal', el('goal').textContent, '| prog', el('prog').innerHTML.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '), '| said', spoken.at(-1));
 // pondok rehat
 goTo(1.2,9); log('rehat card', el('stT').textContent, '| levels hidden', el('lvs').hidden, '| note', el('adNote').textContent); fire('stGo','click');
 log('rehat shown', !el('rehat').hidden, el('rhCount').textContent); step(700);
 log('rehat end', !el('end').hidden, el('endT').textContent, '|', el('stats').innerHTML.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
 fire('menu','click');
 async function doSiram(){ goTo(-6,5); fire('stGo','click'); const tot=+el('siMsg').textContent.match(/\/ (\d+)/)[1];
   for(let p=0;p<tot;p++){ fire('siHold','pointerdown',{}); let g=0; while(g<600){ step(); g++; const wy=+el('water')._attrs.y, bt=+el('bandTop')._attrs.y1, bb=+el('bandBot')._attrs.y1; if(wy<(bt+bb)/2) break; } fire('siHold','pointerup',{}); step(40); }
   return tot; }
 async function doJejak(){ goTo(7,7); fire('stGo','click'); let n=0;
   while(!el('jejak').hidden && n<12){ const d=(el('jjSvg').innerHTML.match(/class="cor" id="cor" d="([^"]+)"/)||[])[1]; const pts=d.slice(1).split(' L').map(q=>q.split(' ').map(Number));
     fire('jjSvg','pointerdown',{clientX:pts[0][0],clientY:pts[0][1],pointerId:1}); for(let i=0;i<pts.length;i+=3) fire('jjSvg','pointermove',{clientX:pts[i][0],clientY:pts[i][1]}); fire('jjSvg','pointermove',{clientX:pts.at(-1)[0],clientY:pts.at(-1)[1]}); step(40); n++; }
   return n; }
 async function doRama(){ goTo(-7.4,-1.6); log('rama card', el('stT').textContent); fire('stGo','click'); let taps=0, miss=0;
   let guard=0; while(!el('rama').hidden && taps<200 && guard++<4000){ step(3); const tr=el('rm0')._attrs.transform||''; const m=tr.match(/translate\(([-\d.]+) ([-\d.]+)\)/);
     if(m && +m[1]>0){ if(taps%6===5){ fire('rmSvg','pointerdown',{clientX:5,clientY:5}); miss++; } fire('rmSvg','pointerdown',{clientX:+m[1],clientY:+m[2]}); taps++; } }
   if(guard>=4000) log('RAMA GUARD', el('rmMsg').textContent, el('rm0')._attrs.transform, el('rm1')._attrs.transform, el('stc').hidden, el('rama').hidden);
   step(30); return [taps, miss]; }
 for (const m of misiFor(kid)){
   if(m==='siram') log('siram pots', await doSiram(), '|', el('endT').textContent, '|', el('endP').textContent);
   if(m==='jejak') log('jejak paths', await doJejak(), '|', el('endT').textContent, '|', el('endP').textContent);
   if(m==='rama') log('rama taps', await doRama(), '|', el('endT').textContent, '|', el('stats').innerHTML.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '), '|', el('endP').textContent);
   step(50); log(' toast', el('toast').textContent); fire('menu','click');
 }
 log('kebun stored', store['ka.kebun.'+kid], '| hub', el('goal').textContent);
 fire('stop','click'); click('faces',{f:'tenang'}); log('day', el('stats').innerHTML.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
 const recs=JSON.parse(store['ka.sesi']).filter(r=>r.nama===kid); log('recs', recs.map(r=>r.mod+':T'+r.tahapMula+'->'+r.tahap+'/'+r.tahapAkhir+(r.tempoh?'/'+r.tempoh:'')).join(' '));
 fire('menu','click');
 // Mod Induk shows new domain
 fire('masterBtn','click'); el('pinIn').value='1234'; fire('pinForm','submit',{preventDefault(){}}); await new Promise(r=>setTimeout(r,50));
 if(!el('master').hidden){ el('mSel').value=kid; fire('mSel','change',{target:{value:kid}}); }
 const dom=el('mDom').innerHTML.replace(/<\/(article)>/g,'\n').replace(/<[^>]+>/g,' ').replace(/[ ]+/g,' ');
 log('domains', (dom.match(/Penjejakan visual[^\n]*/)||dom.match(/Visual tracking[^\n]*/)||['(tiada)'])[0].slice(0,260));
 log('rehat metric', /pondok rehat|rest hut/i.test(dom));
 fire('mClose','click');
 // panjang + adaptif off
 click('lenSeg',{len:'panjang'}); fire('adBtn','click'); log('opts', store['ka.tempoh'], store['ka.adaptif']);
 click('go'); click('faces',{f:'gembira'}); goTo(-6,5); fire('stGo','click'); log('panjang siram', el('siMsg').textContent);
 fire('siQuit','click'); click('lenSeg',{len:'pendek'}); fire('adBtn','click');

 // export / import round trip
 fire('masterBtn','click'); el('pinIn').value='1234'; fire('pinForm','submit',{preventDefault(){}}); await new Promise(r=>setTimeout(r,50));
 fire('expBtn','click'); const dump = el('dataBox').value; const parsed = JSON.parse(dump); log('export recs', parsed.sesi.length, 'consents', Object.keys(parsed.persetujuan).length, 'v', parsed.v, 'rec v', parsed.sesi[0].v);
 const saveS = store['ka.sesi']; store['ka.sesi']='[]';
 fire('impPaste','click'); el('dataBox').value = dump; fire('impGo','click'); log('import msg', el('mMsg').textContent, '| recs now', JSON.parse(store['ka.sesi']).length);
 fire('impPaste','click'); el('dataBox').value = dump; fire('impGo','click'); log('re-import dedupe', el('mMsg').textContent);
 fire('impPaste','click'); el('dataBox').value = '{bad'; fire('impGo','click'); log('bad json', el('mMsg').textContent);
 fire('mClose','click');
 // colour-blind mode
 fire('cbBtn','click'); log('cb', el('cbBtn').textContent, store['ka.cb']);
 click('go'); click('faces',{f:'tenang'}); goTo(5,-5); click('modes',{m:'warna'}); fire('stGo','click'); step(2); log('cb goal', el('goal').textContent, '|', spoken.at(-1));
 fire('stop','click'); click('modes',{m:'arahan'}); goTo(5,-5); fire('stGo','click'); step(2); log('cb arahan', el('prog').innerHTML.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '), '|', spoken.at(-1));
 fire('stop','click'); fire('stop','click'); click('faces',{f:'gembira'}); fire('menu','click'); fire('cbBtn','click');
 // withdraw consent via master
 fire('masterBtn','click'); el('pinIn').value='1234'; fire('pinForm','submit',{preventDefault(){}}); await new Promise(r=>setTimeout(r,50));
 log('mSum', el('mSum').textContent);
 fire('mDel','click'); fire('mDel','click'); log('nama now', JSON.stringify(el('nama').value)); log('after withdraw', el('mMsg').textContent, '| records left', JSON.parse(store['ka.sesi']).length, '| consent', store['ka.consent'], '| cst', el('cst').textContent);
 // ---- backup round-trip (before withdrawal test wiped data we export now)
 log('X');
 fire('mClose','click'); click('go'); log('consent asked again', !el('consent').hidden); fire('cnNo','click'); log('no-record mode feel shown', !el('feel').hidden);
})();
