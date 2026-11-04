import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createEyewearModel } from './eyewear-model.js';

/** A locally lit product scene. No network assets, tracking, or continuous off-screen work. */
export function createEyewearViewer(host, { gsap, initialView = 0 } = {}) {
  const stage = host.querySelector('[data-eyewear-stage]');
  const poster = host.querySelector('.mi-product-poster');
  const play = host.querySelector('[data-eyewear-play]');
  const reset = host.querySelector('[data-eyewear-reset]');
  const finishes = [...host.querySelectorAll('[data-eyewear-finish]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e7e3d9');
  scene.fog = new THREE.Fog('#e7e3d9', 520, 1100);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'low-power' });
  if (!context) throw new Error('3D scene unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.transmissionResolutionScale = .5;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas.className = 'mi-product-canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', '입체 안경. 드래그하거나 방향키로 돌려보고, Home 키로 처음 각도로 돌아갑니다.');
  canvas.setAttribute('aria-describedby', 'mi-product-instruction');
  const camera = new THREE.PerspectiveCamera(30, 1, .5, 1600);
  const environmentScene = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(environmentScene, .035);
  scene.environment = environment.texture;
  scene.environmentIntensity = .8;
  environmentScene.dispose();
  pmrem.dispose();
  const hemi = new THREE.HemisphereLight('#fff8e9', '#6c665a', .7);
  scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff6e7', 2.2);
  key.position.set(-100, 180, 155);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -180, right: 180, top: 180, bottom: -180, near: 1, far: 600 });
  key.shadow.normalBias = .08;
  key.shadow.bias = -.00015;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#e5efff', .65);
  fill.position.set(140, 35, 40);
  scene.add(fill);
  const rim = new THREE.DirectionalLight('#fff7de', 1.1);
  rim.position.set(20, 80, -120);
  scene.add(rim);
  const floorGeometry = new THREE.PlaneGeometry(2000, 2000);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#e7e3d9', roughness: 1, metalness: 0 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -43;
  floor.receiveShadow = true;
  scene.add(floor);
  const model = createEyewearModel();
  const pivot = new THREE.Group();
  model.group.position.z = 43;
  pivot.add(model.group);
  scene.add(pivot);
  const pose = { x: .13, y: -.38, z: -.035, distance: 305, targetX: 0, targetY: -3, targetZ: 0 };
  const views = [
    { x: .13, y: -.38, z: -.035, distance: 305, targetX: 0, targetY: -3, targetZ: 0 },
    { x: .20, y: -1.00, z: -.035, distance: 275, targetX: -3, targetY: -2, targetZ: -3 },
    { x: .07, y: -.22, z: .025, distance: 195, targetX: 22, targetY: 2, targetZ: 33 },
  ];
  let disposed = false, visible = false, frame = 0, renderCount = 0, lastTime = 0, phase = 0;
  let playing = !reduced.matches, view = initialView, finish = 'black', pointer = null, tween;
  let reducedPreference = reduced.matches;
  const handlers = [];
  const listen = (target, name, handler, options) => {
    target.addEventListener(name, handler, options);
    handlers.push(() => target.removeEventListener(name, handler, options));
  };
  function updateControls() {
    play.setAttribute('aria-pressed', String(playing));
    play.setAttribute('aria-label', playing ? '안경 자동 모션 멈추기' : '안경 자동 모션 재생');
    play.querySelector('span').textContent = playing ? '모션 멈춤' : '모션 재생';
    play.dataset.playing = String(playing);
    play.disabled = reduced.matches;
    host.dataset.motion = reduced.matches ? 'reduced' : playing ? 'playing' : 'paused';
    finishes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.eyewearFinish === finish)));
  }
  function draw(time = 0) {
    frame = 0;
    if (!disposed && playing && reduced.matches) syncMotionPreference();
    if (disposed || !visible || document.hidden || stage.dataset.state !== 'ready') return;
    const dt = Math.min((time - lastTime) / 1000 || 0, .05);
    lastTime = time;
    if (playing) phase += dt * .37;
    pivot.rotation.set(pose.x + (playing ? Math.sin(phase * .7) * .025 : 0), pose.y + (playing ? Math.sin(phase) * .23 : 0), pose.z);
    camera.position.set(pose.targetX, 24 + pose.targetY, pose.distance + pose.targetZ);
    camera.lookAt(pose.targetX, pose.targetY, pose.targetZ);
    renderer.render(scene, camera);
    renderCount++;
    if (playing) frame = requestAnimationFrame(draw);
  }
  function requestRender() {
    if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function setPlaying(value) {
    playing = Boolean(value) && !reduced.matches;
    // Freeze the current apparent pose rather than snapping away from the ambient arc.
    if (!playing) { pose.y = pivot.rotation.y; pose.x = pivot.rotation.x; phase = 0; }
    updateControls();
    requestRender();
  }
  function selectView(index, immediate = false) {
    view = Math.max(0, Math.min(2, Number(index) || 0));
    stage.dataset.view = String(view);
    tween?.kill();
    phase = 0;
    if (reduced.matches || immediate || !gsap) {
      Object.assign(pose, views[view]);
      requestRender();
    } else {
      tween = gsap.to(pose, { ...views[view], duration: 1.25, ease: 'power3.inOut', onUpdate: requestRender });
      if (!visible || document.hidden) tween.pause();
    }
  }
  function resize() {
    const width = stage.clientWidth, height = stage.clientHeight;
    if (!width || !height || disposed) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the whole frame comfortably inside the narrow portrait viewport.
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(30) / 2) * 1.18 / Math.min(camera.aspect, 1.18)));
    camera.updateProjectionMatrix();
    requestRender();
  }
  listen(play, 'click', () => setPlaying(!playing));
  listen(reset, 'click', () => { selectView(view); });
  finishes.forEach(button => listen(button, 'click', () => {
    finish = button.dataset.eyewearFinish;
    model.setFinish(finish);
    updateControls(); requestRender();
  }));
  listen(canvas, 'pointerdown', event => {
    if (event.button !== 0) return;
    tween?.kill(); setPlaying(false);
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-dragging');
  });
  listen(canvas, 'pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    pose.y += (event.clientX - pointer.x) * .009;
    pose.x = THREE.MathUtils.clamp(pose.x + (event.clientY - pointer.y) * .006, -.65, .65);
    pointer.x = event.clientX; pointer.y = event.clientY; requestRender();
  });
  const endDrag = () => { pointer = null; canvas.classList.remove('is-dragging'); };
  listen(canvas, 'pointerup', endDrag); listen(canvas, 'pointercancel', endDrag); listen(canvas, 'lostpointercapture', endDrag);
  listen(canvas, 'keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault(); tween?.kill(); setPlaying(false);
    if (event.key === 'Home') selectView(view);
    else if (event.key === 'ArrowLeft') pose.y -= .14;
    else if (event.key === 'ArrowRight') pose.y += .14;
    else pose.x = THREE.MathUtils.clamp(pose.x + (event.key === 'ArrowUp' ? -.09 : .09), -.65, .65);
    requestRender();
  });
  listen(document, 'visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; tween?.pause(); }
    else if (visible && !document.hidden) { lastTime = performance.now(); tween?.resume(); requestRender(); }
  });
  function syncMotionPreference() {
    const changed = reducedPreference !== reduced.matches;
    reducedPreference = reduced.matches;
    if (reduced.matches && (playing || changed)) {
      tween?.kill(); setPlaying(false); selectView(view, true);
    }
    updateControls();
  }
  listen(reduced, 'change', syncMotionPreference);
  // GSAP rebuilds the page's scroll effects at media changes. Reconcile the
  // viewer after that cycle too, including changes made while it is off-screen.
  gsap?.addEventListener('matchMedia', syncMotionPreference);
  handlers.push(() => gsap?.removeEventListener('matchMedia', syncMotionPreference));
  listen(canvas, 'webglcontextlost', event => {
    event.preventDefault(); cancelAnimationFrame(frame); frame = 0; tween?.kill();
    stage.dataset.state = 'fallback';
    poster.removeAttribute('aria-hidden');
    host.querySelector('[data-eyewear-tools]').hidden = true;
    canvas.tabIndex = -1;
  });
  const resizeObserver = new ResizeObserver(resize);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncMotionPreference();
    if (visible && !document.hidden) { lastTime = performance.now(); tween?.resume(); requestRender(); }
    else { cancelAnimationFrame(frame); frame = 0; tween?.pause(); }
  }, { threshold: .05 });
  stage.append(canvas);
  stage.dataset.state = 'ready';
  poster.setAttribute('aria-hidden', 'true');
  host.querySelector('[data-eyewear-tools]').hidden = false;
  stage.__eyewearState = () => ({ view, playing, visible, renderCount, rotation: { x: pivot.rotation.x, y: pivot.rotation.y }, finish, reduced: reduced.matches, cameraDistance: pose.distance });
  updateControls(); selectView(initialView, true); resize();
  resizeObserver.observe(stage); observer.observe(stage);
  return {
    selectView,
    dispose() {
      if (disposed) return;
      disposed = true; cancelAnimationFrame(frame); tween?.kill(); observer.disconnect(); resizeObserver.disconnect();
      handlers.forEach(remove => remove()); delete stage.__eyewearState;
      model.dispose(); floorGeometry.dispose(); floorMaterial.dispose(); environment.dispose();
      key.shadow.dispose(); renderer.dispose();
      if (!context.isContextLost()) renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
