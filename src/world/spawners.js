// src/world/spawners.js
import * as THREE from "three";
import { LAB } from "../config/labConfig.js";

function fitToRect(obj, targetWidthZ, targetHeightY) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);

  const horiz = Math.max(size.x, size.z) || 1;
  const sW = targetWidthZ / horiz;
  const sH = targetHeightY / (size.y || 1);
  const s = Math.min(sW, sH);

  obj.scale.multiplyScalar(s);

  obj.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(obj);
  const center = new THREE.Vector3();
  box2.getCenter(center);

  return { center };
}

function setEmissiveIntensity(obj, intensity) {
  obj.traverse((n) => {
    if (!n.isMesh) return;
    const mats = Array.isArray(n.material) ? n.material : [n.material];
    for (const m of mats) {
      if (!m) continue;
      if ("emissiveIntensity" in m) {
        m.emissiveIntensity = intensity;
        m.needsUpdate = true;
      }
    }
  });
}

function snapTopToLocalY(obj, targetLocalY = 0) {
  // pastikan bbox valid
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const maxY = box.max.y;

  // geser posisi Y supaya TOP objek ada di targetLocalY
  obj.position.y += (targetLocalY - maxY);
  obj.updateMatrixWorld(true);
}

function applyEmissive(obj, emissiveCfg) {
  if (!emissiveCfg?.enabled) return;

  const col = new THREE.Color(emissiveCfg.color ?? 0xffffff);
  const inten = emissiveCfg.intensity ?? 1.0;

  obj.traverse((n) => {
    if (!n.isMesh) return;
    const mats = Array.isArray(n.material) ? n.material : [n.material];
    for (const m of mats) {
      if (!m) continue;
      if ("emissive" in m) m.emissive = col;
      if ("emissiveIntensity" in m) m.emissiveIntensity = inten;
      m.needsUpdate = true;
    }
  });
}

// ============================
// CEILING LAMPS (REAL LIGHTS + TOGGLE)
// ============================
export function spawnCeilingLamps(scene, models) {
  const cfg = LAB.ceiling?.lamps;
  if (!cfg?.enabled) return;

  const base = models?.[cfg.modelKey];
  if (!base) {
    console.warn("[CeilingLamps] model not found:", cfg.modelKey);
    return;
  }

  const parentName = cfg.parentName || LAB.ceiling?.name || "CeilingRoot";
  const parent = scene.getObjectByName(parentName);
  if (!parent) {
    console.warn("[CeilingLamps] parent not found:", parentName);
    return;
  }

  // hapus lamp lama kalau ada
  const old = parent.getObjectByName("__CeilingLampGroup");
  if (old) old.removeFromParent();

  const group = new THREE.Group();
  group.name = "__CeilingLampGroup";
  parent.add(group);

  const state = {
    on: !!cfg.defaultOn,
    lights: [],
    emissiveMats: [],
  };

  const eCfg = cfg.emissive || {};
  const lCfg = cfg.light || {};

  const eColor = new THREE.Color(eCfg.color ?? 0xffffff);

  for (let r = 0; r < (cfg.rows ?? 1); r++) {
    for (let c = 0; c < (cfg.cols ?? 1); c++) {
      const lamp = base.clone(true);

      // pos relatif ke CeilingRoot (CeilingRoot sudah di y plafon)
      const x = (cfg.startX ?? 0) + c * (cfg.spacingX ?? 1);
      const z = (cfg.startZ ?? 0) + r * (cfg.spacingZ ?? 1);
      const y = (cfg.yOffset ?? -0.02);

      lamp.position.set(x, y, z);

      if (Array.isArray(cfg.rotation)) lamp.rotation.set(cfg.rotation[0], cfg.rotation[1], cfg.rotation[2]);
      if (Array.isArray(cfg.scaleMul)) lamp.scale.multiply(new THREE.Vector3(cfg.scaleMul[0], cfg.scaleMul[1], cfg.scaleMul[2]));

      // emissive hanya untuk "nyala visual", bukan penerangan
      if (eCfg.enabled) {
        lamp.traverse((n) => {
          if (!n.isMesh) return;
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          for (const m of mats) {
            if (!m || m.emissive === undefined) continue;
            m.emissive = eColor;
            m.emissiveIntensity = state.on ? (eCfg.onIntensity ?? 0.8) : (eCfg.offIntensity ?? 0.02);
            m.needsUpdate = true;
            state.emissiveMats.push(m);
          }
        });
      }

      group.add(lamp);

      // ✅ ini yang bikin ruangan beneran kena cahaya
      if (lCfg.enabled) {
        const spot = new THREE.SpotLight(
          lCfg.color ?? 0xffffff,
          state.on ? (lCfg.intensity ?? 0.25) : 0,   // IMPORTANT
          lCfg.distance ?? 10,
          lCfg.angle ?? (Math.PI / 4),
          lCfg.penumbra ?? 0.7,
          lCfg.decay ?? 2
        );

        // posisi lampu cahaya sedikit di bawah plafon
        spot.position.set(x, y - 0.03, z);

        // arahkan ke bawah (ke lantai)
        spot.target.position.set(x, -3, z);

        spot.castShadow = !!lCfg.castShadow;
        if (spot.castShadow) {
          const ms = lCfg.shadowMapSize ?? 1024;
          spot.shadow.mapSize.set(ms, ms);
          spot.shadow.bias = lCfg.zBias ?? -0.0005;
        }

        group.add(spot);
        group.add(spot.target);
        state.lights.push(spot);
      }
    }
  }

  scene.userData.ceilingLamps = state;

  // apply initial
  setCeilingLampsOn(scene, state.on);
}

