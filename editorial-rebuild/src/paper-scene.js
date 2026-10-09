/*
 * KOTTO / Paper study
 * A single photographed print, projected over a gently curved sheet.
 * Scroll lets the sheet settle; pointer movement shifts grazing light.
 * No rendering loop runs while the page and pointer are still.
 */
const VERTEX = `
precision highp float;
attribute vec2 aPosition;
attribute vec2 aUv;
uniform vec2 uPointer;
uniform float uProgress;
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  float release = smoothstep(0.0, 0.94, uProgress);
  float curvature = mix(0.23, 0.035, release);
  float twist = uPointer.y * 0.025;
  float x = aPosition.x;
  float y = aPosition.y;
  float ridge = x + 0.28 + uPointer.x * 0.07;
  float z = curvature * (ridge * ridge - 0.45) + twist * x * y;
  float dx = 2.0 * curvature * ridge + twist * y;
  float dy = twist * x;
  vNormal = normalize(vec3(-dx * 0.65, -dy * 0.65, 1.0));
  vUv = aUv;
  // The overscan keeps the photograph edge clean even at maximum curvature.
  vec2 position = aPosition * 1.075;
  position.x += uPointer.x * 0.012 + z * 0.042;
  position.y += uPointer.y * 0.008 - z * 0.035;
  float perspective = 1.0 + z * 0.095;
  gl_Position = vec4(position / perspective, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
uniform sampler2D uImage;
uniform vec2 uCover;
uniform vec2 uPointer;
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vec2 uv = (vUv - 0.5) * uCover + 0.5;
  vec3 paper = texture2D(uImage, uv).rgb;
  vec3 light = normalize(vec3(-0.42 + uPointer.x * 0.18, 0.5 + uPointer.y * 0.10, 1.7));
  float diffuse = max(dot(normalize(vNormal), light), 0.0);
  float shade = 0.81 + diffuse * 0.20;
  // Uncoated stock: the grazing highlight responds to the existing paper tone,
  // so printed burgundy stays ink rather than becoming a glossy plastic sheet.
  float stock = smoothstep(0.24, 0.86, dot(paper, vec3(0.299, 0.587, 0.114)));
  float grazing = pow(max(dot(reflect(-light, normalize(vNormal)), vec3(0.0, 0.0, 1.0)), 0.0), 12.0);
  vec3 reflected = vec3(1.0, 0.975, 0.92) * grazing * stock * 0.037;
  gl_FragColor = vec4(paper * shade + reflected, 1.0);
}`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Enhance an existing accessible image; no GSAP instance is owned here.
 * Main ScrollTrigger should call scene.setProgress(self.progress).
 * @param {HTMLElement} element wrapper containing its final native <img>
 * @returns {{setProgress: Function, destroy: Function, diagnostics: Object}}
 */
