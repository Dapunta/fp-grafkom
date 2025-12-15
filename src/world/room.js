// src/world/room.js
import * as THREE from "three";
import { LAB } from "../config/labConfig.js";

export function buildRoom(scene) {
  const { floorW, floorH, wallHeight } = LAB.room;

  const wallMat = new THREE.MeshStandardMaterial({
    ...LAB.materials.wall,
    side: THREE.DoubleSide,
  });

  const floorMat = new THREE.MeshStandardMaterial({
    ...LAB.materials.floor,
    side: THREE.DoubleSide,
  });

  // =======================
  // Lantai UTAMA
  // =======================
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorW, floorH), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const gridHelper = new THREE.GridHelper(
    Math.max(floorW, floorH),
    50,
    0x888888,
    0x888888
  );
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // =======================
  // RUANGAN BELAKANG
  // =======================
  const offsetZ = LAB.backRoom?.offsetZ ?? 0;
  buildBackRoom(scene, floorW, floorH, wallHeight, floorMat, wallMat, offsetZ);

  // =======================
  // Dinding depan
  // =======================
  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(floorW, wallHeight), wallMat);
  frontWall.position.set(0, wallHeight / 2, -floorH / 2);
  frontWall.receiveShadow = true;
  scene.add(frontWall);

  // =======================
  // TEMBOK UNTUK TV (KIRI DAN KANAN)
  // =======================
  const tvWallDepth = 1.5;
  const tvWallZPosition = 0;

  // kiri
  const tvWallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallHeight, tvWallDepth), wallMat);
  tvWallLeft.position.set(-floorW / 2 + tvWallDepth, wallHeight / 2, tvWallZPosition);
  tvWallLeft.receiveShadow = true;
  tvWallLeft.castShadow = true;
  scene.add(tvWallLeft);

  const tvWallLeftFront = new THREE.Mesh(new THREE.BoxGeometry(tvWallDepth, wallHeight, 0.2), wallMat);
  tvWallLeftFront.position.set(-floorW / 2 + tvWallDepth / 2, wallHeight / 2, tvWallZPosition + tvWallDepth / 2);
  tvWallLeftFront.receiveShadow = true;
  tvWallLeftFront.castShadow = true;
  scene.add(tvWallLeftFront);

  const tvWallLeftBack = new THREE.Mesh(new THREE.BoxGeometry(tvWallDepth, wallHeight, 0.2), wallMat);
  tvWallLeftBack.position.set(-floorW / 2 + tvWallDepth / 2, wallHeight / 2, tvWallZPosition - tvWallDepth / 2);
  tvWallLeftBack.receiveShadow = true;
  tvWallLeftBack.castShadow = true;
  scene.add(tvWallLeftBack);

  // kanan
  const tvWallRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallHeight, tvWallDepth), wallMat);
  tvWallRight.position.set(floorW / 2 - tvWallDepth, wallHeight / 2, tvWallZPosition);
  tvWallRight.receiveShadow = true;
  tvWallRight.castShadow = true;
  scene.add(tvWallRight);

  const tvWallRightFront = new THREE.Mesh(new THREE.BoxGeometry(tvWallDepth, wallHeight, 0.2), wallMat);
  tvWallRightFront.position.set(floorW / 2 - tvWallDepth / 2, wallHeight / 2, tvWallZPosition + tvWallDepth / 2);
  tvWallRightFront.receiveShadow = true;
  tvWallRightFront.castShadow = true;
  scene.add(tvWallRightFront);

  const tvWallRightBack = new THREE.Mesh(new THREE.BoxGeometry(tvWallDepth, wallHeight, 0.2), wallMat);
  tvWallRightBack.position.set(floorW / 2 - tvWallDepth / 2, wallHeight / 2, tvWallZPosition - tvWallDepth / 2);
  tvWallRightBack.receiveShadow = true;
  tvWallRightBack.castShadow = true;
  scene.add(tvWallRightBack);
}

