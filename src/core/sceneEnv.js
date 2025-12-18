// src/core/sceneEnv.js
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { LAB } from "../config/labConfig.js";

export function createSceneWithEnv(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(LAB.render.bg);

  if (LAB.render.fogEnabled) {
    scene.fog = new THREE.Fog(LAB.render.bg, LAB.render.fogNear, LAB.render.fogFar);
  }

  if (LAB.render.useEnvironment === true) {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environmentIntensity = LAB.render.envIntensity ?? 0.1;
  } else {
    scene.environment = null;
    scene.environmentIntensity = 0;
  }

  return scene;
}