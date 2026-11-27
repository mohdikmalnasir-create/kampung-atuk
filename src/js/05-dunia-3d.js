/* ---------- scene ---------- */
const canvas = $('c'), stage = $('stage');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd8ef);
scene.fog = new THREE.Fog(0x9fd8ef, 34, 70);
const camera = new THREE.PerspectiveCamera(48, 1, .1, 200);
scene.add(new THREE.HemisphereLight(0xfff3d6, 0x3d7a3a, .75));
const sun = new THREE.DirectionalLight(0xfff0c8, .9);
sun.position.set(12, 20, 8); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left:-28,right:28,top:28,bottom:-28,near:1,far:60});
scene.add(sun);

const mat = (c, o={}) => new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.85, flatShading:true}, o));
function mesh(geo, m, x=0, y=0, z=0){ const me = new THREE.Mesh(geo, m); me.position.set(x,y,z); me.castShadow = me.receiveShadow = true; return me; }

const R = 24;
const ground = mesh(new THREE.CircleGeometry(R+30, 64), mat(0x7cc35a));
ground.rotation.x = -Math.PI/2; scene.add(ground);
const path = mesh(new THREE.RingGeometry(9, 10.6, 64), mat(0xe8cf98));
path.rotation.x = -Math.PI/2; path.position.y = .02; scene.add(path);

const obstacles = [];
function tree(x, z, s=1){
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(.22*s,.34*s,2.2*s,7), mat(0x7a4b2a), 0, 1.1*s, 0));
  const leaf = mat([0x2f7d3b,0x3c9446,0x2a6e35][Math.floor(Math.random()*3)]);
  [[0,2.8,0,1.5],[.8,2.4,.3,1.05],[-.7,2.5,-.4,1.1],[.1,3.5,.2,1]].forEach(([a,b,c,r])=>g.add(mesh(new THREE.IcosahedronGeometry(r*s,0), leaf, a*s, b*s, c*s)));
  g.position.set(x, 0, z); g.rotation.y = Math.random()*6; scene.add(g);
  obstacles.push({x, z, r:.7*s});
}
function roofPrism(w, len, color){ const r = mesh(new THREE.CylinderGeometry(w,w,len,3), mat(color)); r.rotation.x = -Math.PI/2; r.scale.set(1,1,.7); return r; }
function house(x, z){
  const g = new THREE.Group(), wood = mat(0x9b5e34), dark = mat(0x5c3418);
  [[-1.8,-1.3],[1.8,-1.3],[-1.8,1.3],[1.8,1.3]].forEach(([a,b])=>g.add(mesh(new THREE.CylinderGeometry(.14,.14,1.2,6), dark, a, .6, b)));
  g.add(mesh(new THREE.BoxGeometry(4.2,2.2,3.2), wood, 0, 2.3, 0));
  const roof = roofPrism(2.5, 3.8, 0xb8432e); roof.position.y = 4.3; g.add(roof);
  g.add(mesh(new THREE.BoxGeometry(.9,1.4,.1), dark, 0, 2, 1.62));
  g.add(mesh(new THREE.BoxGeometry(1.2,.12,1.2), dark, 0, 1.2, 2.2));
  g.position.set(x, 0, z); g.rotation.y = .5; scene.add(g);
  obstacles.push({x, z, r:2.8});
}
house(-13, -11);
[[14,-12,1.2],[18,4,1.1],[-19,6,1.3],[6,17,1],[-7,19,1.2],[20,-3,.9],[-4,-6,.9],[-16,-2,1],[12,13,1.1],[-12,13,1],[0,-17,1.2]].forEach(a=>tree(...a));
for (let i=0;i<60;i++){ const a = i/60*Math.PI*2; scene.add(mesh(new THREE.BoxGeometry(.12,.8,.12), mat(0xd9b98a), Math.cos(a)*R, .4, Math.sin(a)*R)); }

