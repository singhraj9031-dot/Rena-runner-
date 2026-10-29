/**
 * Environment Builder for Rena Runner 3D
 * Generates stylized tracks, open-world cartoon backdrops (Light & Dark themes),
 * copyright-free commuter trains with walkable roofs/ramps, hurdles, coins, and power-ups.
 */

import * as THREE from 'three';
import { ObstacleType, PowerUpType, ThemeMode } from '../types/game';

export const LANE_WIDTH = 2.6;
export const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];

export interface TrackObstacle {
  id: string;
  type: ObstacleType;
  mesh: THREE.Group;
  lane: number;
  z: number;
  width: number;
  height: number;
  length: number;
  canRunOnTop: boolean;
  topHeight: number;
  requiresSlide: boolean;
  requiresJump: boolean;
  hasRamp: boolean;
}

export interface TrackCoin {
  id: string;
  mesh: THREE.Group;
  lane: number;
  z: number;
  y: number;
  collected: boolean;
}

export interface TrackPowerUp {
  id: string;
  type: PowerUpType;
  mesh: THREE.Group;
  lane: number;
  z: number;
  y: number;
  collected: boolean;
}

export interface TrackChunk {
  group: THREE.Group;
  startZ: number;
  endZ: number;
  obstacles: TrackObstacle[];
  coins: TrackCoin[];
  powerUps: TrackPowerUp[];
}

export class EnvironmentBuilder {
  private theme: ThemeMode;
  public materials: { [key: string]: THREE.Material } = {};

  constructor(theme: ThemeMode) {
    this.theme = theme;
    this.initMaterials();
  }

  public setTheme(theme: ThemeMode) {
    this.theme = theme;
    this.initMaterials();
  }

