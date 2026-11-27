/* ---------- characters: traditional dress ---------- */
const GOLD = 0xe0b13a, SK = {a:0xe9bf98, b:0xc68a5a, c:0x8f5b3b, d:0xd6a074};
const CHARS = [
  {id:'adam', nama:'Adam', baju:'Baju Melayu', skin:SK.b, top:0x1f7a5a, pants:0x1f7a5a, sampin:0x7a1e3a, btn:GOLD, head:'songkok'},
  {id:'aisyah', nama:'Aisyah', baju:'Baju kurung', skin:SK.b, top:0xf29bb8, long:1, skirt:0xf29bb8, head:'tudung', tud:0x7c5cc4},
  {id:'weijie', nama:'Wei Jie', baju:'Baju samfu', skin:SK.a, top:0x2a5caa, pants:0x1c2a44, frog:GOLD, collar:0x2a5caa, head:'hair', hair:0x1a1410},
  {id:'meiling', nama:'Mei Ling', baju:'Cheongsam', skin:SK.a, top:0xd7262e, skirt:0xd7262e, narrow:1, hem:GOLD, collar:GOLD, head:'bun', hair:0x1a1410},
  {id:'arjun', nama:'Arjun', baju:'Kurta', skin:SK.c, top:0xf3e6c8, long:1, pants:0xf6f1e4, collar:0xb0302a, btn:GOLD, head:'hair', hair:0x14100c},
  {id:'priya', nama:'Priya', baju:'Pavadai', skin:SK.c, top:0x2e9e5b, skirt:0xc2187a, hem:GOLD, sash:0xf08a1c, head:'braid', hair:0x14100c},
  {id:'dayang', nama:'Dayang', baju:'Sinuangga Kadazan', skin:SK.d, top:0x1b1b1f, skirt:0x1b1b1f, hem:GOLD, collar:GOLD, cuff:GOLD, belt:0xdcdcdc, head:'flower', hair:0x1a1410}
];
function buildChar(c){
  const g = new THREE.Group(), P = {}, skin = mat(c.skin), top = mat(c.top), gold = mat(GOLD, {metalness:.5, roughness:.4});
  P.legL = mesh(new THREE.BoxGeometry(.2,.7,.22), mat(c.pants || c.skin), -.16, .35, 0);
  P.legR = P.legL.clone(); P.legR.position.x = .16; g.add(P.legL, P.legR);
  P.baseY = c.long ? 1.0 : 1.15;
  P.body = mesh(c.long ? new THREE.CylinderGeometry(.36,.5,1.15,12) : new THREE.CylinderGeometry(.36,.42,.85,12), top, 0, P.baseY, 0); g.add(P.body);
  if (c.skirt){
    const n = c.narrow; g.add(mesh(new THREE.CylinderGeometry(n?.36:.4, n?.43:.62, .75, 14), mat(c.skirt), 0, .62, 0));
    if (c.hem) g.add(mesh(new THREE.CylinderGeometry(n?.435:.63, n?.435:.63, .09, 14), gold, 0, .29, 0));
  }
  if (c.sampin){
    g.add(mesh(new THREE.CylinderGeometry(.44,.5,.42,14), mat(c.sampin), 0, .86, 0));
    [[.72,.5],[.98,.465]].forEach(([y,r])=>g.add(mesh(new THREE.CylinderGeometry(r,r,.05,14), gold, 0, y, 0)));
  }
  if (c.btn) [1.45,1.3,1.15].forEach(y=>g.add(mesh(new THREE.SphereGeometry(.045,6,4), gold, 0, y, .4)));
  if (c.frog) [1.42,1.27,1.12].forEach(y=>g.add(mesh(new THREE.BoxGeometry(.16,.04,.04), gold, 0, y, .4)));
  if (c.collar) g.add(mesh(new THREE.CylinderGeometry(.2,.24,.14,12), mat(c.collar), 0, 1.63, 0));
  if (c.sash){ const s = mesh(new THREE.BoxGeometry(.16,1.0,.06), mat(c.sash), .02, 1.2, .38); s.rotation.z = .6; g.add(s); }
  if (c.belt) for (let i=0;i<12;i++){ const a = i/12*Math.PI*2, coin = mesh(new THREE.CylinderGeometry(.065,.065,.02,8).rotateX(Math.PI/2), mat(c.belt,{metalness:.8,roughness:.3}), Math.sin(a)*.445, .93, Math.cos(a)*.445); coin.rotation.y = a; g.add(coin); }
  for (const s of [-1,1]){
    const piv = new THREE.Group(); piv.position.set(s*.46, 1.5, 0); piv.rotation.z = s*.12;
    piv.add(mesh(new THREE.CylinderGeometry(.09,.08,.6,6), top, 0, -.3, 0), mesh(new THREE.SphereGeometry(.09,8,6), skin, 0, -.64, 0));
    if (c.cuff) piv.add(mesh(new THREE.CylinderGeometry(.095,.095,.06,6), gold, 0, -.56, 0));
    g.add(piv); P[s < 0 ? 'armL' : 'armR'] = piv;
  }
  P.armR.add(mesh(new THREE.CylinderGeometry(.24,.17,.26,8), mat(0xc9954a), 0, -.82, .05));
  g.add(mesh(new THREE.SphereGeometry(.36,14,12), skin, 0, 1.92, 0));
  const eye = mat(0x1a1410, {roughness:.3});
  [-.12,.12].forEach(x=>g.add(mesh(new THREE.SphereGeometry(.045,6,5), eye, x, 1.96, .32)));
  const cap = () => mesh(new THREE.SphereGeometry(.38,14,8,0,Math.PI*2,0,Math.PI*.55), mat(c.hair), 0, 1.94, -.02);
  if (c.head === 'songkok') g.add(mesh(new THREE.CylinderGeometry(.34,.34,.3,18), mat(0x151515, {roughness:.5}), 0, 2.16, 0));
  if (c.head === 'tudung'){
    const t = mat(c.tud, {side:THREE.DoubleSide});
    g.add(mesh(new THREE.SphereGeometry(.42,18,12,Math.PI*.8,Math.PI*1.4,0,Math.PI*.75), t, 0, 1.93, 0));
    g.add(mesh(new THREE.ConeGeometry(.6,.5,18), t, 0, 1.6, 0));
  }
  if (['hair','bun','braid','flower'].includes(c.head)) g.add(cap());
  if (c.head === 'bun') g.add(mesh(new THREE.SphereGeometry(.17,10,8), mat(c.hair), 0, 2.14, -.28));
  if (c.head === 'braid'){
    g.add(mesh(new THREE.CylinderGeometry(.07,.05,.8,6), mat(c.hair), 0, 1.55, -.36));
    [-.16,0,.16].forEach(x=>g.add(mesh(new THREE.SphereGeometry(.05,6,4), mat(0xffffff), x, 2.02, -.33)));
  }
  if (c.head === 'flower'){ g.add(mesh(new THREE.SphereGeometry(.1,8,6), mat(0xe0362c), .3, 2.12, .05)); g.add(mesh(new THREE.SphereGeometry(.06,6,4), mat(0xffc21a), .36, 2.14, .1)); }
  g.userData = P;
  return g;
}
let watak = CHARS.find(c=>c.id === store.get('ka.watak','')) || CHARS[0], player = null;
function setPlayer(c){
  const pos = player ? player.position.clone() : new THREE.Vector3(), rot = player ? player.rotation.y : 0;
  if (player) scene.remove(player);
  player = buildChar(c); player.position.copy(pos); player.rotation.y = rot; scene.add(player);
}
setPlayer(watak);
function thumbs(){
  const out = {};
  try {
    const r = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true}); r.setSize(180,180,false);
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xfff3d6, 0x3d7a3a, .9));
    const l = new THREE.DirectionalLight(0xffffff, .8); l.position.set(3,5,6); sc.add(l);
    const cam = new THREE.PerspectiveCamera(30, 1, .1, 50); cam.position.set(1.3, 2.0, 5.3); cam.lookAt(0, 1.2, 0);
    for (const c of CHARS){ const ch = buildChar(c); ch.rotation.y = .3; sc.add(ch); r.render(sc, cam); out[c.id] = r.domElement.toDataURL(); sc.remove(ch); }
    r.dispose(); if (r.forceContextLoss) r.forceContextLoss();
  } catch(e) {}
  return out;
}
const THUMB = thumbs();

const marker = new THREE.Mesh(new THREE.RingGeometry(.35,.5,24), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:.8}));
marker.rotation.x = -Math.PI/2; marker.position.y = .05; marker.visible = false; scene.add(marker);
