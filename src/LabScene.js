import { createRenderer } from "./core/renderer.js";
import { createSceneWithEnv } from "./core/sceneEnv.js";
import { createCamera } from "./core/camera.js";
import { addLights } from "./core/lights.js";
import { bindResize } from "./systems/resize.js";
import { setupPointerLockControls } from "./systems/controls.js";
import { createMovementState, updateMovement } from "./systems/movement.js";
import { buildRoom } from "./world/room.js";
import {
  spawnDesks,
  spawnACs,
  spawnSpeakers,
  spawnTVs,
  spawnPlatforms,
  spawnTeacherDesk,
  spawnWhiteboard,
  spawnScreenProjector,
  spawnRightWindows,
  spawnLeftWindows,
  spawnGlassDoorLeftBack,
  spawnCeilingLamps,
  setCeilingLampsOn,
} from "./world/spawners.js";
import { buildCeiling } from "./world/ceiling.js";
import { loadAllModels } from "./assets/modelLoader.js";

export class LabScene {
  constructor() {
    this.camera = null;
    this.scene = null;
    this.renderer = null;

    this.controls = null;
    this.keys = null;
    this.movementState = createMovementState();
  }

  init() {
    this.renderer = createRenderer();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.scene = createSceneWithEnv(this.renderer);
    this.camera = createCamera();

    buildRoom(this.scene);
    const ceilingRoot = buildCeiling(this.scene);
    addLights(this.scene, ceilingRoot);

    const { controls, keys } = setupPointerLockControls(this.camera, document.body, this.scene);
    this.controls = controls;
    this.keys = keys;

    bindResize(this.camera, this.renderer);

    // load + spawn 
    this.loadAndSpawn();

    this.animate();

    window.addEventListener("keydown", (e) => {
      if (e.code === "Digit1" || e.code === "Numpad1") setCeilingLampsOn(this.scene, true);
      if (e.code === "Digit0" || e.code === "Numpad0") setCeilingLampsOn(this.scene, false);
    });

  }

  async loadAndSpawn() {
    const loadingEl = document.getElementById("loading");

    const res = await loadAllModels();
    if (res.fatal) {
      if (loadingEl) {
        loadingEl.innerText = "Error: Cek Folder Assets";
        loadingEl.style.color = "red";
      }
      return;
    }

    if (loadingEl) loadingEl.style.display = "none";

    const m = res.models;

    console.log("models keys:", Object.keys(m));
    console.log("rightWindow =", m.rightWindow);

    spawnDesks(this.scene, {
      meja: m.meja,
      kursi: m.kursi,
      monitor: m.monitor,
      mouse: m.mouse,
      cpu: m.cpu,
      keyboard: m.keyboard,
    });

    spawnLeftWindows(this.scene, m);
    spawnRightWindows(this.scene, m);
    spawnGlassDoorLeftBack(this.scene, m);

    spawnACs(this.scene, m.ac);
    spawnSpeakers(this.scene, m.speaker);
    spawnTVs(this.scene, m.tv);
    spawnPlatforms(this.scene);

    spawnTeacherDesk(this.scene, m.mejaDosen || m.meja);
    spawnWhiteboard(this.scene, m.whiteboard);
    spawnScreenProjector(this.scene, m.screenProjector);

    spawnCeilingLamps(this.scene, m);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.controls && this.keys) {
      updateMovement(this.controls, this.keys, this.movementState);
    }

    this.renderer.render(this.scene, this.camera);
  }
}