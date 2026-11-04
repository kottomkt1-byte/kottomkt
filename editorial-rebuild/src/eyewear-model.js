import * as THREE from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

// Millimetres. Front faces +Z; the bridge stays at the origin so a viewer can
// orbit the product without moving its front plane. This is an original,
// unbranded construction study, not a measured replica of a portfolio product.
const EYE_OFFSET = 32.7;
const FRONT_WRAP = 0.00112;
function frontContour() {
  const path = new THREE.Shape();
  // One continuous acetate front: the bridge and hinge ends are part of its
  // outline, not separate slabs intersecting the spectacle rims.
  path.moveTo(-8.9, 21.2);
  path.bezierCurveTo(-5.5, 20.8, -5.2, 17.6, 0, 17.6);
  path.bezierCurveTo(5.2, 17.6, 5.5, 20.8, 8.9, 21.2);
  path.bezierCurveTo(21.5, 22.6, 41.6, 22.9, 54.8, 21.8);
  path.bezierCurveTo(59.6, 21.4, 61.9, 20.0, 63.1, 17.7);
  path.bezierCurveTo(65.0, 17.3, 68.4, 17.4, 70.0, 16.5);
  path.quadraticCurveTo(71.0, 16.0, 71.0, 14.1);
  path.lineTo(70.8, 10.8);
  path.quadraticCurveTo(67.5, 10.2, 63.1, 11.7);
  path.lineTo(62.7, -5.6);
  path.bezierCurveTo(62.2, -12.4, 60.5, -16.7, 55.2, -19.2);
  path.bezierCurveTo(47.0, -23.1, 33.4, -24.0, 21.4, -23.6);
  path.bezierCurveTo(14.4, -23.4, 10.0, -21.9, 7.9, -17.2);
  path.bezierCurveTo(4.7, -10.8, 3.3, 1.9, 2.9, 12.7);
  path.quadraticCurveTo(0, 14.2, -2.9, 12.7);
  path.bezierCurveTo(-3.3, 1.9, -4.7, -10.8, -7.9, -17.2);
  path.bezierCurveTo(-10.0, -21.9, -14.4, -23.4, -21.4, -23.6);
  path.bezierCurveTo(-33.4, -24.0, -47.0, -23.1, -55.2, -19.2);
  path.bezierCurveTo(-60.5, -16.7, -62.2, -12.4, -62.7, -5.6);
  path.lineTo(-63.1, 11.7);
  path.quadraticCurveTo(-67.5, 10.2, -70.8, 10.8);
  path.lineTo(-71.0, 14.1);
  path.quadraticCurveTo(-71.0, 16.0, -70.0, 16.5);
  path.bezierCurveTo(-68.4, 17.4, -65.0, 17.3, -63.1, 17.7);
  path.bezierCurveTo(-61.9, 20.0, -59.6, 21.4, -54.8, 21.8);
  path.bezierCurveTo(-41.6, 22.9, -21.5, 22.6, -8.9, 21.2);
  path.closePath();
  for (const side of [-1, 1]) {
    const points = lensContour().getPoints(16).map(p => new THREE.Vector2(side * (p.x + EYE_OFFSET), p.y));
    const hole = new THREE.Path(points);
    hole.closePath();
    path.holes.push(hole);
  }
  return path;
}

function lensContour() {
  const path = new THREE.Path();
  path.moveTo(-21.9, 17.2);
  path.bezierCurveTo(-25.1, 16.9, -26.2, 15.1, -25.8, 10.4);
  path.bezierCurveTo(-25.4, 0.8, -24.3, -10.0, -21.8, -14.9);
  path.bezierCurveTo(-20.1, -18.6, -16.1, -19.8, -10.8, -19.9);
  path.bezierCurveTo(0.6, -20.4, 13.0, -19.4, 20.6, -16.1);
  path.bezierCurveTo(24.5, -14.3, 26.0, -10.3, 26.3, -4.6);
  path.lineTo(26.6, 11.9);
  path.bezierCurveTo(26.6, 16.2, 24.8, 17.7, 20.7, 18.0);
  path.bezierCurveTo(8.4, 18.9, -10.3, 18.6, -21.9, 17.2);
  path.closePath();
  return path;
}

function surfaceZ(x, y) {
  return -FRONT_WRAP * x * x + 0.00014 * y * y;
}

