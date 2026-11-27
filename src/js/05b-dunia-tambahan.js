/* ---------- extra world: butterfly garden, rest hut (wakaf) and the growing kampung ---------- */
const extraAnims = [];

/* butterfly garden beside the "Tangkap rama-rama" station */
{
  const cols = [0xf06aa0, 0xffc93c, 0xffffff, 0xe0362c, 0xb38ce0];
  [[-10.2,-4.4],[-10.6,-2.2],[-9.6,-.9],[-8.4,-5.4]].forEach(([x,z],i)=>{
    scene.add(mesh(new THREE.IcosahedronGeometry(.55,0), mat(0x3c9446), x, .45, z));
    for (let k=0;k<4;k++) scene.add(mesh(new THREE.SphereGeometry(.12,6,5), mat(cols[(i+k)%cols.length]), x + Math.cos(k*1.7)*.4, .85, z + Math.sin(k*1.7)*.4));
  });
  obstacles.push({x:-10.2, z:-3, r:1.4});
  const flyers = [];
  for (let i=0;i<4;i++){
    const g = new THREE.Group(), wm = new THREE.MeshStandardMaterial({color:[0xf06aa0,0xffc93c,0x4aa8e8,0xb38ce0][i], side:THREE.DoubleSide, roughness:.6});
    const wl = new THREE.Mesh(new THREE.CircleGeometry(.22,10), wm), wr = wl.clone();
    wl.position.x = -.18; wr.position.x = .18; wl.rotation.x = wr.rotation.x = -Math.PI/2;
    const pl = new THREE.Group(), pr = new THREE.Group(); pl.add(wl); pr.add(wr);
    g.add(pl, pr, mesh(new THREE.CylinderGeometry(.03,.03,.3,4), mat(0x1a1410)));
    g.children.at(2).rotation.x = Math.PI/2;
    scene.add(g); flyers.push({g, pl, pr, ph:i*1.6});
  }
  extraAnims.push(t=>flyers.forEach(f=>{
    const a = t*.6 + f.ph;
    f.g.position.set(-9.5 + Math.cos(a)*1.8, 1.4 + Math.sin(t*2 + f.ph)*.35, -3 + Math.sin(a*1.3)*1.6);
    f.g.rotation.y = -a;
    const flap = Math.sin(t*18 + f.ph)*.9; f.pl.rotation.z = flap; f.pr.rotation.z = -flap;
  }));
}

/* wakaf (rest hut) beside the "Pondok rehat" station */
{
  const g = new THREE.Group(), wood = mat(0x9b5e34), dark = mat(0x5c3418);
  [[-1.1,-1.1],[1.1,-1.1],[-1.1,1.1],[1.1,1.1]].forEach(([a,b])=>g.add(mesh(new THREE.CylinderGeometry(.1,.1,2.2,6), dark, a, 1.1, b)));
  g.add(mesh(new THREE.BoxGeometry(2.6,.18,2.6), wood, 0, .6, 0));
  const roof = mesh(new THREE.ConeGeometry(2.3,1.2,4), mat(0xb8432e), 0, 2.75, 0); roof.rotation.y = Math.PI/4; g.add(roof);
  [[-.5,0xf3876a],[.5,0x9bd77a]].forEach(([x,c])=>g.add(mesh(new THREE.BoxGeometry(.5,.18,.5), mat(c), x, .78, .3)));
  g.position.set(-1.6, 0, 12); scene.add(g);
  obstacles.push({x:-1.6, z:12, r:1.7});
}

