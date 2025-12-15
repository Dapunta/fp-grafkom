import * as THREE from "three";
import { LAB } from "../config/labConfig.js";

export function createCamera() {
  const { fov, near, far, startPos, startRotY } = LAB.camera;

  const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    near,
    far
  );

  camera.position.set(...startPos);
  if (typeof startRotY === "number") camera.rotation.y = startRotY;

  return camera;
}