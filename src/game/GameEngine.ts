/**
 * Core 60 FPS Three.js Engine for Rena Runner 3D
 * Handles kinematic player motion, lane transitions, jump & slide physics,
 * train roof running, obstacle collision validation, power-ups, and camera follow.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import {
  CharacterConfig,
  GameStats,
  GameStatus,
  PowerUpState,
  PowerUpType,
  ThemeMode,
} from '../types/game';
import { soundManager } from '../audio/soundManager';
import { CharacterMesh, DEFAULT_MALE_CONFIG } from './CharacterMesh';
import {
  EnvironmentBuilder,
  LANES,
  LANE_WIDTH,
  TrackChunk,
  TrackObstacle,
  TrackCoin,
  TrackPowerUp,
} from './EnvironmentBuilder';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onGameOver: (finalStats: GameStats) => void;
  onNewHighScore: () => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;

  // Three.js Core
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock!: THREE.Clock;
  private frameId: number = 0;
  private isSoftwareGl: boolean = false;

  // World & Theme
  private theme: ThemeMode = 'light';
  private envBuilder!: EnvironmentBuilder;
  private skyMesh!: THREE.Mesh;
  private sceneryGroup!: THREE.Group;
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;

  // Track Chunk Management
  private chunks: TrackChunk[] = [];
  private nextChunkIndex: number = 0;
  private nextChunkStartZ: number = 20; // Starts slightly behind player
  private readonly CHUNK_LENGTH: number = 60;
  private readonly NUM_ACTIVE_CHUNKS: number = 6;

  // Character & Rig
  private player!: CharacterMesh;
  private playerConfig: CharacterConfig;

  // Gameplay State
  private status: GameStatus = 'title';
  private speed: number = 18; // Base speed m/s
  private readonly MAX_SPEED: number = 29;
  private distanceRun: number = 0;
  private coinsCount: number = 0;
  private score: number = 0;
  private multiplier: number = 1;
  private highScore: number = 0;
  private prevHighScore: number = 0;
  private newHighScoreAchieved: boolean = false;
  private highScoreGlowTimer: number = 0; // 1-second timer for brightening display

  // Kinematic Kinematics (Lanes & Movement)
  private laneIndex: number = 0; // -1: Left, 0: Center, 1: Right
  private playerX: number = 0;
  private playerZ: number = 0;
  private playerY: number = 0;
  private velocityY: number = 0;
  private isGrounded: boolean = true;
  private currentGroundY: number = 0; // 0 on track, or 3.0 on train roof
  private isJumping: boolean = false;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private readonly SLIDE_DURATION: number = 0.75;
  private invulnerableTimer: number = 0;

  // Power-Ups
  private powerUps: PowerUpState = {
    magnet: 0,
    multiplier: 0,
    shield: false,
    superJump: 0,
  };

  // Camera Shake
  private cameraShake: number = 0;

  // Touch Swipe tracking
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;

  constructor(
    container: HTMLElement,
    callbacks: GameEngineCallbacks,
    initialConfig?: CharacterConfig,
    initialTheme: ThemeMode = 'light'
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.theme = initialTheme;
    this.playerConfig = initialConfig ? { ...initialConfig } : { ...DEFAULT_MALE_CONFIG };

    // Read stored high score
    const storedHS = localStorage.getItem('rena_high_score');
    this.highScore = storedHS ? parseInt(storedHS, 10) : 0;
    this.prevHighScore = this.highScore;

    this.initThree();
    this.setupInputs();
    this.startLoop();
  }

  // --- Three.js Initialization ---

  private initThree() {
    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      400
    );
    this.clock = new THREE.Clock();

    // 4. Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lights & Fog
    this.setupLighting();

    // 6. Environment Builder & Initial Chunks
    this.envBuilder = new EnvironmentBuilder(this.theme);
    const { skyMesh, sceneryGroup } = this.envBuilder.buildSkyAndDistantWorld(this.scene);
    this.skyMesh = skyMesh;
    this.sceneryGroup = sceneryGroup;

    // 7. Player Character
    this.player = new CharacterMesh(this.playerConfig);
    this.scene.add(this.player.group);

    // 8. Generate Initial Chunks
    for (let i = 0; i < this.NUM_ACTIVE_CHUNKS; i++) {
      this.spawnNextChunk();
    }

    // Window Resize Observer
    window.addEventListener('resize', this.onResize);
  }

  private setupLighting() {
    const isLight = this.theme === 'light';

    // Warm Sun Key Light
    this.dirLight = new THREE.DirectionalLight(
      isLight ? 0xfff7ed : 0x818cf8,
      isLight ? 2.2 : 1.4
    );
    this.dirLight.position.set(15, 30, 20);
    this.dirLight.castShadow = !this.isSoftwareGl;
    if (this.dirLight.castShadow) {
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 100;
      const d = 20;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.dirLight);

    // Cool Hemisphere Ambient Fill
    this.hemiLight = new THREE.HemisphereLight(
      isLight ? 0xbae6fd : 0x1e1b4b,
      isLight ? 0xfef08a : 0x0f172a,
      isLight ? 1.0 : 0.6
    );
    this.scene.add(this.hemiLight);

    // Horizon Fog to blend distant tracks into sky seamlessly
    const fogColor = isLight ? 0xbae6fd : 0x312e81;
    this.scene.fog = new THREE.FogExp2(fogColor, 0.0065);
  }

  public setTheme(newTheme: ThemeMode) {
    this.theme = newTheme;
    const isLight = newTheme === 'light';

    // Update lights & fog
    this.dirLight.color.setHex(isLight ? 0xfff7ed : 0x818cf8);
    this.dirLight.intensity = isLight ? 2.2 : 1.4;
    this.hemiLight.color.setHex(isLight ? 0xbae6fd : 0x1e1b4b);
    this.hemiLight.groundColor.setHex(isLight ? 0xfef08a : 0x0f172a);
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.setHex(isLight ? 0xbae6fd : 0x312e81);
    }

    // Rebuild sky
    if (this.skyMesh) {
      this.scene.remove(this.skyMesh);
      if ((this.skyMesh.material as THREE.Material).dispose) {
        (this.skyMesh.material as THREE.Material).dispose();
      }
      this.scene.remove(this.sceneryGroup);
    }

    this.envBuilder.setTheme(newTheme);
    const { skyMesh, sceneryGroup } = this.envBuilder.buildSkyAndDistantWorld(this.scene);
    this.skyMesh = skyMesh;
    this.sceneryGroup = sceneryGroup;
  }

  public setCharacterConfig(config: CharacterConfig) {
    this.playerConfig = { ...config };
    this.player.setConfig(config);
  }

  // --- Track Chunk Management ---

  private spawnNextChunk() {
    const difficultyMultiplier = 1 + (this.nextChunkIndex * 0.05);
    const chunk = this.envBuilder.createTrackChunk(
      this.nextChunkIndex,
      this.nextChunkStartZ,
      this.CHUNK_LENGTH,
      difficultyMultiplier
    );
    this.scene.add(chunk.group);
    this.chunks.push(chunk);

    this.nextChunkStartZ -= this.CHUNK_LENGTH;
    this.nextChunkIndex++;
  }

  private recycleOldChunks() {
    // If oldest chunk is far behind the player (e.g. > 30 units behind), remove it
    if (this.chunks.length > 0 && this.chunks[0].endZ > this.playerZ + 35) {
      const oldChunk = this.chunks.shift()!;
      this.scene.remove(oldChunk.group);

      // Dispose chunk child meshes
      oldChunk.group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
        }
      });

      // Spawn fresh chunk ahead
      this.spawnNextChunk();
    }
  }

  // --- Input Handling ---

  private setupInputs() {
    window.addEventListener('keydown', this.handleKeyDown);

    // Touch Swipe Gestures
    this.container.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.container.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.status !== 'playing') {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (this.status === 'title') this.startGame();
      }
      return;
    }

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLane(-1);
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveLane(1);
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.jump();
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.slide();
        break;
    }
  };

  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = performance.now();
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    const dt = performance.now() - this.touchStartTime;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (dt < 450 && (absDx > 30 || absDy > 30)) {
      if (this.status !== 'playing') {
        this.startGame();
        return;
      }

      if (absDx > absDy) {
        // Horizontal Swipe
        if (dx > 0) this.moveLane(1);
        else this.moveLane(-1);
      } else {
        // Vertical Swipe
        if (dy < 0) this.jump();
        else this.slide();
      }
    }
  };

  // --- Player Actions ---

  public moveLane(direction: -1 | 1) {
    if (this.status !== 'playing') return;
    const targetLane = Math.max(-1, Math.min(1, this.laneIndex + direction));
    if (targetLane !== this.laneIndex) {
      this.laneIndex = targetLane;
      soundManager.playLaneSwitchSound();
    }
  }

  public jump() {
    if (this.status !== 'playing') return;

    // Can jump if grounded or on train
    if (this.isGrounded) {
      this.isGrounded = false;
      this.isJumping = true;
      this.isSliding = false; // Jumping cancels slide immediately

      const jumpPower = this.powerUps.superJump > 0 ? 15.5 : 11.2;
      this.velocityY = jumpPower;
      soundManager.playJumpSound();
    }
  }

  public slide() {
    if (this.status !== 'playing') return;

    this.isSliding = true;
    this.slideTimer = this.SLIDE_DURATION;
    soundManager.playSlideSound();

    // Fast fall if sliding mid-air
    if (!this.isGrounded) {
      this.velocityY = Math.min(this.velocityY, -16);
    }
  }

  // --- Game State Flow ---

  public startGame() {
    this.status = 'playing';
    this.speed = 18;
    this.distanceRun = 0;
    this.coinsCount = 0;
    this.score = 0;
    this.multiplier = 1;
    this.newHighScoreAchieved = false;
    this.highScoreGlowTimer = 0;
    this.prevHighScore = this.highScore;

    this.laneIndex = 0;
    this.playerX = 0;
    this.playerZ = 0;
    this.playerY = 0;
    this.currentGroundY = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.invulnerableTimer = 0;

    this.powerUps = {
      magnet: 0,
      multiplier: 0,
      shield: false,
      superJump: 0,
    };
    this.player.setShieldVisible(false);

    soundManager.startMusic();
  }

  public pauseGame() {
    if (this.status === 'playing') {
      this.status = 'paused';
      soundManager.stopMusic();
    }
  }

  public resumeGame() {
    if (this.status === 'paused') {
      this.status = 'playing';
      soundManager.startMusic();
    }
  }

  public restartGame() {
    // Reset chunks
    this.chunks.forEach((c) => this.scene.remove(c.group));
    this.chunks = [];
    this.nextChunkIndex = 0;
    this.nextChunkStartZ = 20;

    for (let i = 0; i < this.NUM_ACTIVE_CHUNKS; i++) {
      this.spawnNextChunk();
    }

    this.startGame();
  }

  public revivePlayer() {
    if (this.status === 'gameover') {
      this.status = 'playing';
      this.invulnerableTimer = 3.0; // 3 seconds immunity
      this.powerUps.shield = true;
      this.player.setShieldVisible(true);
      this.player.updateAnimation(0.01, {
        isRunning: true,
        isJumping: false,
        isSliding: false,
        speedMultiplier: 1,
        isDead: false,
      });
      soundManager.startMusic();
    }
  }

  public setStatus(status: GameStatus) {
    this.status = status;
    if (status !== 'playing') {
      soundManager.stopMusic();
    }
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  // --- Main Animation Loop (60 FPS) ---

  private startLoop() {
    const tick = () => {
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.render();

      this.frameId = requestAnimationFrame(tick);
    };

    this.frameId = requestAnimationFrame(tick);
  }

  private update(dt: number) {
    // Camera shake decay
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 2.5);
    }

    // Update power-up durations
    if (this.status === 'playing') {
      if (this.powerUps.magnet > 0) this.powerUps.magnet = Math.max(0, this.powerUps.magnet - dt);
      if (this.powerUps.multiplier > 0) this.powerUps.multiplier = Math.max(0, this.powerUps.multiplier - dt);
      if (this.powerUps.superJump > 0) this.powerUps.superJump = Math.max(0, this.powerUps.superJump - dt);
      if (this.invulnerableTimer > 0) this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
      if (this.highScoreGlowTimer > 0) this.highScoreGlowTimer = Math.max(0, this.highScoreGlowTimer - dt);

      // Slide countdown
      if (this.isSliding) {
        this.slideTimer -= dt;
        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
      }

      // Smooth Speed progression
      this.speed = Math.min(this.MAX_SPEED, 18 + this.distanceRun * 0.005);
      const forwardDelta = this.speed * dt;
      this.playerZ -= forwardDelta;
      this.distanceRun += forwardDelta;

      // Smooth Lane Switching with Exponential Damping
      const targetX = LANES[this.laneIndex + 1];
      this.playerX = THREE.MathUtils.damp(this.playerX, targetX, 20, dt);

      // Check what ground height is underneath the player (train roof vs track floor)
      this.updateGroundHeight();

      // Vertical Physics (Jump / Fall / Gravity)
      const gravity = -30.0;
      if (!this.isGrounded) {
        this.velocityY += gravity * dt;
        this.playerY += this.velocityY * dt;

        // Ground landing check
        if (this.playerY <= this.currentGroundY) {
          this.playerY = this.currentGroundY;
          this.velocityY = 0;
          this.isGrounded = true;
          this.isJumping = false;
        }
      } else {
        // Snap to current ground (e.g. running onto train or dropping off edge)
        if (this.playerY > this.currentGroundY) {
          // Walking off roof ledge into air
          this.isGrounded = false;
        } else {
          this.playerY = this.currentGroundY;
        }
      }

      // Score calculation
      const currentMult = (this.powerUps.multiplier > 0 ? 2 : 1);
      this.multiplier = currentMult;
      this.score = Math.floor(this.distanceRun * 1.4 * currentMult) + this.coinsCount * 10;

      // High Score Event Trigger: user beats previous high score by 1 point!
      if (this.score > this.prevHighScore && this.prevHighScore > 0 && !this.newHighScoreAchieved) {
        this.newHighScoreAchieved = true;
        this.highScoreGlowTimer = 1.0; // Glow & brighten for exactly 1 second
        this.highScore = this.score;
        localStorage.setItem('rena_high_score', String(this.highScore));
        soundManager.playHighScoreFanfare();
        this.callbacks.onNewHighScore();

        // Celebration Confetti burst
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.25 },
          colors: ['#ffd700', '#38bdf8', '#f43f5e', '#a855f7'],
        });
      } else if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('rena_high_score', String(this.highScore));
      }

      // Update Player Position
      this.player.group.position.set(this.playerX, this.playerY, this.playerZ);

      // Collisions & Pickups
      this.checkCollisions();
      this.recycleOldChunks();

      // Emit stats to React HUD
      this.callbacks.onStatsUpdate({
        score: this.score,
        highScore: this.highScore,
        prevHighScore: this.prevHighScore,
        coins: this.coinsCount,
        distance: Math.floor(this.distanceRun),
        multiplier: this.multiplier,
        newHighScoreAchieved: this.newHighScoreAchieved,
        highScoreGlow: this.highScoreGlowTimer > 0,
        powerUps: { ...this.powerUps },
      });
    }

    // Update Player Animation
    this.player.updateAnimation(dt, {
      isRunning: this.status === 'playing',
      isJumping: this.isJumping,
      isSliding: this.isSliding,
      speedMultiplier: this.speed / 18,
      isDead: this.status === 'gameover',
    });

    // Update Scenery Follow (Keep distant buildings & sky centered with runner)
    if (this.skyMesh) {
      this.skyMesh.position.set(0, 0, this.playerZ);
    }
    if (this.sceneryGroup) {
      this.sceneryGroup.position.set(0, 0, this.playerZ * 0.4); // Subtle parallax
    }

    // Camera Positioning
    this.updateCamera(dt);
  }

  /**
   * Checks whether the player is currently over a train to set currentGroundY to roof height
   */
  private updateGroundHeight() {
    let targetGroundY = 0;

    for (const chunk of this.chunks) {
      for (const obs of chunk.obstacles) {
        if (obs.canRunOnTop) {
          const halfWidth = obs.width * 0.55;
          const trainMinZ = obs.z - obs.length;
          const trainMaxZ = obs.z + (obs.hasRamp ? 4.5 : 0);

          // Check if player is within X and Z bounds of train
          if (
            Math.abs(this.playerX - obs.lane) < halfWidth &&
            this.playerZ <= trainMaxZ &&
            this.playerZ >= trainMinZ
          ) {
            // If on ramp, smooth ramp height!
            if (obs.hasRamp && this.playerZ > obs.z) {
              const rampProgress = (obs.z + 4.5 - this.playerZ) / 4.5;
              targetGroundY = Math.max(0, obs.topHeight * rampProgress);
            } else if (this.playerY >= obs.topHeight - 0.5) {
              targetGroundY = obs.topHeight;
            }
          }
        }
      }
    }

    this.currentGroundY = targetGroundY;
  }

  /**
   * Collision Detection: Genuine impacts cause game over, evasion passes safely
   */
  private checkCollisions() {
    const playerZ = this.playerZ;
    const playerX = this.playerX;
    const playerY = this.playerY;

    // Coins & Power-ups
    for (const chunk of this.chunks) {
      // 1. Coins
      for (const coin of chunk.coins) {
        if (coin.collected) continue;

        // Magnet suction logic
        if (this.powerUps.magnet > 0) {
          const distToPlayer = Math.hypot(coin.mesh.position.x - playerX, coin.mesh.position.z - playerZ);
          if (distToPlayer < 14) {
            coin.mesh.position.x = THREE.MathUtils.damp(coin.mesh.position.x, playerX, 14, 0.03);
            coin.mesh.position.z = THREE.MathUtils.damp(coin.mesh.position.z, playerZ, 14, 0.03);
            coin.mesh.position.y = THREE.MathUtils.damp(coin.mesh.position.y, playerY + 1.0, 14, 0.03);
          }
        }

        // Rotate coin
        coin.mesh.rotation.y += 0.05;

        // Collect check
        const dx = Math.abs(coin.mesh.position.x - playerX);
        const dz = Math.abs(coin.mesh.position.z - playerZ);
        const dy = Math.abs(coin.mesh.position.y - (playerY + 0.8));

        if (dx < 1.1 && dz < 1.4 && dy < 1.8) {
          coin.collected = true;
          coin.mesh.visible = false;
          this.coinsCount++;
          soundManager.playCoinSound();
        }
      }

      // 2. Power-Ups
      for (const pu of chunk.powerUps) {
        if (pu.collected) continue;

        // Float & spin
        pu.mesh.rotation.y += 0.04;
        pu.mesh.position.y = pu.y + Math.sin(this.distanceRun * 0.1) * 0.15;

        const dx = Math.abs(pu.mesh.position.x - playerX);
        const dz = Math.abs(pu.mesh.position.z - playerZ);

        if (dx < 1.2 && dz < 1.4) {
          pu.collected = true;
          pu.mesh.visible = false;
          this.applyPowerUp(pu.type);
        }
      }

      // 3. Obstacles
      for (const obs of chunk.obstacles) {
        // Check if player is in the same lane
        const laneDiff = Math.abs(playerX - obs.lane);
        if (laneDiff > obs.width * 0.45) {
          // Safely dodged to left or right lane!
          continue;
        }

        // Z-axis collision window
        let minZ = obs.z - obs.length;
        let maxZ = obs.z;
        if (obs.hasRamp) maxZ += 4.5;

        if (playerZ <= maxZ && playerZ >= minZ) {
          // Inside obstacle's longitudinal range!
          if (obs.canRunOnTop) {
            // Train obstacle:
            // If player is on top of train, player is SAFE!
            if (playerY >= obs.topHeight - 0.35) {
              continue;
            }
            // If train has ramp and player entered from front, player runs up ramp!
            if (obs.hasRamp && playerZ > obs.z - 1.0) {
              continue;
            }
            // Otherwise, crashed into front or side of train!
            this.handleCrash();
            return;
          }

          if (obs.requiresJump) {
            // Low hurdle: Jump clears it if player is airborne above 0.85m
            if (this.isJumping && playerY > 0.85) {
              // Successfully leaped over!
              continue;
            }
            // Crashed into hurdle!
            this.handleCrash();
            return;
          }

          if (obs.requiresSlide) {
            // High gantry / warning bar: Slide clears it!
            if (this.isSliding) {
              // Successfully rolled under!
              continue;
            }
            // Crashed standing into overhead bar!
            this.handleCrash();
            return;
          }

          // Generic hurdle
          this.handleCrash();
          return;
        }
      }
    }
  }

  private applyPowerUp(type: PowerUpType) {
    soundManager.playPowerUpSound();

    if (type === 'magnet') {
      this.powerUps.magnet = 12.0; // 12 seconds magnet
    } else if (type === 'multiplier') {
      this.powerUps.multiplier = 10.0; // 10 seconds 2x
    } else if (type === 'shield') {
      this.powerUps.shield = true;
      this.player.setShieldVisible(true);
    } else if (type === 'superJump') {
      this.powerUps.superJump = 12.0;
    }
  }

  private handleCrash() {
    if (this.invulnerableTimer > 0) return;

    // Shield protection check!
    if (this.powerUps.shield) {
      this.powerUps.shield = false;
      this.player.setShieldVisible(false);
      this.invulnerableTimer = 2.0; // 2 seconds safety
      this.cameraShake = 0.4;
      soundManager.playShieldBreakSound();
      return;
    }

    // Fatal Crash
    this.status = 'gameover';
    this.cameraShake = 0.8;
    soundManager.playCrashSound();
    soundManager.stopMusic();

    this.callbacks.onGameOver({
      score: this.score,
      highScore: this.highScore,
      prevHighScore: this.prevHighScore,
      coins: this.coinsCount,
      distance: Math.floor(this.distanceRun),
      multiplier: this.multiplier,
      newHighScoreAchieved: this.newHighScoreAchieved,
      highScoreGlow: false,
      powerUps: { ...this.powerUps },
    });
  }

  private updateCamera(dt: number) {
    if (this.status === 'title' || this.status === 'customizing') {
      // Cinematic live camera orbit around hero centerpiece
      const time = this.clock.getElapsedTime();
      const radius = 4.2;
      const angle = time * 0.4;
      this.camera.position.set(
        Math.sin(angle) * radius,
        2.2 + Math.sin(time * 0.8) * 0.2,
        Math.cos(angle) * radius + 2.0
      );
      this.camera.lookAt(0, 1.2, 0);
      return;
    }

    // Dynamic third-person chase camera during gameplay
    const targetCamX = this.playerX * 0.55;
    const targetCamY = this.playerY * 0.4 + 3.8;
    const targetCamZ = this.playerZ + 5.6;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 10, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 10, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 14, dt);

    // Apply camera shake if any
    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake * 0.6;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake * 0.6;
    }

    const lookTarget = new THREE.Vector3(
      this.playerX * 0.35,
      this.playerY * 0.5 + 1.4,
      this.playerZ - 12
    );
    this.camera.lookAt(lookTarget);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.container.removeEventListener('touchstart', this.handleTouchStart);
    this.container.removeEventListener('touchend', this.handleTouchEnd);

    cancelAnimationFrame(this.frameId);
    soundManager.stopMusic();

    this.scene.clear();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
