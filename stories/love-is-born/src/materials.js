import * as THREE from 'three';
import { steelTextures, chainmailTextures, woodTexture, fabricTexture, skinTexture } from './textures.js';

let M = null;
export function materials() {
  if (M) return M;
  const steel = steelTextures(3);
  const steel2 = steelTextures(9);
  const fab = fabricTexture();
  const skinN = skinTexture();
  M = {
    skin: new THREE.MeshPhysicalMaterial({ color: 0xd49b7a, roughness: 0.72, sheen: 0.22, sheenColor: new THREE.Color(0xffd0b8), sheenRoughness: 0.7, bumpMap: skinN, bumpScale: 0.35, clearcoat: 0.0 }),
    lip: new THREE.MeshStandardMaterial({ color: 0xa85e52, roughness: 0.45 }),
    hair: new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 0.85, bumpMap: fab, bumpScale: 2 }),
    beard: new THREE.MeshStandardMaterial({ color: 0x5c4434, roughness: 0.95, bumpMap: fab, bumpScale: 3 }),
    eyeWhite: new THREE.MeshPhysicalMaterial({ color: 0xf2eee8, roughness: 0.15, clearcoat: 1 }),
    iris: new THREE.MeshPhysicalMaterial({ color: 0x4a3322, roughness: 0.2, clearcoat: 1 }),
    mouth: new THREE.MeshStandardMaterial({ color: 0x2a0d0b, roughness: 0.9 }),
    teeth: new THREE.MeshStandardMaterial({ color: 0xf0ece0, roughness: 0.4 }),
    cloth: new THREE.MeshStandardMaterial({ color: 0x1d1d20, roughness: 0.92, bumpMap: fab, bumpScale: 1.2 }),
    clothGrey: new THREE.MeshStandardMaterial({ color: 0x3e4044, roughness: 0.9, bumpMap: fab, bumpScale: 1.2 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 0.6 }),
    steel: new THREE.MeshPhysicalMaterial({ color: 0xc4c6ca, map: steel.color, metalness: 1, roughness: 0.42, roughnessMap: steel.rough, clearcoat: 0.25, clearcoatRoughness: 0.4 }),
    steelDark: new THREE.MeshPhysicalMaterial({ color: 0x4a4c50, map: steel2.color, metalness: 1, roughness: 0.28, roughnessMap: steel2.rough }),
    steelBright: new THREE.MeshPhysicalMaterial({ color: 0xd0d2d6, metalness: 1, roughness: 0.22, roughnessMap: steel2.rough }),
    gun: new THREE.MeshPhysicalMaterial({ color: 0xb8bcc2, metalness: 1, roughness: 0.3, roughnessMap: steel.rough, clearcoat: 0.3 }),
    gunDark: new THREE.MeshStandardMaterial({ color: 0x2a2b2e, metalness: 0.4, roughness: 0.5 }),
    copper: new THREE.MeshPhysicalMaterial({ color: 0xd9733f, metalness: 1, roughness: 0.25, emissive: 0x6a1d05, emissiveIntensity: 0.3, clearcoat: 0.6 }),
    wood: new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.75 }),
    woodDark: new THREE.MeshStandardMaterial({ map: woodTexture(21), color: 0x8a6a50, roughness: 0.8 }),
    rivet: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, metalness: 0.8, roughness: 0.35 }),
    feather: new THREE.MeshStandardMaterial({ color: 0xe8e2d0, roughness: 0.8, side: THREE.DoubleSide }),
    string: new THREE.MeshStandardMaterial({ color: 0xe0d8c0, roughness: 0.6 }),
    robeSaffron: new THREE.MeshStandardMaterial({ color: 0xd87a28, roughness: 0.88, bumpMap: fab, bumpScale: 1.4 }),
    robeRags: new THREE.MeshStandardMaterial({ color: 0x8a7968, roughness: 0.94, bumpMap: fab, bumpScale: 1.8 }),
    royalSilk: new THREE.MeshPhysicalMaterial({ color: 0xe6c373, roughness: 0.55, sheen: 0.5, sheenColor: new THREE.Color(0xfff0c0), bumpMap: fab, bumpScale: 0.8 }),
    bark: new THREE.MeshStandardMaterial({ map: woodTexture(17), color: 0x6b4c35, roughness: 0.92 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x3b7a38, roughness: 0.78 }),
    leafWarm: new THREE.MeshStandardMaterial({ color: 0x6c9c40, roughness: 0.72 }),
    leafDry: new THREE.MeshStandardMaterial({ color: 0x8e7c4c, roughness: 0.85 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x5c8f46, roughness: 0.92 }),
    earth: new THREE.MeshStandardMaterial({ color: 0x9c7b56, roughness: 0.95 }),
    goldGlow: new THREE.MeshStandardMaterial({ color: 0xffd15c, emissive: 0xffb830, emissiveIntensity: 1.6, roughness: 0.3 }),
    roseApple: new THREE.MeshStandardMaterial({ color: 0xc83e4b, roughness: 0.45 }),
  };
  const cm = chainmailTextures([14, 9]);
  M.chainmail = new THREE.MeshPhysicalMaterial({
    color: 0xb8b8bc, map: cm.color, metalness: 1, metalnessMap: cm.bump, roughness: 0.42,
    bumpMap: cm.bump, bumpScale: 6, clearcoat: 0.3,
  });
  M._cmTex = cm;
  return M;
}