export function createPaperScene(element) {
  const image = element?.querySelector('img');
  const diagnostics = { mode: 'image', frames: 0, width: 0, height: 0, maxRenderMs: 0 };
  const empty = { setProgress() {}, destroy() {}, diagnostics };
  if (!element || !image) return empty;

  const eligibility = window.matchMedia('(min-width: 841px) and (hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'paper-scene-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');

  let gl;
  let program;
  let texture;
  let positionBuffer;
  let uvBuffer;
  let indexBuffer;
  let uniforms;
  let count = 0;
  let frame = 0;
  let disposed = false;
  let active = false;
  let visible = true;
  let previousTime = 0;
  let slowFrames = 0;
  let lastWidth = 0;
  let lastHeight = 0;
  const current = { x: 0, y: 0, progress: 0 };
  const target = { x: 0, y: 0, progress: 0 };

  const canRender = () => active && visible && !document.hidden && !disposed;
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
  const wake = () => {
    if (canRender() && !frame) frame = requestAnimationFrame(render);
  };

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error('Paper shader could not be compiled');
    }
    return shader;
  }

  function release() {
    stop();
    active = false;
    element.classList.remove('paper-scene-ready');
    canvas.remove();
    if (gl && !gl.isContextLost()) {
      if (texture) gl.deleteTexture(texture);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (uvBuffer) gl.deleteBuffer(uvBuffer);
      if (indexBuffer) gl.deleteBuffer(indexBuffer);
      if (program) gl.deleteProgram(program);
    }
    texture = positionBuffer = uvBuffer = indexBuffer = program = null;
    diagnostics.mode = 'image';
  }

  function size() {
    if (!active) return;
    const bounds = element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5,
      Math.sqrt(1_200_000 / (bounds.width * bounds.height)));
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (width === lastWidth && height === lastHeight) return;
    lastWidth = canvas.width = width;
    lastHeight = canvas.height = height;
    diagnostics.width = width;
    diagnostics.height = height;
    gl.viewport(0, 0, width, height);
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const viewportAspect = bounds.width / bounds.height;
    gl.uniform2f(uniforms.cover,
      Math.min(viewportAspect / imageAspect, 1),
      Math.min(imageAspect / viewportAspect, 1));
    wake();
  }

  function render(now) {
    frame = 0;
    if (!canRender()) return;
    const elapsed = previousTime ? Math.min(now - previousTime, 64) : 16.67;
    previousTime = now;
    const ease = 1 - Math.exp(-elapsed / 125);
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    current.progress += (target.progress - current.progress) * ease;
    const remaining = Math.abs(target.x - current.x) + Math.abs(target.y - current.y)
      + Math.abs(target.progress - current.progress);
    const started = performance.now();
    gl.uniform2f(uniforms.pointer, current.x, current.y);
    gl.uniform1f(uniforms.progress, current.progress);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
    const renderMs = performance.now() - started;
    diagnostics.maxRenderMs = Math.max(diagnostics.maxRenderMs, renderMs);
    diagnostics.frames++;
    if (!element.classList.contains('paper-scene-ready')) element.classList.add('paper-scene-ready');
    // Sustained slow delivery gets the fully composed photographic fallback.
    // This is a conservative responsiveness guard, not a GPU benchmark.
    if (elapsed > 48 && remaining > 0.004) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 36) {
      release();
      diagnostics.mode = 'image-performance-fallback';
      return;
    }
    if (remaining > 0.0003) wake();
    else previousTime = 0;
  }

  async function start() {
    if (disposed || active || !eligibility.matches || reducedMotion.matches) return;
    try {
      if (!image.complete) await image.decode();
      if (!image.naturalWidth || disposed || active || !eligibility.matches || reducedMotion.matches) return;
      gl = canvas.getContext('webgl', {
        alpha: false, antialias: false, depth: false, stencil: false,
        preserveDrawingBuffer: false, powerPreference: 'low-power',
      });
      if (!gl) return;
      const vertex = compile(gl.VERTEX_SHADER, VERTEX);
      const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Paper shader link failed');
      gl.useProgram(program);

      // 48 × 36 cells: less than 3,500 triangles, one texture, one draw call.
      const cols = 48;
      const rows = 36;
      const positions = [];
      const uvs = [];
      const indices = [];
      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          positions.push(col / cols * 2 - 1, row / rows * 2 - 1);
          uvs.push(col / cols, 1 - row / rows);
        }
      }
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const a = row * (cols + 1) + col;
          const b = a + cols + 1;
          indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
      }
      const bindAttribute = (name, data) => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        const location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
        return buffer;
      };
      positionBuffer = bindAttribute('aPosition', positions);
      uvBuffer = bindAttribute('aUv', uvs);
      indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      count = indices.length;

      texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
      uniforms = {
        pointer: gl.getUniformLocation(program, 'uPointer'),
        progress: gl.getUniformLocation(program, 'uProgress'),
        cover: gl.getUniformLocation(program, 'uCover'),
      };
      active = true;
      diagnostics.mode = 'webgl';
      lastWidth = lastHeight = 0;
      element.append(canvas);
      size();
      wake();
    } catch (error) {
      // The image is the finished visual, so unavailable WebGL is not an error UI.
      release();
      diagnostics.fallbackReason = error instanceof Error ? error.message : 'WebGL initialization unavailable';
    }
  }

  function move(event) {
    if (!active || event.pointerType === 'touch') return;
    const bounds = element.getBoundingClientRect();
    target.x = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
    target.y = clamp(1 - (event.clientY - bounds.top) / bounds.height * 2, -1, 1);
    wake();
  }
  function leave() { target.x = target.y = 0; wake(); }
  function environmentChange() {
    if (!eligibility.matches || reducedMotion.matches) release();
    else start();
  }
  function visibilityChange() { if (document.hidden) stop(); else { previousTime = 0; wake(); } }
  function contextLost(event) { event.preventDefault(); release(); diagnostics.mode = 'image-context-fallback'; }

  const resize = new ResizeObserver(size);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { previousTime = 0; wake(); }
    else stop();
  }, { rootMargin: '80px' });
  resize.observe(element);
  intersection.observe(element);
  element.addEventListener('pointermove', move, { passive: true });
  element.addEventListener('pointerleave', leave, { passive: true });
  document.addEventListener('visibilitychange', visibilityChange);
  eligibility.addEventListener('change', environmentChange);
  reducedMotion.addEventListener('change', environmentChange);
  canvas.addEventListener('webglcontextlost', contextLost);
  start();

  return {
    diagnostics,
    setProgress(value) {
      if (disposed) return;
      target.progress = clamp(Number(value) || 0, 0, 1);
      if (active) wake();
    },
    destroy() {
      disposed = true;
      release();
      resize.disconnect();
      intersection.disconnect();
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', visibilityChange);
      eligibility.removeEventListener('change', environmentChange);
      reducedMotion.removeEventListener('change', environmentChange);
      canvas.removeEventListener('webglcontextlost', contextLost);
    },
  };
}
