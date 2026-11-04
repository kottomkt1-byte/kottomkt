import * as THREE from 'three';
import { createEyewearModel } from './eyewear-model.js';

function createStudioEnvironment(renderer) {
  const studio = new THREE.Scene();
  const resources = [];
  function surface(geometry, color, position, size, side = THREE.FrontSide) {
    const material = new THREE.MeshBasicMaterial({ color, side });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position); mesh.scale.set(...size); mesh.lookAt(0, 0, 0);
    studio.add(mesh); resources.push(geometry, material);
  }
  surface(new THREE.SphereGeometry(40, 32, 16), new THREE.Color(.09, .09, .085), [0, 0, 0], [1, 1, 1], THREE.BackSide);
  // A dark neutral studio with broad rectangular softboxes gives the thin
  // polished rims readable highlights without a textured or rainbow reflection.
  surface(new THREE.PlaneGeometry(1, 1), new THREE.Color(5, 5, 5), [-10, 12, 8], [14, 7, 1]);
  surface(new THREE.PlaneGeometry(1, 1), new THREE.Color(3.5, 3.5, 3.5), [12, 5, 3], [6, 14, 1]);
  surface(new THREE.PlaneGeometry(1, 1), new THREE.Color(4, 4, 4), [0, 15, -3], [8, 5, 1]);
  surface(new THREE.PlaneGeometry(1, 1), new THREE.Color(2.5, 2.5, 2.5), [-3, 3, 15], [8, 10, 1]);
  surface(new THREE.PlaneGeometry(1, 1), new THREE.Color(5, 5, 5), [-12, 2, 8], [3, 12, 1]);
  surface(new THREE.PlaneGeometry(1, 1), new THREE.Color(5, 5, 5), [12, 3, -7], [10, 4, 1]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  try { return pmrem.fromScene(studio, 0); }
  finally { resources.forEach(resource => resource.dispose()); pmrem.dispose(); }
}