export function setCeilingLampsOn(scene, on) {
  const cfg = LAB.ceiling?.lamps;
  const st = scene.userData.ceilingLamps;
  if (!cfg || !st) return;

  st.on = !!on;

  const eCfg = cfg.emissive || {};
  const lCfg = cfg.light || {};

  // emissive (visual)
  for (const m of st.emissiveMats) {
    m.emissiveIntensity = st.on ? (eCfg.onIntensity ?? 0.8) : (eCfg.offIntensity ?? 0.02);
    m.needsUpdate = true;
  }

  // real lights
  for (const L of st.lights) {
    L.intensity = st.on ? (lCfg.intensity ?? 0.25) : 0;
    L.visible = true;
  }

  // OPTIONAL: biar beda makin terasa, turunin ambient saat lamp off
  const rig = scene.userData.lightRig;
  if (rig) {
    rig.ambient.intensity = st.on ? (LAB.light.ambientIntensity * 0.8) : (LAB.light.ambientIntensity * 0.4);
    rig.sun.intensity = st.on ? (LAB.light.sunIntensity * 0.35) : LAB.light.sunIntensity;
  }
}

/**
 * ============================
 * WINDOWS 
 * ============================
 */
export function spawnLeftWindows(scene, models) {
  const cfg = LAB.windows?.left;
  if (!cfg?.enabled) return;
  if (!Array.isArray(cfg.openings)) return;

  const wallX = -LAB.room.floorW / 2 + (cfg.inset ?? 0.05);
  const rotY = cfg.rotationY ?? Math.PI / 2;

  for (const o of cfg.openings) {
    const yCenter = o.bottom + o.height / 2;
    const instances = Array.isArray(o.instances) ? o.instances : [];

    for (const spec of instances) {
      const base = models?.[spec.modelKey];
      if (!base) continue;

      const count = Math.max(1, spec.count ?? 1);
      const gapZ = spec.gapZ ?? 0.2;
      const slotW = (o.width - gapZ * (count - 1)) / count;

      for (let i = 0; i < count; i++) {
        const w = base.clone(true);
        w.rotation.y = rotY;

        const { center } = fitToRect(w, slotW, o.height);

        const zLeft = o.z - o.width / 2;
        const z = zLeft + slotW / 2 + i * (slotW + gapZ);

        const target = new THREE.Vector3(wallX, yCenter, z);
        w.position.add(target.sub(center));

        scene.add(w);
      }
    }
  }
}

export function spawnRightWindows(scene, models) {
  const cfg = LAB.windows?.right;
  if (!cfg?.enabled) return;
  if (!Array.isArray(cfg.openings)) return;

  const wallX = LAB.room.floorW / 2 - (cfg.inset ?? 0.05);
  const rotY = cfg.rotationY ?? -Math.PI / 2;

  for (const o of cfg.openings) {
    const yCenter = o.bottom + o.height / 2;

    const instances = Array.isArray(o.instances) ? o.instances : [];
    for (const spec of instances) {
      const base = models?.[spec.modelKey];
      if (!base) continue;

      const count = Math.max(1, spec.count ?? 1);
      const gapZ = spec.gapZ ?? 0.2;
      const slotW = (o.width - gapZ * (count - 1)) / count;

      for (let i = 0; i < count; i++) {
        const w = base.clone(true);

        w.rotation.y = rotY;

        w.traverse((n) => {
          if (n.isMesh) {
            n.castShadow = true;
            n.receiveShadow = true;
          }
        });

        const { center } = fitToRect(w, slotW, o.height);

        const zLeft = o.z - o.width / 2;
        const z = zLeft + slotW / 2 + i * (slotW + gapZ);

        const target = new THREE.Vector3(wallX, yCenter, z);
        w.position.add(target.sub(center));

        scene.add(w);
      }
    }
  }
}