  private initMaterials() {
    const isLight = this.theme === 'light';

    // Track Ground Ballast
    this.materials.ground = new THREE.MeshStandardMaterial({
      color: isLight ? 0xe2e8f0 : 0x1e293b,
      roughness: 0.85,
      metalness: 0.1,
    });

    // Steel Rails
    this.materials.rail = new THREE.MeshStandardMaterial({
      color: isLight ? 0x94a3b8 : 0x64748b,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Wooden / Concrete Ties
    this.materials.sleeper = new THREE.MeshStandardMaterial({
      color: isLight ? 0x78350f : 0x334155,
      roughness: 0.9,
    });

    // Side Borders & Curbs
    this.materials.curb = new THREE.MeshStandardMaterial({
      color: isLight ? 0xf8fafc : 0x0f172a,
      roughness: 0.5,
    });

    // Neon Track Trim
    this.materials.trim = new THREE.MeshStandardMaterial({
      color: isLight ? 0x0284c7 : 0xa855f7,
      emissive: isLight ? 0x38bdf8 : 0x9333ea,
      emissiveIntensity: isLight ? 0.3 : 0.8,
    });

    // Train Body
    this.materials.trainBody = new THREE.MeshStandardMaterial({
      color: isLight ? 0x0284c7 : 0x6366f1,
      roughness: 0.35,
      metalness: 0.4,
    });

    this.materials.trainAccent = new THREE.MeshStandardMaterial({
      color: isLight ? 0xf59e0b : 0x06b6d4,
      roughness: 0.3,
      metalness: 0.5,
    });

    this.materials.trainRoof = new THREE.MeshStandardMaterial({
      color: isLight ? 0x334155 : 0x1e1b4b,
      roughness: 0.7,
      metalness: 0.2,
    });

    this.materials.trainWindow = new THREE.MeshStandardMaterial({
      color: isLight ? 0x1e293b : 0x38bdf8,
      emissive: isLight ? 0x0f172a : 0x0284c7,
      emissiveIntensity: isLight ? 0.1 : 0.6,
      roughness: 0.1,
      metalness: 0.9,
    });

    // Low Barrier Hurdle
    this.materials.barrierYellow = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.4,
    });

    this.materials.barrierStripe = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
    });

    // High Gantry
    this.materials.gantryFrame = new THREE.MeshStandardMaterial({
      color: isLight ? 0xef4444 : 0xec4899,
      roughness: 0.4,
      metalness: 0.3,
    });

    // Coins
    this.materials.coin = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.45,
      metalness: 0.85,
      roughness: 0.2,
    });

    // Magnet PowerUp
    this.materials.magnetRed = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.3,
    });

    // Multiplier PowerUp
    this.materials.multiplierGold = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      metalness: 0.7,
      roughness: 0.2,
    });

    // Shield PowerUp
    this.materials.shieldCyan = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.7,
      metalness: 0.5,
      roughness: 0.2,
    });

    // Super Jump PowerUp
    this.materials.sneakerGreen = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      metalness: 0.5,
      roughness: 0.3,
    });

    // City Buildings & Trees
    this.materials.buildingA = new THREE.MeshStandardMaterial({
      color: isLight ? 0x93c5fd : 0x1e1b4b,
      roughness: 0.6,
    });
    this.materials.buildingB = new THREE.MeshStandardMaterial({
      color: isLight ? 0xfca5a5 : 0x312e81,
      roughness: 0.6,
    });
    this.materials.buildingC = new THREE.MeshStandardMaterial({
      color: isLight ? 0xfde047 : 0x4338ca,
      roughness: 0.6,
    });
    this.materials.treeTrunk = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.9,
    });
    this.materials.treeFoliage = new THREE.MeshStandardMaterial({
      color: isLight ? 0x22c55e : 0x10b981,
      roughness: 0.7,
    });
  }

  /**
   * Builds the static world elements (Skybox dome, distant city, ambient scenery)
   */
  public buildSkyAndDistantWorld(scene: THREE.Scene): { skyMesh: THREE.Mesh; sceneryGroup: THREE.Group } {
    const isLight = this.theme === 'light';

    // 1. Sky Dome with smooth vertical gradient
    const skyGeo = new THREE.SphereGeometry(300, 32, 24);
    skyGeo.scale(-1, 1, 1);

    // Procedural Sky canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 256);

    if (isLight) {
      grad.addColorStop(0, '#0284c7'); // Rich azure top
      grad.addColorStop(0.4, '#38bdf8'); // Sky blue mid
      grad.addColorStop(0.75, '#bae6fd'); // Warm light horizon
      grad.addColorStop(1, '#fed7aa'); // Golden sunlight haze
    } else {
      grad.addColorStop(0, '#090d16'); // Cosmic dark apex
      grad.addColorStop(0.45, '#1e1b4b'); // Deep indigo
      grad.addColorStop(0.8, '#312e81'); // Purple dusk horizon
      grad.addColorStop(1, '#4c1d95'); // Neon violet skyline glow
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 256);

    const skyTex = new THREE.CanvasTexture(canvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // 2. Open World Scenery Group (Floating cartoon clouds, distant skyscrapers, bridges)
    const sceneryGroup = new THREE.Group();
    sceneryGroup.name = 'OpenWorldScenery';

    // Distant Skylines on Left & Right sides (Z range -200 to +100)
    for (let side = -1; side <= 1; side += 2) {
      const xOffset = side * (18 + Math.random() * 4);
      for (let z = -250; z < 100; z += 18) {
        const height = 18 + Math.random() * 32;
        const width = 8 + Math.random() * 6;
        const depth = 8 + Math.random() * 6;
        const bldgGeo = new THREE.BoxGeometry(width, height, depth);
        bldgGeo.translate(0, height * 0.5, 0);

        const mats = [this.materials.buildingA, this.materials.buildingB, this.materials.buildingC];
        const bldgMat = mats[Math.floor(Math.random() * mats.length)];
        const bldg = new THREE.Mesh(bldgGeo, bldgMat);
        bldg.position.set(xOffset + (Math.random() * 6 - 3), -2, z);
        sceneryGroup.add(bldg);

        // Stylized Windows
        const windowGeo = new THREE.BoxGeometry(width * 0.85, height * 0.8, 0.2);
        windowGeo.translate(0, height * 0.5, 0);
        const winMat = new THREE.MeshBasicMaterial({
          color: isLight ? 0xffffff : 0x67e8f9,
          transparent: true,
          opacity: isLight ? 0.25 : 0.7,
        });
        const win = new THREE.Mesh(windowGeo, winMat);
        win.position.set(xOffset + (Math.random() * 6 - 3), -2, z + (side > 0 ? -depth * 0.51 : depth * 0.51));
        sceneryGroup.add(win);
      }
    }

    // Stylized Puffy Clouds in the sky (Low poly clusters)
    const cloudMat = new THREE.MeshBasicMaterial({
      color: isLight ? 0xffffff : 0xa5b4fc,
      transparent: true,
      opacity: isLight ? 0.85 : 0.35,
    });

    for (let c = 0; c < 14; c++) {
      const cloudGroup = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < numPuffs; p++) {
        const puffGeo = new THREE.SphereGeometry(3 + Math.random() * 3.5, 8, 8);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(p * 3.5, Math.random() * 1.5, Math.random() * 2);
        cloudGroup.add(puff);
      }
      cloudGroup.position.set(
        (Math.random() - 0.5) * 160,
        35 + Math.random() * 45,
        -180 + Math.random() * 280
      );
      sceneryGroup.add(cloudGroup);
    }

    // Cartoon Palm Trees & Streetlights along track verge
    for (let side = -1; side <= 1; side += 2) {
      const treeX = side * 5.8;
      for (let z = -200; z < 50; z += 16) {
        // Tree trunk
        const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 4.5, 6);
        trunkGeo.translate(0, 2.25, 0);
        const trunk = new THREE.Mesh(trunkGeo, this.materials.treeTrunk);
        trunk.position.set(treeX, 0, z);

        // Foliage Crown
        const leavesGeo = new THREE.ConeGeometry(1.6, 3.2, 6);
        leavesGeo.translate(0, 1.6, 0);
        const leaves = new THREE.Mesh(leavesGeo, this.materials.treeFoliage);
        leaves.position.set(0, 4.0, 0);
        trunk.add(leaves);

        sceneryGroup.add(trunk);
      }
    }

    scene.add(sceneryGroup);
    return { skyMesh, sceneryGroup };
  }

  /**
   * Builds an infinite track chunk of length `chunkLength` (e.g. 60 units)
   */
  public createTrackChunk(
    chunkIndex: number,
    startZ: number,
    chunkLength: number,
    difficultyMultiplier: number
  ): TrackChunk {
    const endZ = startZ - chunkLength;
    const group = new THREE.Group();
    group.name = `TrackChunk_${chunkIndex}`;
    group.position.set(0, 0, 0);

    const isLight = this.theme === 'light';
    const obstacles: TrackObstacle[] = [];
    const coins: TrackCoin[] = [];
    const powerUps: TrackPowerUp[] = [];

    // 1. Ground Surface (3 Lanes + Side Shoulders)
    const totalTrackWidth = LANE_WIDTH * 3 + 3.0; // ~10.8m
    const groundGeo = new THREE.PlaneGeometry(totalTrackWidth, chunkLength);
    groundGeo.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeo, this.materials.ground);
    ground.position.set(0, -0.02, startZ - chunkLength * 0.5);
    ground.receiveShadow = true;
    group.add(ground);

    // 2. Concrete Sleepers & Steel Rails for each of the 3 lanes
    const sleeperSpacing = 2.4;
    const numSleepers = Math.floor(chunkLength / sleeperSpacing);
    const sleeperGeo = new THREE.BoxGeometry(totalTrackWidth - 0.8, 0.08, 0.35);

    for (let s = 0; s < numSleepers; s++) {
      const zPos = startZ - s * sleeperSpacing;
      const sleeper = new THREE.Mesh(sleeperGeo, this.materials.sleeper);
      sleeper.position.set(0, 0.02, zPos);
      sleeper.receiveShadow = true;
      group.add(sleeper);
    }

    // Steel rails: 2 rails per lane = 6 rails total
    LANES.forEach((laneX) => {
      const railWidth = 0.08;
      const railHeight = 0.12;
      const railSpacing = 1.2;

      [-railSpacing * 0.5, railSpacing * 0.5].forEach((rx) => {
        const railGeo = new THREE.BoxGeometry(railWidth, railHeight, chunkLength);
        const rail = new THREE.Mesh(railGeo, this.materials.rail);
        rail.position.set(laneX + rx, railHeight * 0.5, startZ - chunkLength * 0.5);
        group.add(rail);
      });
    });

    // 3. Track Boundary Curbs & Neon Guide Stripes
    const curbGeo = new THREE.BoxGeometry(0.35, 0.4, chunkLength);
    [-totalTrackWidth * 0.5, totalTrackWidth * 0.5].forEach((cx) => {
      const curb = new THREE.Mesh(curbGeo, this.materials.curb);
      curb.position.set(cx, 0.2, startZ - chunkLength * 0.5);
      group.add(curb);

      const stripGeo = new THREE.BoxGeometry(0.1, 0.06, chunkLength);
      const strip = new THREE.Mesh(stripGeo, this.materials.trim);
      strip.position.set(cx + (cx > 0 ? -0.2 : 0.2), 0.42, startZ - chunkLength * 0.5);
      group.add(strip);
    });

    // 4. Procedural Obstacles, Coins & Power-ups along this chunk
    // Keep first 2 chunks safe (for title / game start calm period)
    if (chunkIndex > 1) {
      this.populateObstaclesAndItems(
        group,
        startZ,
        chunkLength,
        difficultyMultiplier,
        obstacles,
        coins,
        powerUps
      );
    }

    return {
      group,
      startZ,
      endZ,
      obstacles,
      coins,
      powerUps,
    };
  }

  private populateObstaclesAndItems(
    chunkGroup: THREE.Group,
    startZ: number,
    chunkLength: number,
    difficulty: number,
    obstacles: TrackObstacle[],
    coins: TrackCoin[],
    powerUps: TrackPowerUp[]
  ) {
    const spacing = 18; // distance between obstacle clusters
    const count = Math.floor(chunkLength / spacing);

    for (let i = 0; i < count; i++) {
      const zPos = startZ - 8 - i * spacing;

      // Decide pattern: Train, Hurdle Low, Hurdle High, Sign, or Coin Arc
      const rand = Math.random();
      const freeLane = Math.floor(Math.random() * 3); // Guaranteed at least one clear lane or safe path

      // Spawn Power-up occasionally (every ~3-4 intervals)
      if (Math.random() < 0.25) {
        const puTypes: PowerUpType[] = ['magnet', 'multiplier', 'shield', 'superJump'];
        const pType = puTypes[Math.floor(Math.random() * puTypes.length)];
        const puLane = Math.floor(Math.random() * 3);
        const pu = this.createPowerUpMesh(pType, LANES[puLane], zPos - 4, 1.2);
        chunkGroup.add(pu.mesh);
        powerUps.push(pu);
      }

      if (rand < 0.38) {
        // --- 1. Commuter Train (Optionally with ramp or elevated roof) ---
        const trainLane = Math.floor(Math.random() * 3);
        const hasRamp = Math.random() < 0.4;
        const train = this.createTrainObstacle(
          hasRamp ? 'train_ramp' : 'train_standard',
          LANES[trainLane],
          zPos,
          hasRamp
        );
        chunkGroup.add(train.mesh);
        obstacles.push(train);

        // Put coins on top of the train roof!
        for (let cz = zPos - 4; cz >= zPos - 12; cz -= 2.2) {
          const coin = this.createCoinMesh(LANES[trainLane], cz, train.topHeight + 0.6);
          chunkGroup.add(coin.mesh);
          coins.push(coin);
        }

        // Put coins in the adjacent open lane
        const sideLane = (trainLane + 1) % 3;
        for (let cz = zPos + 4; cz >= zPos - 8; cz -= 2.5) {
          const coin = this.createCoinMesh(LANES[sideLane], cz, 0.7);
          chunkGroup.add(coin.mesh);
          coins.push(coin);
        }
      } else if (rand < 0.68) {
        // --- 2. Low Barrier Hurdle (Requires Jump) ---
        const hurdleLane = Math.floor(Math.random() * 3);
        const hurdle = this.createLowHurdle(LANES[hurdleLane], zPos);
        chunkGroup.add(hurdle.mesh);
        obstacles.push(hurdle);

        // Airborne jumping coin arc over the hurdle
        coins.push(this.createCoinMesh(LANES[hurdleLane], zPos + 3, 0.8));
        coins.push(this.createCoinMesh(LANES[hurdleLane], zPos, 2.2)); // peak of jump
        coins.push(this.createCoinMesh(LANES[hurdleLane], zPos - 3, 0.8));
        chunkGroup.add(coins[coins.length - 3].mesh);
        chunkGroup.add(coins[coins.length - 2].mesh);
        chunkGroup.add(coins[coins.length - 1].mesh);
      } else if (rand < 0.88) {
        // --- 3. High Overhead Barrier / Gantry (Requires Slide) ---
        const gantryLane = Math.floor(Math.random() * 3);
        const gantry = this.createHighGantry(LANES[gantryLane], zPos);
        chunkGroup.add(gantry.mesh);
        obstacles.push(gantry);

        // Low sliding trail of coins right under the gantry!
        for (let cz = zPos + 2; cz >= zPos - 2; cz -= 1.8) {
          const coin = this.createCoinMesh(LANES[gantryLane], cz, 0.35);
          chunkGroup.add(coin.mesh);
          coins.push(coin);
        }
      } else {
        // --- 4. Double lane challenge or street hazard cone barrier ---
        const hazardLane = (freeLane + 1) % 3;
        const hazard = this.createLowHurdle(LANES[hazardLane], zPos);
        chunkGroup.add(hazard.mesh);
        obstacles.push(hazard);

        // Golden Coin Run in the free lane
        for (let cz = zPos + 5; cz >= zPos - 5; cz -= 2.2) {
          const coin = this.createCoinMesh(LANES[freeLane], cz, 0.7);
          chunkGroup.add(coin.mesh);
          coins.push(coin);
        }
      }
    }
  }

  // --- Obstacle Factory Methods ---

  private createTrainObstacle(
    type: ObstacleType,
    x: number,
    z: number,
    hasRamp: boolean
  ): TrackObstacle {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const length = 16.0;
    const width = 2.3;
    const height = 3.0;
    const topHeight = height;

    // Train Main Hull
    const hullGeo = new THREE.BoxGeometry(width, height, length);
    hullGeo.translate(0, height * 0.5, -length * 0.5);
    const hull = new THREE.Mesh(hullGeo, this.materials.trainBody);
    hull.castShadow = true;
    hull.receiveShadow = true;
    group.add(hull);

    // Train Accent Striping along sides
    const stripeGeo = new THREE.BoxGeometry(width * 1.02, 0.35, length);
    stripeGeo.translate(0, 1.2, -length * 0.5);
    const stripe = new THREE.Mesh(stripeGeo, this.materials.trainAccent);
    group.add(stripe);

    // Walkable Roof Deck
    const roofGeo = new THREE.BoxGeometry(width * 0.94, 0.12, length * 0.98);
    roofGeo.translate(0, height + 0.06, -length * 0.5);
    const roof = new THREE.Mesh(roofGeo, this.materials.trainRoof);
    roof.receiveShadow = true;
    group.add(roof);

    // Roof A/C vents / equipment
    for (let rz = -3; rz > -length + 3; rz -= 4) {
      const ventGeo = new THREE.BoxGeometry(1.2, 0.25, 1.6);
      ventGeo.translate(0, height + 0.18, rz);
      const vent = new THREE.Mesh(ventGeo, this.materials.trainAccent);
      group.add(vent);
    }

    // Windows on both sides
    const winGeo = new THREE.BoxGeometry(width * 1.04, 0.65, 1.8);
    for (let wz = -2.5; wz > -length + 2; wz -= 2.8) {
      const win = new THREE.Mesh(winGeo, this.materials.trainWindow);
      win.position.set(0, 2.0, wz);
      group.add(win);
    }

    // Front Aerodynamic Bumper & Grill
    const grillGeo = new THREE.BoxGeometry(width * 0.9, 0.9, 0.4);
    grillGeo.translate(0, 0.5, 0.2);
    const grill = new THREE.Mesh(grillGeo, this.materials.trainAccent);
    group.add(grill);

    // Dual Glowing Headlights
    const lightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12);
    lightGeo.rotateX(Math.PI / 2);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const leftLight = new THREE.Mesh(lightGeo, lightMat);
    leftLight.position.set(0.65, 0.9, 0.42);
    const rightLight = leftLight.clone();
    rightLight.position.x = -0.65;
    group.add(leftLight, rightLight);

    // If has ramp, attach front loading incline wedge
    if (hasRamp) {
      const rampLength = 4.5;
      const rampGeo = new THREE.BufferGeometry();
      // Wedge geometry for smooth running ascent
      const vertices = new Float32Array([
        // Front thin tip
        -width * 0.48, 0.05, rampLength,
        width * 0.48, 0.05, rampLength,
        width * 0.48, height, 0,

        -width * 0.48, 0.05, rampLength,
        width * 0.48, height, 0,
        -width * 0.48, height, 0,
      ]);
      rampGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      rampGeo.computeVertexNormals();
      const ramp = new THREE.Mesh(rampGeo, this.materials.trainAccent);
      ramp.receiveShadow = true;
      group.add(ramp);
    }

    return {
      id: `train_${Math.random().toString(36).substring(2, 7)}`,
      type,
      mesh: group,
      lane: x,
      z,
      width,
      height,
      length,
      canRunOnTop: true,
      topHeight,
      requiresSlide: false,
      requiresJump: false,
      hasRamp,
    };
  }

  private createLowHurdle(x: number, z: number): TrackObstacle {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const width = 2.3;
    const height = 0.9;
    const length = 0.6;

    // Upright side posts
    const postGeo = new THREE.BoxGeometry(0.16, height, 0.16);
    postGeo.translate(0, height * 0.5, 0);
    const leftPost = new THREE.Mesh(postGeo, this.materials.barrierYellow);
    leftPost.position.x = width * 0.45;
    const rightPost = leftPost.clone();
    rightPost.position.x = -width * 0.45;
    group.add(leftPost, rightPost);

    // Cross barrier boards with hazard stripes
    const barGeo = new THREE.BoxGeometry(width, 0.28, 0.1);
    barGeo.translate(0, height * 0.75, 0);
    const bar = new THREE.Mesh(barGeo, this.materials.barrierYellow);
    bar.castShadow = true;
    group.add(bar);

    const stripeGeo = new THREE.BoxGeometry(width * 0.98, 0.1, 0.12);
    stripeGeo.translate(0, height * 0.75, 0);
    const stripe = new THREE.Mesh(stripeGeo, this.materials.barrierStripe);
    group.add(stripe);

    return {
      id: `hurdle_low_${Math.random().toString(36).substring(2, 7)}`,
      type: 'hurdle_low',
      mesh: group,
      lane: x,
      z,
      width,
      height,
      length,
      canRunOnTop: false,
      topHeight: height,
      requiresSlide: false,
      requiresJump: true,
      hasRamp: false,
    };
  }

  private createHighGantry(x: number, z: number): TrackObstacle {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const width = 2.4;
    const height = 2.8;
    const length = 0.6;

    // Tall side pillars
    const pillarGeo = new THREE.BoxGeometry(0.18, height, 0.18);
    pillarGeo.translate(0, height * 0.5, 0);
    const leftPillar = new THREE.Mesh(pillarGeo, this.materials.gantryFrame);
    leftPillar.position.x = width * 0.48;
    const rightPillar = leftPillar.clone();
    rightPillar.position.x = -width * 0.48;
    group.add(leftPillar, rightPillar);

    // Overhead sign board spanning between 1.35m and 2.5m (Leaves ~1.3m clearance below for slide!)
    const boardHeight = 1.2;
    const boardGeo = new THREE.BoxGeometry(width * 1.05, boardHeight, 0.24);
    boardGeo.translate(0, 2.0, 0);
    const board = new THREE.Mesh(boardGeo, this.materials.gantryFrame);
    board.castShadow = true;
    group.add(board);

    // Caution pattern on sign
    const signFaceGeo = new THREE.PlaneGeometry(width * 0.9, boardHeight * 0.7);
    const signFace = new THREE.Mesh(signFaceGeo, this.materials.barrierYellow);
    signFace.position.set(0, 2.0, 0.13);
    group.add(signFace);

    return {
      id: `hurdle_high_${Math.random().toString(36).substring(2, 7)}`,
      type: 'hurdle_high',
      mesh: group,
      lane: x,
      z,
      width,
      height,
      length,
      canRunOnTop: false,
      topHeight: height,
      requiresSlide: true,
      requiresJump: false,
      hasRamp: false,
    };
  }

  // --- Collectibles Factory Methods ---

  public createCoinMesh(x: number, z: number, y: number = 0.7): TrackCoin {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Stylized faceted Gold Coin
    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.1, 16);
    coinGeo.rotateZ(Math.PI / 2);
    const coinMesh = new THREE.Mesh(coinGeo, this.materials.coin);
    coinMesh.castShadow = true;
    group.add(coinMesh);

    // Inner embossed star emblem
    const starGeo = new THREE.BoxGeometry(0.24, 0.24, 0.12);
    const star = new THREE.Mesh(starGeo, this.materials.barrierYellow);
    group.add(star);

    return {
      id: `coin_${Math.random().toString(36).substring(2, 7)}`,
      mesh: group,
      lane: x,
      z,
      y,
      collected: false,
    };
  }

  public createPowerUpMesh(
    type: PowerUpType,
    x: number,
    z: number,
    y: number = 1.2
  ): TrackPowerUp {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Floating orb halo
    const haloGeo = new THREE.TorusGeometry(0.65, 0.06, 8, 20);
    let haloMat = this.materials.trim;

    if (type === 'magnet') {
      haloMat = this.materials.magnetRed;
      // Horseshoe Magnet
      const magnetGeo = new THREE.TorusGeometry(0.35, 0.09, 8, 16, Math.PI);
      magnetGeo.rotateZ(Math.PI);
      const magnet = new THREE.Mesh(magnetGeo, this.materials.magnetRed);
      group.add(magnet);

      // Silver tips
      const tipGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const tipL = new THREE.Mesh(tipGeo, this.materials.rail);
      tipL.position.set(-0.35, -0.15, 0);
      const tipR = tipL.clone();
      tipR.position.x = 0.35;
      group.add(tipL, tipR);
    } else if (type === 'multiplier') {
      haloMat = this.materials.multiplierGold;
      // 2X Star badge
      const starGeo = new THREE.OctahedronGeometry(0.42, 0);
      const star = new THREE.Mesh(starGeo, this.materials.multiplierGold);
      group.add(star);
    } else if (type === 'shield') {
      haloMat = this.materials.shieldCyan;
      // Floating Diamond Forcefield Crystal
      const crystalGeo = new THREE.OctahedronGeometry(0.45, 1);
      const crystal = new THREE.Mesh(crystalGeo, this.materials.shieldCyan);
      group.add(crystal);
    } else {
      // Super Jump Sneaker / Wing
      haloMat = this.materials.sneakerGreen;
      const wingGeo = new THREE.ConeGeometry(0.4, 0.7, 5);
      wingGeo.rotateZ(Math.PI / 4);
      const wing = new THREE.Mesh(wingGeo, this.materials.sneakerGreen);
      group.add(wing);
    }

    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    return {
      id: `powerup_${type}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      mesh: group,
      lane: x,
      z,
      y,
      collected: false,
    };
  }
}
