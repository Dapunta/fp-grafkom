import * as THREE from "three";
import { LAB } from "../config/labConfig.js";

export function addLights(scene) {
  // ===== ambient kecil =====
  const amb = new THREE.AmbientLight(0xffffff, LAB.light.ambientIntensity ?? 0.08);
  scene.add(amb);

  // fill halus
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.15);
  scene.add(hemi);

  // ===== directional = "sun" =====
  const sun = new THREE.DirectionalLight(0xffffff, LAB.light.sunIntensity ?? 2.0);
  sun.position.set(...(LAB.light.sunPos ?? [15, 18, -15]));
  sun.castShadow = true;

  // target ke tengah ruangan
  const backDepth = LAB.backRoom?.depth ?? 0;
  const offZ = LAB.backRoom?.offsetZ ?? 0;
  const zMin = -LAB.room.floorH / 2;
  const zMax =  LAB.room.floorH / 2 + backDepth + offZ;
  const zCenter = (zMin + zMax) / 2;

  sun.target.position.set(0, LAB.light.targetY ?? 0, zCenter);
  scene.add(sun.target);

  // ===== SHADOW CAMERA FRUSTUM =====
  const halfW = LAB.room.floorW / 2;
  const halfD = (zMax - zMin) / 2;

  const pad = LAB.light.shadowFrustumPadding ?? 6;
  const size = Math.max(halfW, halfD) + pad;

  const cam = sun.shadow.camera; // OrthographicCamera
  cam.left = -size;
  cam.right = size;
  cam.top = size;
  cam.bottom = -size;
  cam.near = LAB.light.shadowNear ?? 1;
  cam.far = LAB.light.shadowFar ?? 120;
  cam.updateProjectionMatrix();

  sun.shadow.mapSize.set(LAB.light.shadowMapSize ?? 4096, LAB.light.shadowMapSize ?? 4096);
  sun.shadow.radius = LAB.light.shadowRadius ?? 1;
  sun.shadow.bias = LAB.light.shadowBias ?? -0.0002;
  sun.shadow.normalBias = LAB.light.shadowNormalBias ?? 0.03;

  scene.add(sun);
}