/** Local CC BY studio asset; loading finishes before GPU allocation begins. */
export async function createEyewearViewer(host, { gsap, initialView = 0, signal } = {}) {
  const stage = host.querySelector('[data-eyewear-stage]');
  const poster = host.querySelector('.mi-product-poster');
  const play = host.querySelector('[data-eyewear-play]');
  const reset = host.querySelector('[data-eyewear-reset]');
  const finishes = [...host.querySelectorAll('[data-eyewear-finish]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const model = await createEyewearModel({ signal });
  if (signal?.aborted || !host.isConnected) {
    model.dispose();
    throw new DOMException('Eyewear loading aborted', 'AbortError');
  }
  let renderer, environment, floorGeometry, floorMaterial, key, observer, resizeObserver, tween;
  const handlers = [];
  try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e7e3d9');
    scene.fog = new THREE.Fog('#e7e3d9', 520, 1100);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'low-power' });
    if (!context) throw new Error('3D scene unavailable');
    renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.transmissionResolutionScale = .75;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    canvas.className = 'mi-product-canvas';
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '입체 안경. 드래그하거나 방향키로 돌려보고, Home 키로 처음 각도로 돌아갑니다.');
    canvas.setAttribute('aria-describedby', 'mi-product-instruction');
    const camera = new THREE.PerspectiveCamera(30, 1, .5, 1600);
    environment = createStudioEnvironment(renderer);
    scene.environment = environment.texture;
    scene.environmentIntensity = 1.0;
    const hemi = new THREE.HemisphereLight('#fffaf2', '#777169', .35);
    scene.add(hemi);
    key = new THREE.DirectionalLight('#fffaf2', 2.3);
    key.position.set(-100, 210, 140);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -140, right: 140, top: 140, bottom: -140, near: 1, far: 600 });
    key.shadow.normalBias = .18;
    key.shadow.bias = -.00003;
    key.shadow.radius = 4;
    key.shadow.blurSamples = 8;
    scene.add(key);
    const fill = new THREE.DirectionalLight('#e5efff', .35);
    fill.position.set(140, 35, 40);
    scene.add(fill);
    const rim = new THREE.DirectionalLight('#fff8e9', .6);
    rim.position.set(20, 80, -120);
    scene.add(rim);
    floorGeometry = new THREE.PlaneGeometry(2000, 2000);
    floorMaterial = new THREE.MeshStandardMaterial({ color: '#d5d0c5', roughness: 1, metalness: 0 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -43;
    floor.receiveShadow = true;
    scene.add(floor);
    const pivot = new THREE.Group();
    pivot.add(model.group);
    scene.add(pivot);
    const pose = { x: .14, y: -.48, z: -.025, distance: 365, targetX: 0, targetY: -4, targetZ: 0 };
    const views = [
      { x: .14, y: -.48, z: -.025, distance: 365, targetX: 0, targetY: -4, targetZ: 0 },
      { x: .22, y: -1.05, z: -.025, distance: 330, targetX: 0, targetY: -3, targetZ: 0 },
      { x: .08, y: -.08, z: .018, distance: 285, targetX: 0, targetY: -3, targetZ: 45 },
    ];
    let disposed = false, visible = false, active = host.dataset.mode === 'interactive';
    let frame = 0, renderCount = 0, lastTime = 0, phase = 0;
    let playing = !reduced.matches, view = initialView, finish = 'gold', pointer = null;
    let reducedPreference = reduced.matches;
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
      host.dataset.motion = reduced.matches ? 'reduced' : active && playing ? 'playing' : 'paused';
      finishes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.eyewearFinish === finish)));
    }
    const rotation = new THREE.Matrix4();
    const cameraDirection = new THREE.Vector3(0, .10, 1).normalize();
    const cameraUp = new THREE.Vector3(0, 1, -.10).normalize();
    const target = new THREE.Vector3();
    let actualCameraDistance = pose.distance;
    function frameModel() {
      // Rest the actual lowest source vertex on the studio floor, rather than
      // hovering a bounding box above it. No source geometry is changed.
      rotation.makeRotationFromEuler(pivot.rotation);
      const e = rotation.elements, vertices = model.contactPoints;
      let lowest = Infinity;
      for (let i = 0; i < vertices.length; i += 3) {
        lowest = Math.min(lowest, e[1] * vertices[i] + e[5] * vertices[i + 1] + e[9] * vertices[i + 2]);
      }
      pivot.position.y = floor.position.y - lowest + .3;
      const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), tanX = tanY * camera.aspect;
      let fit = 0;
      for (let i = 0; i < vertices.length; i += 3) {
        const a = vertices[i], b = vertices[i + 1], c = vertices[i + 2];
        const x = e[0] * a + e[4] * b + e[8] * c - pose.targetX;
        const y = e[1] * a + e[5] * b + e[9] * c + pivot.position.y - pose.targetY;
        const z = e[2] * a + e[6] * b + e[10] * c - pose.targetZ;
        const vertical = y * cameraUp.y + z * cameraUp.z;
        const forward = y * cameraDirection.y + z * cameraDirection.z;
        fit = Math.max(fit, forward + Math.abs(x) / (tanX * .86), forward + Math.abs(vertical) / (tanY * .82));
      }
      actualCameraDistance = Math.max(pose.distance, fit);
      target.set(pose.targetX, pose.targetY, pose.targetZ);
      camera.position.copy(target).addScaledVector(cameraDirection, actualCameraDistance);
      camera.lookAt(target);
    }
    function draw(time = 0) {
      frame = 0;
      if (!disposed && playing && reduced.matches) syncMotionPreference();
      if (disposed || !active || !visible || document.hidden || stage.dataset.state !== 'ready') return;
      const dt = Math.min((time - lastTime) / 1000 || 0, .05);
      lastTime = time;
      if (playing) phase += dt * .37;
      pivot.rotation.set(pose.x + (playing ? Math.sin(phase * .7) * .025 : 0), pose.y + (playing ? Math.sin(phase) * .23 : 0), pose.z);
      frameModel();
      renderer.render(scene, camera);
      renderCount++;
      if (playing) frame = requestAnimationFrame(draw);
    }
    function requestRender() {
      if (!frame && !disposed && active && visible && !document.hidden && stage.dataset.state === 'ready') frame = requestAnimationFrame(draw);
    }
    function setActive(value) {
      if (disposed) return;
      active = Boolean(value) && stage.dataset.state === 'ready';
      canvas.tabIndex = active ? 0 : -1;
      if (active) {
        canvas.removeAttribute('aria-hidden');
        poster.setAttribute('aria-hidden', 'true');
      } else {
        canvas.setAttribute('aria-hidden', 'true');
        poster.removeAttribute('aria-hidden');
      }
      if (active && visible && !document.hidden) {
        lastTime = performance.now();
        tween?.resume(); requestRender();
      } else {
        cancelAnimationFrame(frame); frame = 0; tween?.pause();
        if (pointer && canvas.hasPointerCapture(pointer.id)) canvas.releasePointerCapture(pointer.id);
        pointer = null; canvas.classList.remove('is-dragging');
      }
      // Studio mode suspends rendering without changing the play/pause choice.
      updateControls();
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
        if (!active || !visible || document.hidden) tween.pause();
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
      if (!active || event.button !== 0) return;
      tween?.kill(); setPlaying(false);
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-dragging');
    });
    listen(canvas, 'pointermove', event => {
      if (!active || !pointer || pointer.id !== event.pointerId) return;
      pose.y += (event.clientX - pointer.x) * .009;
      pose.x = THREE.MathUtils.clamp(pose.x + (event.clientY - pointer.y) * .006, -.65, .65);
      pointer.x = event.clientX; pointer.y = event.clientY; requestRender();
    });
    const endDrag = () => { pointer = null; canvas.classList.remove('is-dragging'); };
    listen(canvas, 'pointerup', endDrag); listen(canvas, 'pointercancel', endDrag); listen(canvas, 'lostpointercapture', endDrag);
    listen(canvas, 'keydown', event => {
      if (!active || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
      event.preventDefault(); tween?.kill(); setPlaying(false);
      if (event.key === 'Home') selectView(view);
      else if (event.key === 'ArrowLeft') pose.y -= .14;
      else if (event.key === 'ArrowRight') pose.y += .14;
      else pose.x = THREE.MathUtils.clamp(pose.x + (event.key === 'ArrowUp' ? -.09 : .09), -.65, .65);
      requestRender();
    });
    listen(document, 'visibilitychange', () => {
      if (document.hidden || !active) { cancelAnimationFrame(frame); frame = 0; tween?.pause(); }
      else if (visible) { lastTime = performance.now(); tween?.resume(); requestRender(); }
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
      setActive(false);
      host.querySelector('[data-eyewear-tools]').hidden = true;
      host.dispatchEvent(new Event('eyewearunavailable'));
    });
    resizeObserver = new ResizeObserver(resize);
    observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncMotionPreference();
      if (active && visible && !document.hidden) { lastTime = performance.now(); tween?.resume(); requestRender(); }
      else { cancelAnimationFrame(frame); frame = 0; tween?.pause(); }
    }, { threshold: .05 });
    stage.append(canvas);
    stage.dataset.state = 'ready';
    host.querySelector('[data-eyewear-tools]').hidden = false;
    stage.__eyewearState = () => ({ view, playing, active, visible, renderCount, rotation: { x: pivot.rotation.x, y: pivot.rotation.y }, finish, reduced: reduced.matches, cameraDistance: pose.distance, actualCameraDistance, source: 'Khronos Sunglasses GLB' });
    setActive(active); selectView(initialView, true); resize();
    resizeObserver.observe(stage); observer.observe(stage);
    function dispose() {
        if (disposed) return;
        disposed = true; cancelAnimationFrame(frame); tween?.kill(); observer.disconnect(); resizeObserver.disconnect();
        handlers.forEach(remove => remove()); delete stage.__eyewearState;
        model.dispose(); floorGeometry.dispose(); floorMaterial.dispose(); environment.dispose();
        key.shadow.dispose(); renderer.dispose();
        if (!context.isContextLost()) renderer.forceContextLoss();
        canvas.remove();
    }
    if (signal) listen(signal, 'abort', dispose, { once: true });
    return { selectView, setActive, dispose };
  } catch (error) {
    tween?.kill(); observer?.disconnect(); resizeObserver?.disconnect();
    handlers.forEach(remove => remove());
    model.dispose(); floorGeometry?.dispose(); floorMaterial?.dispose(); environment?.dispose();
    key?.shadow.dispose();
    if (renderer) {
      const activeContext = renderer.getContext();
      renderer.dispose();
      if (!activeContext.isContextLost()) renderer.forceContextLoss();
      renderer.domElement.remove();
    }
    poster.removeAttribute('aria-hidden');
    host.querySelector('[data-eyewear-tools]').hidden = true;
    delete stage.__eyewearState;
    throw error;
  }
}
