export const LAB = {

  windows: {

    right: {
      enabled: true,
      inset: 0,
      rotationY: -Math.PI / 2,

      openings: [

        // lubang ke-1
        {
          id: "R1",
          z: -12.0,
          bottom: 1.1,
          height: 3.2,
          width: 6.4,
          instances: [
            {
              modelKey: "rightWindow",
              count: 2,
              gapZ: 0,
            },
          ],
        },

        // lubang ke-2
        {
          id: "R2",
          z: -4.8,
          bottom: 1.1,
          height: 3.2,
          width: 6.4,
          instances: [
            {
              modelKey: "rightWindow",
              count: 2,
              gapZ: 0,
            },
          ],
        },

        // lubang ke-3
        {
          id: "R3",
          z: 7.0,
          bottom: 1.1,
          height: 3.2,
          width: 9.6,
          instances: [
            {
              modelKey: "rightWindow",
              count: 3,
              gapZ: 0,
            },
          ],
        },

      ],
    },

    left: {
      enabled: true,
      inset: 0,
      rotationX: 0,
      rotationY: 0, // rotate 90°
      rotationZ: 0,
      // mirror: true, // bukaan daun jendela

      openings: [
        { id: "L1", z: -8.0, bottom: 2.7, height: 1.6, width: 13.6,
          instances: [{ modelKey: "leftWindow", count: 12, gapZ: 0 }] },
        { id: "L2", z: 5.0, bottom: 2.7, height: 1.6, width: 6.8,
          instances: [{ modelKey: "leftWindow", count: 6, gapZ: 0 }] },
      ],
    },
  },

  room: {
    floorW: 19.5,
    floorH: 32,
    wallHeight: 6,
  },

  backRoom: {
    offsetZ: -2,
    depth: 6,
    numRooms: 3,
    doorWidth: 1.8,
    doorHeight: 3.7,
    wallThickness: 0.2,
  },

  doors: {
    leftBack: {
      enabled: true,
      inset: -0.02,   // sedikit keluar
      z: 11.0,        // posisi pintu
      bottom: 0.0,    // dari lantai
      height: 3.7,    // tinggi lubang pintu
      width: 3.3,     // lebar lubang pintu
    },
  },

  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    startPos: [0, 1.6, 2],
    startRotY: Math.PI, 
  },

  movement: {
    damping: 10.0,
    accel: 100.0,
  },

  spawn: {
    desks: {
      rows: 9,
      colsPerSide: 3,
      aisleGap: 1.5,
      deskSpacingX: 2.23,
      deskSpacingZ: 2.0,
    },
  },

  ceiling: {
    enabled: true,
    name: "CeilingRoot",
    y: null,
    color: 0xf7f7f7,
    roughness: 0.95,
    metalness: 0.0,
    castShadow: false,
    receiveShadow: true,
    main: { enabled: true, inset: -0.05 },
    backRoom: { enabled: true, inset: -0.05 },
  
    lamps: {
      enabled: true,
      modelKey: "ceilingLamp",
      parentName: "CeilingRoot",
    
      yOffset: -0.02,
    
      rows: 4,
      cols: 3,
      startX: -5.8,
      startZ: -10.5,
      spacingX: 5.8,
      spacingZ: 6.5,
    
      rotation: [0, 0, 0],
      scaleMul: [1, 1, 1],
      emissive: {
        enabled: true,
        color: 0xffffff,
        onIntensity: 1.5,
        offIntensity: 0.05,
      },
  
      light: {
        enabled: true,
        type: "spot",   
        color: 0xffffff,
        intensity: 2.0,  
        distance: 18,
        angle: Math.PI / 3,
        penumbra: 0.5,
        decay: 2,
        castShadow: false, 
        shadowMapSize: 1024,
        zBias: -0.0005,
      },
    
      defaultOn: true,
    },

  },

  materials: {
    wall:    { color: 0xE8E8E8, roughness: 0.95, metalness: 0.0 },
    floor:   { color: 0xCCCCCC, roughness: 0.75, metalness: 0.0 },
    ceiling: { color: 0xffffff, roughness: 0.98, metalness: 0.0 },
  },

  render: {
    bg: 0xa8a8a8,
    fogEnabled: false,
    fogNear: 50,
    fogFar: 200,
    envIntensity: 0.10,
    toneExposure: 0.65,
  },

  light: {
    ambientIntensity: 0.03,
  
    sunIntensity: 1.2,
    sunPos: [18, 14, -18],
  
    targetY: 0.0,
  
    shadowMapSize: 4096,
    shadowRadius: 1,  
    shadowBias: -0.0002,
    shadowNormalBias: 0.03,
  
    shadowFrustumPadding: 6,
    shadowNear: 1,
    shadowFar: 120,
  },

};