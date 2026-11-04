import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Photo-reconstructed ZIN 01 geometry, authored against the official product
// references and dimensions. This viewer preserves that mesh and its +Z front.
export async function createEyewearModel({ signal } = {}) {
  const url = new URL('models/zin-01.glb', document.baseURI);
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

  const frame = new THREE.MeshPhysicalMaterial({ name: 'ZIN 01 polished black acetate', color: new THREE.Color(.002, .0024, .003), metalness: 0, roughness: .13, clearcoat: .3, clearcoatRoughness: .09, ior: 1.5 });
  const temple = new THREE.MeshPhysicalMaterial({ name: 'ZIN 01 silver titanium', color: new THREE.Color(.63, .66, .69), metalness: 1, roughness: .2, envMapIntensity: 1 });
  // Thickness is expressed in the source's metres, before the mm conversion.
  // Keep the clear optical surfaces neutral, without tint or iridescent coating.
  const lenses = new THREE.MeshPhysicalMaterial({ name: 'ZIN 01 clear optical lenses', color: new THREE.Color(.985, .993, .995), metalness: 0, roughness: .008, transmission: 1, thickness: .00085, ior: 1.49, envMapIntensity: .65, iridescence: 0 });
  const nosepads = new THREE.MeshPhysicalMaterial({ name: 'ZIN 01 clear nose pads', color: new THREE.Color(.82, .86, .85), metalness: 0, roughness: .12, transmission: .83, thickness: .0015, ior: 1.41, iridescence: 0 });
  const rivets = new THREE.MeshPhysicalMaterial({ name: 'ZIN 01 polished silver details', color: new THREE.Color(.8, .82, .84), metalness: 1, roughness: .12, envMapIntensity: 1 });
  const recess = new THREE.MeshPhysicalMaterial({ name: 'ZIN 01 dark hinge recess', color: new THREE.Color(.06, .065, .07), metalness: 1, roughness: .3 });
  const materials = { frame, temple, lenses, nosepads, rivets, recess };
  function materialFor(materialName, meshName) {
    const key = `${materialName} ${meshName}`.toLowerCase();
    if (/hinge.?recess|dark.?metal/.test(key)) return recess;
    if (/rivet|hinge|screw|mount|detail|nosepad.?adjustment|nose.?arm|pad.?arm|support/.test(key)) return rivets;
    if (/nose.?pads?|silicone/.test(key)) return nosepads;
    if (/lens|glass/.test(key)) return lenses;
    if (/temple|titanium|silver|metal/.test(key)) return temple;
    return frame;
  }
  source.traverse(object => {
    if (!object.isMesh) return;
    const replacements = (Array.isArray(object.material) ? object.material : [object.material])
      .map(material => materialFor(material.name, object.name));
    object.material = Array.isArray(object.material) ? replacements : replacements[0];
    object.castShadow = replacements.some(material => material !== nosepads && material !== lenses);
    // The small polished parts receive their illumination from the studio,
    // not from a low-resolution self-shadow that would stripe the metal.
    object.receiveShadow = false;
  });
  releaseOriginalMaterials();
  source.updateMatrixWorld(true);
  const sourceBounds = new THREE.Box3().setFromObject(source);
  const center = sourceBounds.getCenter(new THREE.Vector3());
  const millimetres = new THREE.Group();
  millimetres.scale.setScalar(1000);
  millimetres.position.copy(center).multiplyScalar(-1000);
  millimetres.add(source);
  const group = new THREE.Group();
  group.name = 'Photo-reconstructed ZIN 01';
  group.add(millimetres);
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
  function setFinish() {
    if (disposed) return;
    // ZIN 01 has a single black-front / silver-temple finish.
    group.userData.finish = 'black';
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    geometries.forEach(geometry => geometry.dispose());
    Object.values(materials).forEach(material => material.dispose());
    group.clear();
  }
  setFinish();
  return { group, materials, bounds, contactPoints: new Float32Array(contactPoints), setFinish, dispose };
}
