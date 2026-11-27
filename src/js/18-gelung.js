/* ---------- loop ---------- */
function resize(){
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w/h;
  camera.fov = w < 600 ? 58 : 48; camera.updateProjectionMatrix();
}
const ro = new ResizeObserver(resize); ro.observe(stage); resize();

const clock = new THREE.Clock(), camT = new THREE.Vector3(), SPEED = 5.2;
function tick(){
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  let mx = 0, mz = 0;
  if (playing){
    const kx = (keys['arrowright']||keys['d']?1:0) - (keys['arrowleft']||keys['a']?1:0);
    const kz = (keys['arrowdown']||keys['s']?1:0) - (keys['arrowup']||keys['w']?1:0);
    if (kx || kz){ dest = null; marker.visible = false; const l = Math.hypot(kx,kz); mx = kx/l; mz = kz/l; }
    else if (dest){
      const dx = dest.x-player.position.x, dz = dest.z-player.position.z, d = Math.hypot(dx,dz);
      if (d < .15){ dest = null; marker.visible = false; } else { mx = dx/d; mz = dz/d; }
    }
  }
  if (playing && state === 'buah' && mode === 'arahan' && !hiddenPlan && !between && performance.now() > hideAt){ hiddenPlan = true; renderSteps(); toast(T('Arahan disorok. Ingat lagi?')); }
  const moving = mx || mz;
  if (moving){
    player.position.x += mx*SPEED*dt; player.position.z += mz*SPEED*dt;
    const ang = Math.atan2(mx, mz); let da = ang - player.rotation.y;
    da = Math.atan2(Math.sin(da), Math.cos(da)); player.rotation.y += da*Math.min(1, dt*12);
    for (const o of obstacles){ const dx = player.position.x-o.x, dz = player.position.z-o.z, d = Math.hypot(dx,dz), m = o.r+.45; if (d < m && d > 0){ player.position.x = o.x+dx/d*m; player.position.z = o.z+dz/d*m; } }
    const d0 = Math.hypot(player.position.x, player.position.z); if (d0 > R-.6){ player.position.x *= (R-.6)/d0; player.position.z *= (R-.6)/d0; }
    stepT += dt; if (stepT > .28){ stepT = 0; sfx.step(); }
  }
  const P = player.userData, sw = moving ? Math.sin(t*12)*.6 : 0;
  P.legL.rotation.x = sw; P.legR.rotation.x = -sw;
  P.armL.rotation.x = -sw*.8; P.armR.rotation.x = sw*.5;
  player.position.y = moving ? Math.abs(Math.sin(t*12))*.06 : 0;
  P.body.position.y = P.baseY + (moving ? 0 : Math.sin(t*2)*.015);
  marker.scale.setScalar(1 + Math.sin(t*6)*.12);
  ambTick();
  extraAnims.forEach(f=>f(t, dt));
  if (state === 'rama') ramaTick(t, dt);
  if (state === 'rehat') rehatTick(dt);
  hens.forEach(h=>{ const s = Math.sin(t*3+h.ph); h.head.position.y = .72 - Math.max(0, s)*.2; h.head.rotation.x = Math.max(0, s)*.8; });
  STATIONS.forEach(st=>{ st.ring.scale.setScalar(1 + Math.sin(t*3)*.06); st.label.position.y = 3.1 + Math.sin(t*2)*.08; });

  if (state === 'hub' && playing){
    for (const st of STATIONS){
      const d = Math.hypot(player.position.x-st.x, player.position.z-st.z);
      if (d < 1.3 && !st.cool){ st.cool = true; openStation(st); break; }
      if (d > 2.2) st.cool = false;
    }
  }
  if (state === 'siram' && si.pour && !si.busy){
    si.level += SI.speed[level.n-1]*dt; si.dripT += dt;
    if (si.dripT > .12){ si.dripT = 0; sfx.drip(); }
    if (si.level > si.hi) siOverflow(); else drawSi();
  }

  for (let i = fruits.length-1; i >= 0; i--){
    const f = fruits[i];
    if (f.pop){ f.pop += dt*3; f.g.position.y += dt*4; f.g.scale.setScalar(Math.max(0, 1-f.pop)); if (f.pop >= 1){ scene.remove(f.g); fruits.splice(i,1); } continue; }
    const wob = level.bob && mode === 'warna' ? Math.sin(t*1.3+f.ph)*.9 : 0;
    f.g.position.x = f.x + wob; f.g.position.y = .6 + Math.sin(t*2+f.ph)*.08;
    f.g.rotation.y += dt*.8;
    if (f.shake > 0){ f.shake -= dt; f.g.position.y += Math.abs(Math.sin(f.shake*30))*.25; }
    if (!playing || state !== 'buah') continue;
    const d = Math.hypot(player.position.x-f.g.position.x, player.position.z-f.g.position.z);
    if (d < .95 && !f.cool){
      if (mode === 'arahan'){ if (!between) pickArahan(f); }
      else if (between) {}
      else if (f.key === goalKey){ f.pop = .001; got++; roundGot++; sfx.ok(); updProg(); if (roundGot >= level.target) warnaRoundDone(); }
      else { f.cool = true; f.shake = .5; wrong++; roundWrong++; sfx.no(); toast(T('Itu ') + L(f.key) + T('. Cari ') + L(goalKey) + '!'); }
    } else if (d > 1.6) f.cool = false;
  }

  camT.set(player.position.x, 9.5, player.position.z + 10.5);
  camera.position.lerp(camT, Math.min(1, dt*4));
  camera.lookAt(player.position.x, .8, player.position.z);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
camera.position.set(0, 9.5, 10.5);
tick();
