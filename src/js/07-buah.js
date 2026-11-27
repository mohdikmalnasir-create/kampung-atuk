/* ---------- fruit ---------- */
function fruitMesh(key){
  const g = new THREE.Group(), m = mat(HEXC(key), {roughness:.55});
  if (key==='merah') g.add(mesh(new THREE.IcosahedronGeometry(.42,1), m));
  if (key==='kuning'){ const f = mesh(new THREE.SphereGeometry(.42,10,8), m); f.scale.set(.8,1.15,.8); g.add(f); }
  if (key==='hijau'){ const f = mesh(new THREE.ConeGeometry(.42,.8,8), m); f.rotation.x = Math.PI; g.add(f); }
  if (key==='ungu'){ g.add(mesh(new THREE.SphereGeometry(.42,10,8), m)); g.add(mesh(new THREE.CylinderGeometry(.18,.22,.12,6), mat(0x4f8a2c), 0, .42, 0)); }
  if (key!=='ungu') g.add(mesh(new THREE.CylinderGeometry(.04,.04,.22,5), mat(0x5c3418), 0, .5, 0));
  return g;
}
let fruits = [], goalKey = 'merah', got = 0, wrong = 0, t0 = 0, playing = false, dest = null, keys = {}, stepT = 0;
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
function clearFruits(){ fruits.forEach(f=>scene.remove(f.g)); fruits = []; }
function freeSpot(){
  for (let k=0;k<200;k++){
    const a = Math.random()*Math.PI*2, d = 3.5 + Math.random()*(R-5.5), x = Math.cos(a)*d, z = Math.sin(a)*d;
    if (obstacles.some(o=>Math.hypot(o.x-x,o.z-z) < o.r+1.4)) continue;
    if (fruits.some(f=>Math.hypot(f.x-x,f.z-z) < 2)) continue;
    return [x,z];
  }
  return [Math.random()*10-5, Math.random()*10-5];
}
function addFruit(key){
  const [x,z] = freeSpot(), g = fruitMesh(key);
  g.position.set(x,.6,z); scene.add(g);
  fruits.push({g,key,x,z,ph:Math.random()*6,cool:false,pop:0,shake:0});
}

let toastT;
function toast(msg){ const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('on'), 1700); }
function hideOverlays(){ ['start','feel','stc','siram','jejak','end','pin','master','consent'].forEach(id=>$(id).hidden = true); }
function showStationsInWorld(on){ STATIONS.forEach(st=>{ st.ring.visible = on; st.label.visible = on; }); }