/* station props */
const flowerCols = [0xf06aa0, 0xffc93c, 0xe0362c];
[[-8.4,4.2],[-8.2,5.8],[-7.4,7.2]].forEach(([x,z],i)=>{
  scene.add(mesh(new THREE.CylinderGeometry(.38,.26,.5,8), mat(0xc0663a), x, .25, z));
  scene.add(mesh(new THREE.CylinderGeometry(.03,.03,.6,4), mat(0x3c9446), x, .8, z));
  scene.add(mesh(new THREE.IcosahedronGeometry(.24,0), mat(flowerCols[i]), x, 1.15, z));
});
scene.add(mesh(new THREE.CylinderGeometry(.35,.3,.55,10), mat(0x8a8f94,{metalness:.4}), -4.6, .28, 6.4));
{
  const coop = new THREE.Group(), wood = mat(0xb07a45);
  [[-.9,-.7],[.9,-.7],[-.9,.7],[.9,.7]].forEach(([a,b])=>coop.add(mesh(new THREE.CylinderGeometry(.08,.08,.6,5), mat(0x5c3418), a, .3, b)));
  coop.add(mesh(new THREE.BoxGeometry(2.1,1.2,1.7), wood, 0, 1.2, 0));
  const r = roofPrism(1.4, 2.0, 0x7a3b22); r.position.y = 2.1; r.rotation.z = Math.PI/2; coop.add(r);
  coop.add(mesh(new THREE.BoxGeometry(.5,.55,.05), mat(0x3a2414), 0, 1.15, .86));
  coop.position.set(10, 0, 9.6); coop.rotation.y = -.75; scene.add(coop);
  obstacles.push({x:10, z:9.6, r:1.5});
}
const hens = [];
function hen(x, z, s=1){
  const g = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(.32,10,8), mat(0xf6efe2), 0, .42, 0); body.scale.set(1,.85,1.25); g.add(body);
  const head = new THREE.Group(); head.position.set(0,.72,.28);
  head.add(mesh(new THREE.SphereGeometry(.15,8,6), mat(0xf6efe2)));
  head.add(mesh(new THREE.BoxGeometry(.05,.12,.16), mat(0xe0362c), 0, .14, 0));
  const beak = mesh(new THREE.ConeGeometry(.05,.12,5), mat(0xffb020), 0, -.01, .17); beak.rotation.x = Math.PI/2; head.add(beak);
  g.add(head);
  g.add(mesh(new THREE.CylinderGeometry(.03,.03,.2,4), mat(0xffb020), -.1, .1, 0), mesh(new THREE.CylinderGeometry(.03,.03,.2,4), mat(0xffb020), .1, .1, 0));
  g.position.set(x,0,z); g.scale.setScalar(s); g.rotation.y = Math.random()*6; scene.add(g);
  hens.push({g, head, ph:Math.random()*6});
}
hen(8.6, 6.0); hen(6.2, 9.0, .8); hen(9.0, 7.6, .7);
{
  const b = mesh(new THREE.CylinderGeometry(.6,.45,.55,10), mat(0xc9954a), 6.9, .28, -6.6); scene.add(b);
  [[0xe0362c,-.2,0],[0xffc21a,.15,.15],[0x5bbf3a,.1,-.2],[0x6b2a74,-.1,.25]].forEach(([c,dx,dz])=>scene.add(mesh(new THREE.IcosahedronGeometry(.2,0), mat(c), 6.9+dx, .62, -6.6+dz)));
  obstacles.push({x:6.9, z:-6.6, r:.7});
}

/* station rings and labels */
function labelCanvas(text, done){
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = done ? '#dff1d6' : '#fffdf6';
  x.beginPath(); x.moveTo(40,8); x.arcTo(504,8,504,120,32); x.arcTo(504,120,8,120,32); x.arcTo(8,120,8,8,32); x.arcTo(8,8,504,8,32); x.fill();
  x.font = '800 60px "Baloo 2", sans-serif'; x.fillStyle = '#173a1f'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const lbl = text + (done ? ' ✓' : ''); let fs = 60; x.font = '800 ' + fs + 'px "Baloo 2", sans-serif';
  while (fs > 34 && ((x.measureText && x.measureText(lbl)) || {width:0}).width > 470){ fs -= 2; x.font = '800 ' + fs + 'px "Baloo 2", sans-serif'; }
  x.fillText(lbl, 256, 70);
  return c;
}
STATIONS.forEach(st=>{
  st.ring = new THREE.Mesh(new THREE.RingGeometry(1.05,1.4,36), new THREE.MeshBasicMaterial({color:0xffd24a, transparent:true, opacity:.9}));
  st.ring.rotation.x = -Math.PI/2; st.ring.position.set(st.x,.06,st.z); scene.add(st.ring);
  st.tex = new THREE.CanvasTexture(labelCanvas(st.nama, false));
  st.label = new THREE.Sprite(new THREE.SpriteMaterial({map:st.tex, depthTest:false}));
  st.label.scale.set(3.6,.9,1); st.label.position.set(st.x, 3.1, st.z); scene.add(st.label);
  st.cool = false;
});
function redrawLabels(){ STATIONS.forEach(st=>{ st.tex.image = labelCanvas(st.nama, day.done.has(st.id)); st.tex.needsUpdate = true; st.ring.material.color.set(day.done.has(st.id) ? 0x7ee05a : 0xffd24a); }); }
try { document.fonts.load('800 60px "Baloo 2"').then(redrawLabels); } catch(e) {}
