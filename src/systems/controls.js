// src/systems/controls.js
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

export function setupPointerLockControls(camera, domElement, scene) {
  const controls = new PointerLockControls(camera, domElement);

  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

  const keys = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
  };

  instructions.addEventListener("click", () => controls.lock());

  controls.addEventListener("lock", () => {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", () => {
    blocker.style.display = "flex";
    instructions.style.display = "block";
  });

  scene.add(controls.getObject());

  function onKeyDown(e) {
    switch (e.code) {
      case "KeyW": keys.moveForward = true; break;
      case "KeyA": keys.moveLeft = true; break;
      case "KeyS": keys.moveBackward = true; break;
      case "KeyD": keys.moveRight = true; break;
      case "KeyE": keys.moveUp = true; break;     // ✅ NEW
      case "KeyQ": keys.moveDown = true; break;   // ✅ NEW
    }
  }

  function onKeyUp(e) {
    switch (e.code) {
      case "KeyW": keys.moveForward = false; break;
      case "KeyA": keys.moveLeft = false; break;
      case "KeyS": keys.moveBackward = false; break;
      case "KeyD": keys.moveRight = false; break;
      case "KeyE": keys.moveUp = false; break;     // ✅ NEW
      case "KeyQ": keys.moveDown = false; break;   // ✅ NEW
    }
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  return { controls, keys };
}