/**
 * ============================
 * GLASS DOOR (KHUSUS, TIDAK IKUT OPENINGS WINDOWS)
 * ============================
 * models.glassDoor = object hasil load glass_door.obj
 * LAB.doors.leftBack = { enabled, inset, z, bottom, height, width }
 */
function pickBestYawForLeftWall(obj) {
  // kandidat yaw untuk cari orientasi paling "tipis" di axis X (supaya nempel ke dinding kiri)
  const candidates = [0, Math.PI / 2, -Math.PI / 2, Math.PI];
  let bestYaw = 0;
  let bestScore = Infinity;

  const keepX = obj.rotation.x;
  const keepZ = obj.rotation.z;

  for (const yaw of candidates) {
    obj.rotation.set(keepX, yaw, keepZ);
    obj.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);

    const score = size.x; // makin kecil makin bagus
    if (score < bestScore) {
      bestScore = score;
      bestYaw = yaw;
    }
  }

  obj.rotation.set(keepX, bestYaw, keepZ);
  obj.updateMatrixWorld(true);
}

export function spawnGlassDoorLeftBack(scene, models) {
  const cfg = LAB.doors?.leftBack;
  if (!cfg?.enabled) return;

  const base = models?.glassDoor;
  if (!base) return;

  const door = base.clone(true);

  // reset transform supaya OBJ yang punya rotasi bawaan gak ikut bikin "ngaco"
  door.position.set(0, 0, 0);
  door.rotation.set(0, 0, 0);
  // door.scale.set(1, 1, 1);

  pickBestYawForLeftWall(door);

  // fit ke ukuran lubang pintu (width arah Z, height arah Y)
  const { center } = fitToRect(door, cfg.width, cfg.height);

  const wallX = -LAB.room.floorW / 2 + (cfg.inset ?? 0.05);
  const yCenter = (cfg.bottom ?? 0) + (cfg.height ?? 1) / 2;
  const z = cfg.z ?? 0;

  const target = new THREE.Vector3(wallX, yCenter, z);
  door.position.add(target.sub(center));

  door.traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
    }
  });

  scene.add(door);
}

/**
 * Spawn semua meja + kursi + monitor + mouse + cpu + keyboard
 */
export function spawnDesks(scene, models) {
  const { rows, colsPerSide, aisleGap, deskSpacingX, deskSpacingZ } = LAB.spawn.desks;
  const { meja, kursi, monitor, mouse, cpu, keyboard } = models;

  // ===== Meja kiri =====
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < colsPerSide; c++) {
      if (!meja) continue;

      const m = meja.clone();
      const x = -(aisleGap / 2) - c * deskSpacingX - 1.0;
      const z = -10 + r * deskSpacingZ;

      m.position.set(x, 0, z + 0.3);
      scene.add(m);

      if (kursi) {
        const k = kursi.clone();
        k.position.set(x, 0, z + 1.2);
        k.rotation.y = 0;
        scene.add(k);
      }

      if (monitor) {
        const mo = monitor.clone();
        mo.position.set(x, 1, z);
        mo.rotation.y = -190;
        scene.add(mo);
      }

      if (mouse) {
        const ms = mouse.clone();
        ms.position.set(x + 0.6, 0.95, z + 0.4);
        ms.rotation.y = 135;
        scene.add(ms);
      }

      if (cpu) {
        const cp = cpu.clone();
        cp.position.set(x + 0.65, 0.0, z + 0.4);
        cp.rotation.y = 0;
        scene.add(cp);
      }

      if (keyboard) {
        const kb = keyboard.clone();
        kb.position.set(x, 1, z + 0.4);
        kb.rotation.y = 0;
        scene.add(kb);
      }
    }
  }

  // ===== Meja kanan =====
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < colsPerSide; c++) {
      if (!meja) continue;

      const m = meja.clone();
      const x = aisleGap / 2 + c * deskSpacingX + 1.0;
      const z = -10 + r * deskSpacingZ;

      m.position.set(x, 0, z + 0.3);
      scene.add(m);

      if (kursi) {
        const k = kursi.clone();
        k.position.set(x, 0, z + 1.2);
        k.rotation.y = 0;
        scene.add(k);
      }

      if (monitor) {
        const mo = monitor.clone();
        mo.position.set(x, 1, z);
        mo.rotation.y = -190;
        scene.add(mo);
      }

      if (mouse) {
        const ms = mouse.clone();
        ms.position.set(x + 0.6, 0.95, z + 0.4);
        ms.rotation.y = 135;
        scene.add(ms);
      }

      if (cpu) {
        const cp = cpu.clone();
        cp.position.set(x + 0.65, 0.0, z + 0.4);
        cp.rotation.y = 0;
        scene.add(cp);
      }

      if (keyboard) {
        const kb = keyboard.clone();
        kb.position.set(x, 1, z + 0.4);
        kb.rotation.y = 0;
        scene.add(kb);
      }
    }
  }
}

