// src/systems/movement.js
import * as THREE from "three";
import { LAB } from "../config/labConfig.js";

export function createMovementState() {
  return {
    prevTime: performance.now(),
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
  };
}

export function updateMovement(controls, keys, movementState) {
  const time = performance.now();

  if (controls.isLocked === true) {
    const delta = (time - movementState.prevTime) / 1000;

    // damping
    movementState.velocity.x -= movementState.velocity.x * LAB.movement.damping * delta;
    movementState.velocity.y -= movementState.velocity.y * LAB.movement.damping * delta;
    movementState.velocity.z -= movementState.velocity.z * LAB.movement.damping * delta;

    // direction
    movementState.direction.z = Number(keys.moveForward) - Number(keys.moveBackward);
    movementState.direction.x = Number(keys.moveRight) - Number(keys.moveLeft);
    movementState.direction.y = Number(keys.moveUp) - Number(keys.moveDown);

    // normalize hanya untuk XZ (biar vertical gak ikut “melemahkan” gerak)
    const dirXZ = new THREE.Vector2(movementState.direction.x, movementState.direction.z);
    if (dirXZ.lengthSq() > 0) dirXZ.normalize();
    movementState.direction.x = dirXZ.x;
    movementState.direction.z = dirXZ.y;

    // accel XZ
    if (keys.moveForward || keys.moveBackward) {
      movementState.velocity.z -= movementState.direction.z * LAB.movement.accel * delta;
    }
    if (keys.moveLeft || keys.moveRight) {
      movementState.velocity.x -= movementState.direction.x * LAB.movement.accel * delta;
    }

    // accel Y (Up/Down)
    if (keys.moveUp || keys.moveDown) {
      movementState.velocity.y -= movementState.direction.y * LAB.movement.accel * delta;
    }

    // apply movement
    controls.moveRight(-movementState.velocity.x * delta);
    controls.moveForward(-movementState.velocity.z * delta);

    // vertical movement (langsung ke object controls)
    controls.getObject().position.y += (-movementState.velocity.y * delta);
  }

  movementState.prevTime = time;
}