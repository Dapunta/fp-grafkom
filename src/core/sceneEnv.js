import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { LAB } from "../config/labConfig.js";

export function createSceneWithEnv(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(LAB.render.bg);

  if (LAB.render.fogEnabled !== false) {
    scene.fog = new THREE.Fog(LAB.render.bg, LAB.render.fogNear, LAB.render.fogFar);
  }

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  scene.environmentIntensity = LAB.render.envIntensity;

  return scene;
}