// ======================================================
// buildBackRoom
// ======================================================
export function buildBackRoom(scene, floorW, floorH, wallHeight, floorMat, wallMat, offsetZ = 0) {
  const backRoomDepth = LAB.backRoom?.depth ?? 6;
  const backRoomWidth = floorW;

  const numRooms = LAB.backRoom?.numRooms ?? 3;
  const roomWidth = backRoomWidth / numRooms;

  const doorWidth = LAB.backRoom?.doorWidth ?? 1.8;
  const doorHeight = LAB.backRoom?.doorHeight ?? 3.7;
  const wallThickness = LAB.backRoom?.wallThickness ?? 0.2;

  const glassWidth = roomWidth - doorWidth;
  const frontZ = floorH / 2 + offsetZ; // posisi partisi ruangan belakang

  // lantai + grid
  const backRoomFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(backRoomWidth, backRoomDepth),
    floorMat
  );
  backRoomFloor.rotation.x = -Math.PI / 2;
  backRoomFloor.position.set(0, 0, frontZ + backRoomDepth / 2);
  backRoomFloor.receiveShadow = true;
  scene.add(backRoomFloor);

  const backRoomGrid = new THREE.GridHelper(
    Math.max(backRoomWidth, backRoomDepth),
    50,
    0x888888,
    0x888888
  );
  backRoomGrid.position.set(0, 0.01, frontZ + backRoomDepth / 2);
  scene.add(backRoomGrid);

  // dinding paling belakang
  const backRoomBackWall = new THREE.Mesh(
    new THREE.PlaneGeometry(backRoomWidth, wallHeight),
    wallMat
  );
  backRoomBackWall.position.set(0, wallHeight / 2, frontZ + backRoomDepth);
  backRoomBackWall.receiveShadow = true;
  scene.add(backRoomBackWall);

  // material kaca + frame
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaccdd,
    metalness: 0.0,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.7,
    roughness: 0.3,
  });

  // loop 3 ruangan
  for (let i = 0; i < numRooms; i++) {
    const currentRoomLeftX = (-floorW / 2) + (i * roomWidth);

    // pola pintu: room 0 pintu kanan, sisanya pintu kiri
    const isDoorRight = i < 1;

    let glassCenterX, doorCenterX, verticalFrameX;

    if (isDoorRight) {
      glassCenterX = currentRoomLeftX + glassWidth / 2;
      doorCenterX = currentRoomLeftX + glassWidth + doorWidth / 2;
      verticalFrameX = currentRoomLeftX + glassWidth;
    } else {
      doorCenterX = currentRoomLeftX + doorWidth / 2;
      glassCenterX = currentRoomLeftX + doorWidth + glassWidth / 2;
      verticalFrameX = currentRoomLeftX + doorWidth;
    }

    const solidHeight = doorHeight / 2;
    const midGlassHeight = doorHeight / 2;
    const topGlassHeight = Math.max(0, wallHeight - doorHeight);

    // bawah solid
    const bottomWall = new THREE.Mesh(
      new THREE.BoxGeometry(glassWidth, solidHeight, 0.1),
      wallMat
    );
    bottomWall.position.set(glassCenterX, solidHeight / 2, frontZ);
    bottomWall.receiveShadow = true;
    bottomWall.castShadow = true;
    scene.add(bottomWall);

    // tengah kaca
    const middleGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(glassWidth, midGlassHeight),
      glassMat
    );
    middleGlass.position.set(glassCenterX, solidHeight + midGlassHeight / 2, frontZ);
    middleGlass.receiveShadow = true;
    middleGlass.castShadow = true;
    scene.add(middleGlass);

    // atas kaca
    const topGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(glassWidth, topGlassHeight),
      glassMat
    );
    topGlass.position.set(glassCenterX, doorHeight + topGlassHeight / 2, frontZ);
    topGlass.receiveShadow = true;
    topGlass.castShadow = true;
    scene.add(topGlass);

    // frame horizontal
    const frameFloor = new THREE.Mesh(new THREE.BoxGeometry(glassWidth, 0.1, 0.12), frameMat);
    frameFloor.position.set(glassCenterX, 0.05, frontZ);
    scene.add(frameFloor);

    const frameMid1 = new THREE.Mesh(new THREE.BoxGeometry(glassWidth, 0.1, 0.12), frameMat);
    frameMid1.position.set(glassCenterX, solidHeight, frontZ);
    scene.add(frameMid1);

    const frameMid2 = new THREE.Mesh(new THREE.BoxGeometry(glassWidth, 0.1, 0.12), frameMat);
    frameMid2.position.set(glassCenterX, doorHeight, frontZ);
    scene.add(frameMid2);

    const frameCeiling = new THREE.Mesh(new THREE.BoxGeometry(glassWidth, 0.1, 0.12), frameMat);
    frameCeiling.position.set(glassCenterX, wallHeight, frontZ);
    scene.add(frameCeiling);

    // pintu (header kaca)
    const doorHeaderHeight = Math.max(0, wallHeight - doorHeight);

    const doorHeaderGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(doorWidth, doorHeaderHeight),
      glassMat
    );
    doorHeaderGlass.position.set(doorCenterX, wallHeight - (doorHeaderHeight / 2), frontZ);
    scene.add(doorHeaderGlass);

    const frameDoorLintel = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 0.1, 0.05), frameMat);
    frameDoorLintel.position.set(doorCenterX, doorHeight, frontZ);
    scene.add(frameDoorLintel);

    const frameDoorTop = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 0.1, 0.05), frameMat);
    frameDoorTop.position.set(doorCenterX, wallHeight, frontZ);
    scene.add(frameDoorTop);

    // frame vertikal pemisah
    const frameVertical = new THREE.Mesh(new THREE.BoxGeometry(0.1, wallHeight, 0.05), frameMat);
    frameVertical.position.set(verticalFrameX, wallHeight / 2, frontZ);
    scene.add(frameVertical);

    // sekat antar ruangan
    if (i < numRooms - 1) {
      const dividerWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, backRoomDepth),
        wallMat
      );
      dividerWall.position.set(
        currentRoomLeftX + roomWidth,
        wallHeight / 2,
        frontZ + backRoomDepth / 2
      );
      dividerWall.receiveShadow = true;
      dividerWall.castShadow = true;
      scene.add(dividerWall);
    }
  }

  // side walls
  buildLeftWallWithOptionalWindow(scene, floorW, floorH, backRoomDepth, wallHeight, wallMat, offsetZ);
  buildRightWallWithOptionalWindow(scene, floorW, floorH, backRoomDepth, wallHeight, wallMat, offsetZ);
}

