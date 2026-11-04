import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Source geometry: Khronos Sunglasses, Eric Chadwick / DGG, CC BY 4.0.
// Only the material treatment, uniform metre-to-millimetre scale and centering
// change here. No replacement curves, procedural frame parts or logo textures.
export async function createEyewearModel({ signal } = {}) {
  const url = new URL('models/eyewear-studio.glb', document.baseURI);
  const response = await fetch(url, { signal, credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Eyewear model request failed (${response.status})`);
  const buffer = await response.arrayBuffer();
  signal?.throwIfAborted();
  const gltf = await new GLTFLoader().parseAsync(buffer, new URL('.', url).href);
  const source = gltf.scene;
  const geometries = new Set(), originalMaterials = new Set(), originalTextures = new Set();
  source.traverse(object => {
    if (!object.isMesh) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      originalMaterials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) originalTextures.add(value);
    }
  });
  function releaseOriginalMaterials() {
    originalMaterials.forEach(material => material.dispose());
    originalTextures.forEach(texture => { texture.dispose(); texture.source?.data?.close?.(); });
    originalMaterials.clear(); originalTextures.clear();
  }
  if (signal?.aborted) {
    geometries.forEach(geometry => geometry.dispose());
    releaseOriginalMaterials();
    throw new DOMException('Eyewear loading aborted', 'AbortError');
  }

  const metal = new THREE.MeshPhysicalMaterial({ name: 'Champagne gold metal', color: new THREE.Color(.68, .52, .30), metalness: 1, roughness: .13, envMapIntensity: 1.0 });
  const earhook = new THREE.MeshPhysicalMaterial({ name: 'Plain black ear tips', color: new THREE.Color(.006, .007, .006), metalness: 0, roughness: .22, clearcoat: .45, clearcoatRoughness: .16 });
  // The source has opposite-facing inner/outer surfaces. WebGL transmission
  // samples opaque geometry, so each visible face needs the same neutral tint.
  // Zero synthetic volume also avoids multiplying thickness by the mm scale.
  const lens = new THREE.MeshPhysicalMaterial({ name: 'Smoke G15 inner glass', color: new THREE.Color(.13, .17, .145), metalness: 0, roughness: .05, transmission: .96, thickness: 0, ior: 1.47, envMapIntensity: .85, iridescence: 0, shadowSide: THREE.DoubleSide });
  const lensExterior = new THREE.MeshPhysicalMaterial({ name: 'Smoke G15 outer glass', color: new THREE.Color(.13, .17, .145), metalness: 0, roughness: .08, transmission: .96, thickness: 0, ior: 1.47, envMapIntensity: .85, iridescence: 0 });
  const nosepad = new THREE.MeshPhysicalMaterial({ name: 'Light translucent silicone nose pads', color: new THREE.Color(.77, .81, .77), metalness: 0, roughness: .13, transmission: .58, thickness: .001, ior: 1.41, iridescence: 0 });
  const materials = { metal, earhook, lens, lensExterior, nosepad };
  source.traverse(object => {
    if (!object.isMesh) return;
    const name = object.name.toLowerCase();
    if (name.includes('earhook')) object.material = earhook;
    else if (name.includes('nosepad')) object.material = nosepad;
    else if (name.includes('lensesexterior')) object.material = lensExterior;
    else if (name.includes('lens')) object.material = lens;
    else object.material = metal;
    object.castShadow = object.material !== nosepad && object.material !== lensExterior;
    // The small polished parts receive their illumination from the studio,
    // not from a low-resolution self-shadow that would stripe the metal.
    object.receiveShadow = false;
  });
  releaseOriginalMaterials();
  source.updateMatrixWorld(true);
  const sourceBounds = new THREE.Box3().setFromObject(source);
  const center = sourceBounds.getCenter(new THREE.Vector3());
  source.scale.setScalar(1000);
  source.position.copy(center).multiplyScalar(-1000);
  const group = new THREE.Group();
  group.name = 'Khronos eyewear studio model';
  group.add(source);
  group.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(group);
  const contactPoints = [];
  const point = new THREE.Vector3();
  group.traverse(object => {
    if (!object.isMesh) return;
    const positions = object.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
      contactPoints.push(point.x, point.y, point.z);
    }
  });
  let disposed = false;
  function setFinish(name = 'gold') {
    if (disposed) return;
    const silver = name === 'silver';
    metal.color.setRGB(...(silver ? [.70, .74, .75] : [.68, .52, .30]));
    metal.roughness = silver ? .12 : .13;
    group.userData.finish = silver ? 'silver' : 'gold';
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    geometries.forEach(geometry => geometry.dispose());
    Object.values(materials).forEach(material => material.dispose());
    group.clear();
  }
  setFinish('gold');
  return { group, materials, bounds, contactPoints: new Float32Array(contactPoints), setFinish, dispose };
}
