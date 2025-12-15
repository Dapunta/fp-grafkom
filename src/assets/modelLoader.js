import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

function tweakModel(model) {
  model.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;

      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const m of mats) {
        if (!m) continue;
        m.metalness = 0.0;
        m.roughness = 0.8;
        if (m.map) m.map.anisotropy = 16;
      }
    }
  });
}

function loadGLTF(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

function loadOBJ(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (obj) => resolve(obj), undefined, reject);
  });
}

async function safeLoadGLTF(loader, url, label) {
  try {
    const model = await loadGLTF(loader, url);
    tweakModel(model);
    return model;
  } catch (err) {
    console.error(`Error loading ${label}:`, err);
    return null;
  }
}

async function safeLoadOBJ(loader, url, label, materialOverride = null) {
  try {
    const obj = await loadOBJ(loader, url);

    obj.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
        if (materialOverride) n.material = materialOverride;
      }
    });

    return obj;
  } catch (err) {
    console.error(`Error loading ${label}:`, err);
    return null;
  }
}

export async function loadAllModels() {

  const gltf = new GLTFLoader();
  const objl = new OBJLoader();

  const glassDoorMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaccdd,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const glassDoor = await safeLoadOBJ(objl, "assets/glass_door.obj", "glass_door", glassDoorMat);
  glassDoor.scale.set(0.8, 1.5, 1.25);
  
  const meja = await safeLoadGLTF(gltf, "assets/meja-azka.glb", "meja");
  if (!meja) return { fatal: true };
  meja.scale.set(1, 1, 1.25);

  const leftWindow = await safeLoadGLTF(gltf, "assets/left_window.glb", "leftWindow");
  if (leftWindow) leftWindow.scale.set(1, 1, 1);

  const rightWindow = await safeLoadGLTF(gltf, "assets/right_window.glb", "rightWindow");
  if (rightWindow) rightWindow.scale.set(1, 1, 1);

  const kursi = await safeLoadGLTF(gltf, "assets/kursi.glb", "kursi");
  if (kursi) kursi.scale.set(1.25, 1.25, 1.25);

  const monitor = await safeLoadGLTF(gltf, "assets/monitor.glb", "monitor");
  if (monitor) monitor.scale.set(0.001, 0.001, 0.001);

  const mouse = await safeLoadGLTF(gltf, "assets/mouse.glb", "mouse");
  if (mouse) mouse.scale.set(0.015, 0.015, 0.015);

  const cpu = await safeLoadGLTF(gltf, "assets/cpu_case.glb", "cpu_case");
  if (cpu) cpu.scale.set(1.3, 1.3, 1.3);

  const keyboard = await safeLoadGLTF(gltf, "assets/keyboard.glb", "keyboard");
  if (keyboard) keyboard.scale.set(0.04, 0.04, 0.04);

  const ac = await safeLoadGLTF(gltf, "assets/ac.glb", "ac");
  if (ac) ac.scale.set(3, 3, 3);

  const speaker = await safeLoadGLTF(gltf, "assets/speaker.glb", "speaker");
  if (speaker) speaker.scale.set(0.5, 0.5, 0.5);

  const tv = await safeLoadGLTF(gltf, "assets/tv_screen.glb", "tv_screen");
  if (tv) tv.scale.set(0.05, 0.05, 0.05);

  const mejaDosen = await safeLoadGLTF(gltf, "assets/Meja-dosen.glb", "Meja-dosen");
  if (mejaDosen) mejaDosen.scale.set(1, 1, 1);

  const whiteboard = await safeLoadGLTF(gltf, "assets/whiteboard.glb", "whiteboard");
  if (whiteboard) whiteboard.scale.set(0.8, 0.8, 1);

  const screenProjector = await safeLoadGLTF(gltf, "assets/screen_projector.glb", "screen_projector");
  if (screenProjector) screenProjector.scale.set(1, 1.15, 0.75);

  return {
    fatal: false,
    models: { glassDoor, leftWindow, rightWindow, meja, kursi, monitor, mouse, cpu, keyboard, ac, speaker, tv, mejaDosen, whiteboard, screenProjector },
  };
}