/**
 * Spawn AC kiri & kanan
 */
export function spawnACs(scene, ac) {
  if (!ac) return;

  const acLeft1 = ac.clone();
  acLeft1.position.set(-9.5, 4.5, -5);
  acLeft1.rotation.y = Math.PI / 2;
  scene.add(acLeft1);

  const acLeft2 = ac.clone();
  acLeft2.position.set(-9.5, 4.5, 5);
  acLeft2.rotation.y = Math.PI / 2;
  scene.add(acLeft2);

  const acRight1 = ac.clone();
  acRight1.position.set(9.5, 4.5, -5);
  acRight1.rotation.y = -Math.PI / 2;
  scene.add(acRight1);

  const acRight2 = ac.clone();
  acRight2.position.set(9.5, 4.5, 5);
  acRight2.rotation.y = -Math.PI / 2;
  scene.add(acRight2);
}

/**
 * Spawn speaker
 */
export function spawnSpeakers(scene, speaker) {
  if (!speaker) return;

  const speakerLeft = speaker.clone();
  speakerLeft.position.set(-8, 2, -15.8);
  speakerLeft.rotation.y = 0;
  scene.add(speakerLeft);

  const speakerRight = speaker.clone();
  speakerRight.position.set(7.5, 2, -15.8);
  speakerRight.rotation.y = 0;
  scene.add(speakerRight);
}

/**
 * Spawn TV kiri & kanan
 */
export function spawnTVs(scene, tv) {
  if (!tv) return;

  const floorW = 19.5;
  const tvWallDepth = 1.5;
  const wallThickness = 0.2;
  const tvHeight = 3.5;
  const tvZ = 0;
  const offset = wallThickness / 2 + 0.05;

  const tvLeft = tv.clone();
  tvLeft.position.set(-floorW / 2 + tvWallDepth + offset, tvHeight + 1, tvZ + 0.82);
  tvLeft.rotation.y = Math.PI / 5;
  scene.add(tvLeft);

  const tvRight = tv.clone();
  tvRight.position.set(floorW / 2 - tvWallDepth - offset, tvHeight + 1, tvZ + 0.82);
  tvRight.rotation.y = -Math.PI / 5;
  scene.add(tvRight);
}

/**
 * Spawn platform
 */
export function spawnPlatforms(scene) {
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.6,
  });

  const platformLeft = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 18), platformMat);
  platformLeft.position.set(-8.5, 0.075, -1);
  platformLeft.receiveShadow = true;
  platformLeft.castShadow = true;
  scene.add(platformLeft);

  const platformRight = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 18), platformMat);
  platformRight.position.set(8.5, 0.075, -1);
  platformRight.receiveShadow = true;
  platformRight.castShadow = true;
  scene.add(platformRight);

  const frontPlatform = new THREE.Mesh(new THREE.BoxGeometry(13, 0.5, 8.3), platformMat);
  frontPlatform.position.set(0, 0.25, -14.5);
  frontPlatform.receiveShadow = true;
  frontPlatform.castShadow = true;
  scene.add(frontPlatform);

  const frontPlatformMini = new THREE.Mesh(new THREE.BoxGeometry(1, 0.25, 1), platformMat);
  frontPlatformMini.position.set(0, 0.125, -10.5);
  frontPlatformMini.receiveShadow = true;
  frontPlatformMini.castShadow = true;
  scene.add(frontPlatformMini);
}

export function spawnTeacherDesk(scene, mejaDosen) {
  if (!mejaDosen) return;

  const teacherDesk = mejaDosen.clone();
  teacherDesk.position.set(4, 0.5, -11.5);
  teacherDesk.rotation.y = -Math.PI;
  scene.add(teacherDesk);
}

export function spawnWhiteboard(scene, whiteboard) {
  if (!whiteboard) return;

  const w = whiteboard.clone();
  w.position.set(-3.5, 0.5, -12.5);
  w.rotation.y = -Math.PI / 4;
  scene.add(w);
}

export function spawnScreenProjector(scene, screenProjector) {
  if (!screenProjector) return;

  const s = screenProjector.clone();
  s.position.set(0, 4.5, -15.8);
  s.rotation.y = -Math.PI / 2;
  scene.add(s);
}