function wrapSolid(geometry, side = 1, offset = 0) {
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = side * (positions.getX(i) + offset);
    const y = positions.getY(i);
    positions.setXYZ(i, x, y, positions.getZ(i) - 2.4 + surfaceZ(x, y));
  }
  // A mirrored non-indexed extrusion needs its winding reversed as well.
  if (side < 0) {
    for (const attribute of Object.values(geometry.attributes)) {
      const values = attribute.array;
      for (let i = 0; i < attribute.count; i += 3) {
        for (let component = 0; component < attribute.itemSize; component++) {
          const a = (i + 1) * attribute.itemSize + component;
          const b = (i + 2) * attribute.itemSize + component;
          [values[a], values[b]] = [values[b], values[a]];
        }
      }
      attribute.needsUpdate = true;
    }
  }
  geometry.computeVertexNormals();
  const smooth = toCreasedNormals(geometry, Math.PI / 3);
  if (smooth !== geometry) geometry.dispose();
  smooth.computeBoundingSphere();
  return smooth;
}

function extrude(shape, options = {}) {
  return new THREE.ExtrudeGeometry(shape, {
    depth: 4.4,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 0.82,
    bevelSize: 0.68,
    bevelSegments: 5,
    curveSegments: 14,
    ...options,
  });
}