// ======================================================
// LEFT WALL + OPENINGS
// ======================================================
function buildLeftWallWithOptionalWindow(scene, floorW, floorH, backRoomDepth, wallHeight, wallMat, offsetZ = 0) {
  const winCfg = LAB.windows?.left;

  // optional: lubang pintu (khusus glass_door.obj)
  const doorCfg = LAB.doors?.leftBack;
  const doorOpening = (doorCfg?.enabled)
    ? { id: "DOOR_LEFT_BACK", z: doorCfg.z, bottom: doorCfg.bottom, height: doorCfg.height, width: doorCfg.width }
    : null;

  const wallZMin = -floorH / 2;
  const wallZMax = floorH / 2 + backRoomDepth + offsetZ;
  const wallX = -floorW / 2;
  const rotY = Math.PI / 2;

  const holeList = [
    ...(winCfg?.enabled && Array.isArray(winCfg.openings) ? winCfg.openings : []),
    ...(doorOpening ? [doorOpening] : []),
  ];

  // fallback: dinding full
  if (holeList.length === 0) {
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(wallZMax - wallZMin, wallHeight), wallMat);
    leftWall.position.set(wallX, wallHeight / 2, (wallZMin + wallZMax) / 2);
    leftWall.rotation.y = rotY;
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    return;
  }

  const openings = holeList
    .map((o) => ({ ...o, zMin: o.z - o.width / 2, zMax: o.z + o.width / 2 }))
    .filter((o) => o.width > 0 && o.height > 0)
    .sort((a, b) => a.zMin - b.zMin);

  const addPanel = (widthZ, heightY, centerZ, centerY) => {
    if (widthZ <= 0.0001 || heightY <= 0.0001) return;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(widthZ, heightY), wallMat);
    m.position.set(wallX, centerY, centerZ);
    m.rotation.y = rotY;
    m.receiveShadow = true;
    scene.add(m);
  };

  let cursor = wallZMin;

  for (const o of openings) {
    const openZMin = Math.max(o.zMin, wallZMin);
    const openZMax = Math.min(o.zMax, wallZMax);
    if (openZMax <= openZMin) continue;

    addPanel(openZMin - cursor, wallHeight, (cursor + openZMin) / 2, wallHeight / 2);
    addPanel(openZMax - openZMin, o.bottom, (openZMin + openZMax) / 2, o.bottom / 2);

    const topH = Math.max(0, wallHeight - (o.bottom + o.height));
    addPanel(openZMax - openZMin, topH, (openZMin + openZMax) / 2, o.bottom + o.height + topH / 2);

    cursor = openZMax;
  }

  addPanel(wallZMax - cursor, wallHeight, (cursor + wallZMax) / 2, wallHeight / 2);
}