/* the kampung grows: one new item each day all three missions are done */
const KEBUN = [
  {nama:T('Pokok pisang'), x:13, z:-6}, {nama:T('Batas bunga'), x:-11, z:2.5}, {nama:T('Kambing'), x:15, z:8},
  {nama:T('Kolam itik'), x:-2, z:-12.5}, {nama:T('Pokok kelapa'), x:16, z:-16}, {nama:T('Buaian'), x:-18, z:-8},
  {nama:T('Pelita'), x:0, z:0}, {nama:T('Wau'), x:-6, z:15}, {nama:T('Kucing'), x:-9.5, z:-7.5}, {nama:T('Pokok rambutan besar'), x:-20.5, z:-1.5}
];
const kebunMeshes = [], kebunObs = [];
function kebunItem(i){
  const it = KEBUN[i], g = new THREE.Group();
  if (i === 0){ g.add(mesh(new THREE.CylinderGeometry(.18,.24,2,7), mat(0x9bb36b), 0, 1, 0)); for (let k=0;k<5;k++){ const l = mesh(new THREE.BoxGeometry(.25,.04,1.6), mat(0x4caf50), 0, 2, 0); l.rotation.y = k*1.25; l.rotation.x = .5; l.position.set(Math.sin(k*1.25)*.5, 1.9, Math.cos(k*1.25)*.5); g.add(l); } g.add(mesh(new THREE.SphereGeometry(.2,6,5), mat(0xffc93c), .25, 1.5, 0)); }
  if (i === 1){ g.add(mesh(new THREE.BoxGeometry(3,.3,1), mat(0x8a5a2b), 0, .15, 0)); for (let k=0;k<6;k++) g.add(mesh(new THREE.IcosahedronGeometry(.2,0), mat([0xf06aa0,0xffc93c,0xe0362c][k%3]), -1.2 + k*.48, .5, 0)); }
  if (i === 2){ const w = mat(0xf2efe6); const b = mesh(new THREE.BoxGeometry(.5,.45,.9), w, 0, .65, 0); g.add(b, mesh(new THREE.BoxGeometry(.32,.32,.36), w, 0, .95, .55)); [[-.18,-.32],[.18,-.32],[-.18,.32],[.18,.32]].forEach(([a,c])=>g.add(mesh(new THREE.CylinderGeometry(.05,.05,.45,4), mat(0x3a2a1a), a, .22, c))); g.add(mesh(new THREE.ConeGeometry(.05,.18,4), mat(0x8a7a5a), -.1, 1.2, .55), mesh(new THREE.ConeGeometry(.05,.18,4), mat(0x8a7a5a), .1, 1.2, .55)); }
  if (i === 3){ g.add(mesh(new THREE.CylinderGeometry(1.8,1.8,.08,24), mat(0x4aa8e8,{roughness:.2}), 0, .05, 0)); const d = new THREE.Group(); d.add(mesh(new THREE.SphereGeometry(.22,8,6), mat(0xffffff), 0, .25, 0), mesh(new THREE.SphereGeometry(.13,8,6), mat(0xffffff), 0, .45, .18), mesh(new THREE.ConeGeometry(.05,.14,4), mat(0xffb020), 0, .43, .34)); d.children.at(2).rotation.x = Math.PI/2; g.add(d); extraAnims.push(t=>{ d.position.set(Math.cos(t*.5)*1, 0, Math.sin(t*.5)*1); d.rotation.y = -t*.5; }); }
  if (i === 4){ g.add(mesh(new THREE.CylinderGeometry(.16,.26,5,7), mat(0x8a6a45), .3, 2.5, 0)); g.children.at(0).rotation.z = .12; for (let k=0;k<6;k++){ const l = mesh(new THREE.BoxGeometry(.3,.04,2), mat(0x3c9446), .6 + Math.sin(k)*.8, 4.9, Math.cos(k)*.8); l.rotation.y = k; l.rotation.x = .6; g.add(l); } g.add(mesh(new THREE.SphereGeometry(.2,6,5), mat(0x6b4a2a), .6, 4.6, .2)); }
  if (i === 5){ const fr = mat(0x5c3418); g.add(mesh(new THREE.CylinderGeometry(.08,.08,2.6,5), fr, -1, 1.3, 0), mesh(new THREE.CylinderGeometry(.08,.08,2.6,5), fr, 1, 1.3, 0), mesh(new THREE.CylinderGeometry(.08,.08,2.1,5), fr, 0, 2.6, 0)); g.children.at(2).rotation.z = Math.PI/2; const sw = new THREE.Group(); sw.position.y = 2.6; sw.add(mesh(new THREE.BoxGeometry(.7,.08,.35), mat(0xe0362c), 0, -1.9, 0), mesh(new THREE.CylinderGeometry(.015,.015,1.9,3), mat(0x333333), -.3, -.95, 0), mesh(new THREE.CylinderGeometry(.015,.015,1.9,3), mat(0x333333), .3, -.95, 0)); g.add(sw); extraAnims.push(t=>{ sw.rotation.x = Math.sin(t*1.4)*.35; }); }
  if (i === 6){ for (let k=0;k<6;k++){ const a = k/6*Math.PI*2 + .3, x = Math.cos(a)*11.3, z = Math.sin(a)*11.3; g.add(mesh(new THREE.CylinderGeometry(.05,.05,1.2,5), mat(0x5c3418), x, .6, z)); const f = mesh(new THREE.SphereGeometry(.12,6,5), new THREE.MeshBasicMaterial({color:0xffb347}), x, 1.28, z); g.add(f); extraAnims.push(t=>f.scale.setScalar(1 + Math.sin(t*9 + k)*.15)); } }
  if (i === 7){ const k = new THREE.Group(); k.add(mesh(new THREE.BoxGeometry(1.6,.05,1.1), mat(0xe0362c), 0, 0, 0), mesh(new THREE.BoxGeometry(.9,.06,.5), mat(0xffc93c), 0, .01, .7)); k.rotation.x = -1.1; k.position.y = 9; g.add(k); extraAnims.push(t=>{ k.position.x = Math.sin(t*.7)*1.2; k.position.y = 9 + Math.sin(t*1.1)*.5; k.rotation.z = Math.sin(t*.9)*.25; }); }
  if (i === 8){ const o = mat(0xf2a33a); g.add(mesh(new THREE.SphereGeometry(.28,8,6), o, 0, .3, 0), mesh(new THREE.SphereGeometry(.2,8,6), o, 0, .5, .3), mesh(new THREE.ConeGeometry(.07,.14,4), o, -.1, .7, .3), mesh(new THREE.ConeGeometry(.07,.14,4), o, .1, .7, .3), mesh(new THREE.CylinderGeometry(.04,.03,.5,4), o, 0, .45, -.35)); g.children.at(4).rotation.x = -.8; }
  if (i === 9){ g.add(mesh(new THREE.CylinderGeometry(.35,.5,3.2,8), mat(0x6e4325), 0, 1.6, 0)); [[0,4.2,0,2.2],[1.2,3.6,.4,1.5],[-1.1,3.7,-.5,1.6],[.2,5.2,.2,1.3]].forEach(([a,b,c,r])=>g.add(mesh(new THREE.IcosahedronGeometry(r,0), mat(0x2a6e35), a, b, c))); for (let k=0;k<10;k++) g.add(mesh(new THREE.SphereGeometry(.16,6,5), mat(0xe0362c), Math.cos(k)*1.9, 3.4 + (k%3)*.6, Math.sin(k)*1.9)); }
  g.position.set(it.x, 0, it.z); g.scale.setScalar(.001); scene.add(g);
  if (![6,7].includes(i)){ const o = {x:it.x, z:it.z, r:i === 3 ? 1.9 : i === 9 ? 1.4 : .8}; obstacles.push(o); kebunObs.push(o); }
  return g;
}
let kebunShown = 0;
function showKebun(n, animate){
  n = Math.max(0, Math.min(KEBUN.length, n));
  while (kebunShown < n){
    const g = kebunItem(kebunShown); kebunMeshes.push(g);
    if (animate){ const born = performance.now(); extraAnims.push(()=>{ const k = Math.min(1, (performance.now() - born)/900); g.scale.setScalar(k < 1 ? k*(1.15 - .15*k) : 1); }); }
    else g.scale.setScalar(1);
    kebunShown++;
  }
}
function resetKebun(){
  kebunMeshes.forEach(g=>scene.remove(g)); kebunMeshes.length = 0;
  kebunObs.forEach(o=>{ const i = obstacles.indexOf(o); if (i >= 0) obstacles.splice(i, 1); }); kebunObs.length = 0;
  kebunShown = 0;
}