function makeLens(side) {
  const boundary = lensContour().getSpacedPoints(80).slice(0, -1);
  if (THREE.ShapeUtils.area(boundary) < 0) boundary.reverse();
  const count = boundary.length, rings = 7, positions = [], indices = [];
  const xOffset = EYE_OFFSET * side;
  const append = (x, y, back) => {
    const globalX = xOffset + side * x;
    const radius = Math.min(1, (x / 28) ** 2 + (y / 23) ** 2);
    const dome = 1.4 * (1 - radius);
    positions.push(globalX, y, surfaceZ(globalX, y) + 0.9 + dome - (back ? 1.45 : 0));
  };
  for (let back = 0; back < 2; back++) {
    const base = positions.length / 3;
    append(0, -0.7, back);
    for (let ring = 1; ring <= rings; ring++) {
      const scale = ring / rings;
      for (const point of boundary) append(point.x * scale, (point.y + 0.7) * scale - 0.7, back);
    }
    const triangle = (a, b, c) => {
      if ((side < 0) !== Boolean(back)) indices.push(a, c, b);
      else indices.push(a, b, c);
    };
    for (let i = 0; i < count; i++) triangle(base, base + 1 + i, base + 1 + (i + 1) % count);
    for (let ring = 1; ring < rings; ring++) {
      const inner = base + 1 + (ring - 1) * count;
      const outer = inner + count;
      for (let i = 0; i < count; i++) {
        const next = (i + 1) % count;
        triangle(inner + i, outer + i, outer + next);
        triangle(inner + i, outer + next, inner + next);
      }
    }
  }
  // Separate edge vertices give the polished lens edge its own normal instead
  // of averaging the front, rear and edge into an inflated outline.
  const frontEdge = 1 + (rings - 1) * count;
  const backEdge = 1 + count * rings + frontEdge;
  for (let i = 0; i < count; i++) {
    const next = (i + 1) % count, base = positions.length / 3;
    for (const vertex of [frontEdge + i, backEdge + i, backEdge + next, frontEdge + next]) {
      positions.push(...positions.slice(vertex * 3, vertex * 3 + 3));
    }
    if (side > 0) indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    else indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function roundedSection(width, height, radius, segments = 4) {
  const corners = [
    [width / 2 - radius, height / 2 - radius, 0],
    [-width / 2 + radius, height / 2 - radius, Math.PI / 2],
    [-width / 2 + radius, -height / 2 + radius, Math.PI],
    [width / 2 - radius, -height / 2 + radius, Math.PI * 1.5],
  ];
  return corners.flatMap(([x, y, start]) => Array.from({ length: segments + 1 }, (_, i) => {
    const angle = start + Math.PI / 2 * i / segments;
    return new THREE.Vector2(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
  }));
}

function sweptTemple(curve, sections = 48) {
  const positions = [], indices = [], uvs = [];
  const up = new THREE.Vector3(0, 1, 0);
  let perimeter;
  for (let i = 0; i <= sections; i++) {
    const t = i / sections, point = curve.getPoint(t), tangent = curve.getTangent(t).normalize();
    const horizontal = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const vertical = new THREE.Vector3().crossVectors(tangent, horizontal).normalize();
    const end = THREE.MathUtils.smoothstep(t, 0.75, 1);
    const thickness = THREE.MathUtils.lerp(3.75, 2.6, t) + end * 0.65;
    const height = 8.1 - 3.6 * Math.min(1, t / 0.45) + end * 1.5;
    const tip = t > 0.94 ? THREE.MathUtils.lerp(1, 0.42, (t - 0.94) / 0.06) : 1;
    const section = roundedSection(thickness * tip, height * tip, 0.7 * tip);
    perimeter = section.length;
    section.forEach((vertex, j) => {
      const position = point.clone().addScaledVector(horizontal, vertex.x).addScaledVector(vertical, vertex.y);
      positions.push(position.x, position.y, position.z);
      uvs.push(t * 140, j / perimeter * 12);
    });
  }
  for (let i = 0; i < sections; i++) {
    for (let j = 0; j < perimeter; j++) {
      const next = (j + 1) % perimeter;
      const a = i * perimeter + j, b = i * perimeter + next;
      const c = (i + 1) * perimeter + j, d = (i + 1) * perimeter + next;
      indices.push(a, b, c, b, d, c);
    }
  }
  for (let end = 0; end < 2; end++) {
    const center = positions.length / 3, point = curve.getPoint(end);
    positions.push(point.x, point.y, point.z); uvs.push(end, 0.5);
    const start = end ? sections * perimeter : 0;
    for (let j = 0; j < perimeter; j++) {
      const next = (j + 1) % perimeter;
      if (end) indices.push(center, start + j, start + next);
      else indices.push(center, start + next, start + j);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeTortoiseTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return null;
  // Broad, irregular amber resin clouds inside a predominantly espresso base.
  // Periodic domain-warped noise avoids round dots and keeps every tile seamless.
  const wrap = (n, period) => ((n % period) + period) % period;
  const hash = (x, y, seed) => {
    let n = Math.imul(x + seed, 374761393) ^ Math.imul(y + seed, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const noise = (x, y, columns, rows, seed) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const tx = x - ix, ty = y - iy;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const at = (dx, dy) => hash(wrap(ix + dx, columns), wrap(iy + dy, rows), seed);
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(at(0, 0), at(1, 0), sx), THREE.MathUtils.lerp(at(0, 1), at(1, 1), sx), sy);
  };
  const palette = [
    [0, [14, 9, 7]], [0.39, [22, 12, 8]], [0.55, [39, 21, 12]],
    [0.68, [77, 39, 17]], [0.82, [128, 73, 29]], [1, [170, 109, 46]],
  ];
  const pixels = context.createImageData(512, 512);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const u = x / 512, v = y / 512;
    const warpX = noise(u * 3, v * 3, 3, 3, 11) - 0.5;
    const warpY = noise(u * 3, v * 3, 3, 3, 43) - 0.5;
    const cloud = 0.69 * noise(u * 5 + warpX * 1.8, v * 4 + warpY * 1.5, 5, 4, 91)
      + 0.24 * noise(u * 10 + warpY * 1.8, v * 8 + warpX * 1.5, 10, 8, 137)
      + 0.07 * noise(u * 20, v * 16, 20, 16, 173);
    const value = THREE.MathUtils.clamp((cloud - 0.12) * 1.4, 0, 1);
    const upper = palette.findIndex(stop => stop[0] >= value);
    const a = palette[Math.max(0, upper - 1)], b = palette[Math.max(1, upper)];
    const mix = THREE.MathUtils.clamp((value - a[0]) / (b[0] - a[0]), 0, 1);
    const index = (y * 512 + x) * 4;
    for (let channel = 0; channel < 3; channel++) pixels.data[index + channel] = Math.round(THREE.MathUtils.lerp(a[1][channel], b[1][channel], mix));
    pixels.data[index + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(0.0125, 0.0125);
  texture.anisotropy = 4;
  return texture;
}

export function createEyewearModel() {
  const group = new THREE.Group();
  group.name = 'Kotto original acetate eyewear study';
  group.userData.units = 'mm';
  group.userData.frontDirection = '+Z';
  const frame = new THREE.MeshPhysicalMaterial({
    color: 0x050504, metalness: 0, roughness: 0.15,
    clearcoat: 0.85, clearcoatRoughness: 0.045, ior: 1.51,
    specularIntensity: 0.85, envMapIntensity: 0.95,
  });
  const lens = new THREE.MeshPhysicalMaterial({
    color: 0xd1d8d2, metalness: 0, roughness: 0.024,
    transmission: 0.95, transparent: true, opacity: 0.9,
    thickness: 1.45, ior: 1.51, clearcoat: 0.25, clearcoatRoughness: 0.025,
    attenuationColor: new THREE.Color(0x6b766d), attenuationDistance: 12,
    envMapIntensity: 0.6, side: THREE.FrontSide, depthWrite: false,
  });
  const metal = new THREE.MeshPhysicalMaterial({
    color: 0xbcb5a3, metalness: 1, roughness: 0.23,
    clearcoat: 0.3, clearcoatRoughness: 0.13, envMapIntensity: 1.15,
  });
  const silicone = new THREE.MeshPhysicalMaterial({
    color: 0xc6bfb0, roughness: 0.26, transmission: 0.6,
    transparent: true, opacity: 0.76, thickness: 1.4,
    ior: 1.42, depthWrite: false,
  });
  const recess = new THREE.MeshStandardMaterial({ color: 0x28251f, roughness: 0.58, metalness: 0.65 });
  const geometries = new Set();
  const materials = { frame, lens, metal };
  const tortoise = makeTortoiseTexture();
  let disposed = false;
  const add = (geometry, material, name, position) => {
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = material === frame || material === metal;
    mesh.receiveShadow = material === frame;
    if (position) mesh.position.copy(position);
    group.add(mesh);
    return mesh;
  };

  add(wrapSolid(extrude(frontContour())), frame, 'continuous beveled acetate front and bridge');

  for (const side of [-1, 1]) {
    const label = side < 0 ? 'left' : 'right';
    add(makeLens(side), lens, `${label} curved optical lens`).renderOrder = 1;

    const hingeX = side * 70.4, hingeZ = -9.0;
    const plate = add(new THREE.BoxGeometry(4.0, 7.2, 1.15), metal, `${label} recessed hinge plate`, new THREE.Vector3(side * 68.8, 12.1, -7.8));
    plate.rotation.y = -side * 0.1;
    for (let joint = 0; joint < 5; joint++) {
      add(new THREE.CylinderGeometry(1.15, 1.15, 1.28, 20), metal, `${label} hinge barrel ${joint + 1}`, new THREE.Vector3(hingeX, 9.25 + joint * 1.45, hingeZ));
    }
    add(new THREE.CylinderGeometry(0.78, 0.78, 0.24, 20), metal, `${label} hinge screw`, new THREE.Vector3(hingeX, 15.81, hingeZ));
    add(new THREE.BoxGeometry(0.96, 0.035, 0.18), recess, `${label} hinge screw slot`, new THREE.Vector3(hingeX, 15.95, hingeZ));

    // Two small metal fixing pins, with no brand mark on the front or temple.
    for (const x of [66.9, 69.2]) {
      const rivet = add(new THREE.SphereGeometry(0.55, 16, 10), metal, `${label} front fixing pin`, new THREE.Vector3(side * x, 13.6, surfaceZ(x, 13.6) + 2.85));
      rivet.scale.set(1, 0.7, 0.28);
    }

    const templeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 70.8, 12.2, -10.2),
      new THREE.Vector3(side * 73.8, 12.3, -26),
      new THREE.Vector3(side * 74.2, 11.5, -62),
      new THREE.Vector3(side * 72.6, 10.2, -96),
      new THREE.Vector3(side * 71.5, 6.2, -116),
      new THREE.Vector3(side * 69.7, -9.2, -133),
      new THREE.Vector3(side * 68.5, -18.7, -138),
    ], false, 'centripetal');
    add(sweptTemple(templeCurve), frame, `${label} tapered temple and curved ear tip`);
    const corePoints = [0.09, 0.2, 0.35, 0.5, 0.63].map(t => {
      const point = templeCurve.getPoint(t);
      point.x -= side * 1.77;
      return point;
    });
    const core = new THREE.CatmullRomCurve3(corePoints);
    add(new THREE.TubeGeometry(core, 20, 0.34, 8, false), metal, `${label} inner temple metal core`);

    // Asian-fit adjustable silicone nose support, behind the acetate front.
    const noseArm = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 6.4, 0.3, -3.1),
      new THREE.Vector3(side * 10.1, -2.3, -7.8),
      new THREE.Vector3(side * 10.9, -7.0, -10.5),
    ]);
    add(new THREE.TubeGeometry(noseArm, 12, 0.65, 10, false), metal, `${label} nose pad support`);
    const pad = add(new THREE.SphereGeometry(1, 20, 14), silicone, `${label} silicone nose pad`, new THREE.Vector3(side * 10.3, -7.8, -11.6));
    pad.scale.set(2.45, 5.0, 1.28);
    pad.rotation.z = side * 0.26;
    pad.rotation.y = side * 0.28;
    const padScrew = add(new THREE.CylinderGeometry(0.55, 0.55, 1.15, 16), metal, `${label} nose pad screw`, new THREE.Vector3(side * 10.9, -7.0, -10.2));
    padScrew.rotation.x = Math.PI / 2;
  }

  function setFinish(name = 'black') {
    if (disposed) return;
    const havana = name === 'havana';
    frame.color.set(havana ? (tortoise ? 0xf5e6cf : 0x352014) : 0x050504);
    frame.map = havana ? tortoise : null;
    frame.roughness = havana ? 0.17 : 0.15;
    frame.clearcoatRoughness = havana ? 0.05 : 0.045;
    frame.needsUpdate = true;
    group.userData.finish = havana ? 'havana' : 'black';
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    for (const geometry of geometries) geometry.dispose();
    for (const material of [frame, lens, metal, silicone, recess]) material.dispose();
    tortoise?.dispose();
    group.clear();
  }
  setFinish('black');
  return { group, materials, setFinish, dispose };
}