// ======================================================
// RIGHT WALL + OPENINGS
// ======================================================
function buildRightWallWithOptionalWindow(scene, floorW, floorH, backRoomDepth, wallHeight, wallMat, offsetZ = 0) {
  const cfg = LAB.windows?.right;

  const wallZMin = -floorH / 2;
  const wallZMax = floorH / 2 + backRoomDepth + offsetZ;
  const wallX = floorW / 2;
  const rotY = -Math.PI / 2;

  if (!cfg?.enabled || !Array.isArray(cfg.openings) || cfg.openings.length === 0) {
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(wallZMax - wallZMin, wallHeight), wallMat);
    rightWall.position.set(wallX, wallHeight / 2, (wallZMin + wallZMax) / 2);
    rightWall.rotation.y = rotY;
    rightWall.receiveShadow = true;
    scene.add(rightWall);
    return;
  }

  const openings = cfg.openings
    .map((o) => ({ ...o, zMin: o.z - o.width / 2, zMax: o.z + o.width / 2 }))
    .filter((o) => o.width > 0 && o.height > 0)
    .sort((a, b) => a.zMin - b.zMin);

  const addPanel = (widthZ, heightY, centerZ, centerY) => {
    if (widthZ <= 0.0001 || heightY <= 0.0001) return;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(widthZ, heightY), wallMat);
    m.position.set(wallX, centerY, centerZ);
    m.rotation.y = rotY;
    m.receiveShadow = true;
    scene.add(m);
  };

  let cursor = wallZMin;

  for (const o of openings) {
    const openZMin = Math.max(o.zMin, wallZMin);
    const openZMax = Math.min(o.zMax, wallZMax);
    if (openZMax <= openZMin) continue;

    addPanel(openZMin - cursor, wallHeight, (cursor + openZMin) / 2, wallHeight / 2);
    addPanel(openZMax - openZMin, o.bottom, (openZMin + openZMax) / 2, o.bottom / 2);

    const topH = Math.max(0, wallHeight - (o.bottom + o.height));
    addPanel(openZMax - openZMin, topH, (openZMin + openZMax) / 2, o.bottom + o.height + topH / 2);

    cursor = openZMax;
  }

  addPanel(wallZMax - cursor, wallHeight, (cursor + wallZMax) / 2, wallHeight / 2);
}