import * as THREE from "three";
import { LAB } from "../config/labConfig.js";

export function buildCeiling(scene) {
  const cfg = LAB.ceiling;
  if (!cfg?.enabled) return null;

  // Root plafon: berdiri sendiri sebagai child langsung dari scene
  const name = cfg.name || "CeilingRoot";
  let root = scene.getObjectByName(name);
  if (!root) {
    root = new THREE.Group();
    root.name = name;
    scene.add(root);
  } else {
    root.clear();
  }

  const y = (cfg.y ?? LAB.room.wallHeight);
  root.position.set(0, y, 0);

  const mat = new THREE.MeshStandardMaterial({
    ...LAB.materials.ceiling,
    side: THREE.DoubleSide,
  });

  const castShadow = !!cfg.castShadow;
  const receiveShadow = cfg.receiveShadow !== false;

  // =========================
  // Plafon UTAMA
  // =========================
  if (cfg.main?.enabled !== false) {
    const inset = cfg.main?.inset ?? 0;
    const w = LAB.room.floorW - inset * 2;
    const d = LAB.room.floorH - inset * 2;

    const ceilMain = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    ceilMain.rotation.x = Math.PI / 2; // normal ke bawah (bagus buat interior)
    ceilMain.position.set(0, 0, 0);
    ceilMain.castShadow = castShadow;
    ceilMain.receiveShadow = receiveShadow;
    root.add(ceilMain);
  }

  // =========================
  // Plafon BACKROOM
  // =========================
  const backDepth = LAB.backRoom?.depth ?? 6;
  const offsetZ = LAB.backRoom?.offsetZ ?? 0;
  const frontZ = (LAB.room.floorH / 2) + offsetZ; // sama kayak room.js kamu

  if (cfg.backRoom?.enabled !== false) {
    const inset = cfg.backRoom?.inset ?? 0;
    const w = LAB.room.floorW - inset * 2;
    const d = backDepth - inset * 2;

    const ceilBack = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    ceilBack.rotation.x = Math.PI / 2;
    ceilBack.position.set(0, 0, frontZ + backDepth / 2);
    ceilBack.castShadow = castShadow;
    ceilBack.receiveShadow = receiveShadow;
    root.add(ceilBack);
  }

  return root;
}