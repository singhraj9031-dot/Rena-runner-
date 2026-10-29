/**
 * Procedural 3D Cartoon Humanoid Character for Rena Runner
 * Supports male & female bodies, hairstyles, eyes, nose, face shape,
 * shirts, jeans, and animated run/jump/slide kinematics.
 */

import * as THREE from 'three';
import { CharacterConfig, Gender, HairStyle, ShirtStyle, PantsStyle, FaceShape } from '../types/game';

export const DEFAULT_MALE_CONFIG: CharacterConfig = {
  gender: 'male',
  username: 'SpeedyRena',
  skinColor: '#f8d0b0',
  faceShape: 'jawline',
  eyeColor: '#0284c7',
  eyeStyle: 'bold',
  eyebrowStyle: 'thick',
  noseStyle: 'classic',
  hairStyle: 'anime_spike',
  hairColor: '#0f172a',
  shirtStyle: 'hoodie',
  shirtColor: '#ef4444',
  shirtAccentColor: '#ffffff',
  pantsStyle: 'cargo',
  pantsColor: '#1e293b',
  shoeColor: '#f59e0b',
};

export const DEFAULT_FEMALE_CONFIG: CharacterConfig = {
  gender: 'female',
  username: 'RenaGirl',
  skinColor: '#fae2d0',
  faceShape: 'oval',
  eyeColor: '#10b981',
  eyeStyle: 'anime',
  eyebrowStyle: 'arched',
  noseStyle: 'petite',
  hairStyle: 'high_ponytail',
  hairColor: '#f43f5e',
  shirtStyle: 'cyber_jacket',
  shirtColor: '#8b5cf6',
  shirtAccentColor: '#38bdf8',
  pantsStyle: 'track_pants',
  pantsColor: '#0f172a',
  shoeColor: '#ec4899',
};

export class CharacterMesh {
  public group: THREE.Group;
  private config: CharacterConfig;

  // Hierarchical limbs for animation
  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private torsoMesh!: THREE.Mesh;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private shieldMesh: THREE.Mesh;
  private hoverboardMesh: THREE.Group;

  // Running animation state
  private runPhase: number = 0;
  private animTimer: number = 0;

  constructor(initialConfig: CharacterConfig) {
    this.config = { ...initialConfig };
    this.group = new THREE.Group();
    this.group.name = 'PlayerCharacter';

    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    this.headGroup = new THREE.Group();
    this.leftArmGroup = new THREE.Group();
    this.rightArmGroup = new THREE.Group();
    this.leftLegGroup = new THREE.Group();
    this.rightLegGroup = new THREE.Group();
    this.hoverboardMesh = new THREE.Group();

    // Shield forcefield
    const shieldGeo = new THREE.SphereGeometry(1.3, 24, 20);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.2,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.1;
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);

    // Build model
    this.rebuildModel();
  }

  public setConfig(newConfig: CharacterConfig) {
    this.config = { ...newConfig };
    this.rebuildModel();
  }

  public getConfig(): CharacterConfig {
    return { ...this.config };
  }

  public setShieldVisible(visible: boolean) {
    this.shieldMesh.visible = visible;
  }

  public rebuildModel() {
    // Clear previous children
    while (this.bodyGroup.children.length > 0) {
      const child = this.bodyGroup.children[0];
      this.bodyGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    const {
      gender,
      skinColor,
      faceShape,
      eyeColor,
      hairStyle,
      hairColor,
      shirtStyle,
      shirtColor,
      shirtAccentColor,
      pantsStyle,
      pantsColor,
      shoeColor,
      noseStyle,
    } = this.config;

    const isFemale = gender === 'female';
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinColor),
      roughness: 0.65,
      metalness: 0.05,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairColor),
      roughness: 0.5,
      metalness: 0.15,
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(shirtColor),
      roughness: 0.7,
      metalness: 0.1,
    });

    const shirtAccentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(shirtAccentColor),
      roughness: 0.6,
      metalness: 0.2,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(pantsColor),
      roughness: 0.8,
      metalness: 0.05,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(shoeColor),
      roughness: 0.4,
      metalness: 0.2,
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });

    const darkEyeMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.2,
    });

    const irisMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(eyeColor),
      roughness: 0.2,
      metalness: 0.2,
    });

    // 1. Torso
    const torsoWidth = isFemale ? 0.64 : 0.74;
    const torsoHeight = 0.8;
    const torsoDepth = isFemale ? 0.42 : 0.48;

    let torsoGeo: THREE.BufferGeometry;
    if (shirtStyle === 'hoodie') {
      torsoGeo = new THREE.BoxGeometry(torsoWidth * 1.08, torsoHeight, torsoDepth * 1.1, 4, 4, 4);
    } else {
      torsoGeo = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth, 4, 4, 4);
    }

    this.torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.torsoMesh.position.y = 1.15;
    this.bodyGroup.add(this.torsoMesh);

    // Torso Accent Detail (e.g. stripe or hoodie pocket)
    if (shirtStyle === 'hoodie') {
      const pocketGeo = new THREE.BoxGeometry(torsoWidth * 0.7, 0.26, 0.06);
      const pocket = new THREE.Mesh(pocketGeo, shirtAccentMat);
      pocket.position.set(0, -0.15, torsoDepth * 0.55);
      this.torsoMesh.add(pocket);

      // Hoodie hood bunched behind neck
      const hoodGeo = new THREE.SphereGeometry(0.24, 12, 10);
      hoodGeo.scale(1.2, 0.7, 0.9);
      const hood = new THREE.Mesh(hoodGeo, shirtMat);
      hood.position.set(0, 0.38, -torsoDepth * 0.42);
      this.torsoMesh.add(hood);
    } else if (shirtStyle === 'cyber_jacket' || shirtStyle === 'bomber') {
      // Zipper stripe in center
      const zipGeo = new THREE.BoxGeometry(0.06, torsoHeight * 0.9, 0.02);
      const zip = new THREE.Mesh(zipGeo, shirtAccentMat);
      zip.position.set(0, 0, torsoDepth * 0.51);
      this.torsoMesh.add(zip);

      // Collar
      const collarGeo = new THREE.TorusGeometry(torsoWidth * 0.35, 0.07, 8, 16, Math.PI);
      const collar = new THREE.Mesh(collarGeo, shirtAccentMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, torsoHeight * 0.46, 0);
      this.torsoMesh.add(collar);
    } else {
      // T-shirt graphic emblem
      const emblemGeo = new THREE.PlaneGeometry(0.3, 0.3);
      const emblem = new THREE.Mesh(emblemGeo, shirtAccentMat);
      emblem.position.set(0, 0.08, torsoDepth * 0.505);
      this.torsoMesh.add(emblem);
    }

    // 2. Head & Neck
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.82, 0);
    this.bodyGroup.add(this.headGroup);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.22, 12);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.y = -0.2;
    this.headGroup.add(neckMesh);

    // Head base geometry by faceShape
    let headGeo: THREE.BufferGeometry;
    if (faceShape === 'round' || faceShape === 'chibi') {
      headGeo = new THREE.SphereGeometry(0.38, 20, 18);
      headGeo.scale(1.05, 0.98, 1.0);
    } else if (faceShape === 'jawline') {
      headGeo = new THREE.BoxGeometry(0.68, 0.74, 0.68, 3, 3, 3);
    } else {
      // oval default
      headGeo = new THREE.SphereGeometry(0.37, 20, 18);
      headGeo.scale(0.95, 1.15, 0.98);
    }
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.09, 10, 8);
    earGeo.scale(0.4, 1.2, 0.8);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(0.36, 0, -0.02);
    const rightEar = leftEar.clone();
    rightEar.position.x = -0.36;
    this.headGroup.add(leftEar, rightEar);

    // Eyes (Cartoon stylized big expressive eyes)
    const eyeSpacing = isFemale ? 0.16 : 0.18;
    const eyeY = 0.05;
    const eyeZ = 0.34;
    const eyeRadius = isFemale ? 0.085 : 0.075;

    const createEye = (xPos: number) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(xPos, eyeY, eyeZ);

      // White Sclera
      const scleraGeo = new THREE.SphereGeometry(eyeRadius, 14, 12);
      scleraGeo.scale(1, 1.25, 0.4);
      const sclera = new THREE.Mesh(scleraGeo, whiteMat);
      eyeGroup.add(sclera);

      // Iris
      const irisGeo = new THREE.SphereGeometry(eyeRadius * 0.65, 12, 10);
      irisGeo.scale(1, 1, 0.3);
      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.z = eyeRadius * 0.28;
      eyeGroup.add(iris);

      // Pupil
      const pupilGeo = new THREE.SphereGeometry(eyeRadius * 0.38, 10, 8);
      pupilGeo.scale(1, 1, 0.3);
      const pupil = new THREE.Mesh(pupilGeo, darkEyeMat);
      pupil.position.z = eyeRadius * 0.36;
      eyeGroup.add(pupil);

      // Eye highlight (catchlight)
      const shineGeo = new THREE.SphereGeometry(eyeRadius * 0.16, 6, 6);
      const shine = new THREE.Mesh(shineGeo, whiteMat);
      shine.position.set(eyeRadius * 0.2, eyeRadius * 0.25, eyeRadius * 0.42);
      eyeGroup.add(shine);

      return eyeGroup;
    };

    this.headGroup.add(createEye(eyeSpacing));
    this.headGroup.add(createEye(-eyeSpacing));

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.14, 0.035, 0.03);
    const browMat = hairMat;
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(eyeSpacing, eyeY + 0.15, eyeZ + 0.02);
    leftBrow.rotation.z = -0.08;
    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(-eyeSpacing, eyeY + 0.15, eyeZ + 0.02);
    rightBrow.rotation.z = 0.08;
    this.headGroup.add(leftBrow, rightBrow);

    // Nose
    let noseGeo: THREE.BufferGeometry;
    if (noseStyle === 'button') {
      noseGeo = new THREE.SphereGeometry(0.045, 8, 8);
    } else if (noseStyle === 'petite') {
      noseGeo = new THREE.ConeGeometry(0.04, 0.07, 6);
      noseGeo.rotateX(Math.PI / 2);
    } else {
      noseGeo = new THREE.BoxGeometry(0.05, 0.09, 0.06);
    }
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, -0.04, eyeZ + 0.05);
    this.headGroup.add(nose);

    // Mouth: Friendly cartoon grin
    const mouthGeo = new THREE.TorusGeometry(0.08, 0.02, 6, 12, Math.PI * 0.8);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.16, eyeZ + 0.02);
    mouth.rotation.x = 0.2;
    mouth.rotation.z = Math.PI;
    this.headGroup.add(mouth);

    // 3. Hair Styles
    const hairGroup = new THREE.Group();
    this.headGroup.add(hairGroup);

    this.buildHair(hairGroup, hairStyle, hairMat);

    // 4. Arms
    const armRadius = isFemale ? 0.1 : 0.12;
    const armLength = 0.65;
    const shoulderX = torsoWidth * 0.55 + 0.06;

    // Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(shoulderX, 1.45, 0);
    const leftArmGeo = new THREE.CylinderGeometry(armRadius, armRadius * 0.85, armLength, 10);
    leftArmGeo.translate(0, -armLength * 0.5, 0);
    const leftArm = new THREE.Mesh(leftArmGeo, shirtStyle === 'tank' ? skinMat : shirtMat);
    leftArm.castShadow = true;
    this.leftArmGroup.add(leftArm);

    // Left Hand (stylized mitten/glove)
    const handGeo = new THREE.SphereGeometry(armRadius * 1.05, 10, 8);
    handGeo.scale(1, 1.2, 0.8);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.set(0, -armLength - 0.06, 0);
    this.leftArmGroup.add(leftHand);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(-shoulderX, 1.45, 0);
    const rightArm = new THREE.Mesh(leftArmGeo, shirtStyle === 'tank' ? skinMat : shirtMat);
    rightArm.castShadow = true;
    this.rightArmGroup.add(rightArm);
    const rightHand = leftHand.clone();
    this.rightArmGroup.add(rightHand);

    this.bodyGroup.add(this.leftArmGroup, this.rightArmGroup);

    // 5. Legs & Shoes
    const legRadius = isFemale ? 0.12 : 0.14;
    const legLength = 0.72;
    const hipX = torsoWidth * 0.26;

    // Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(hipX, 0.75, 0);
    const legGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.82, legLength, 10);
    legGeo.translate(0, -legLength * 0.5, 0);
    const leftLeg = new THREE.Mesh(legGeo, pantsStyle === 'shorts' ? skinMat : pantsMat);
    leftLeg.castShadow = true;
    this.leftLegGroup.add(leftLeg);

    // Left Shoe
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -legLength, 0);
    const shoeBaseGeo = new THREE.BoxGeometry(legRadius * 2.2, 0.16, 0.42);
    shoeBaseGeo.translate(0, 0.08, 0.08);
    const shoeBase = new THREE.Mesh(shoeBaseGeo, shoeMat);
    shoeBase.castShadow = true;
    shoeGroup.add(shoeBase);

    // White sole
    const soleGeo = new THREE.BoxGeometry(legRadius * 2.3, 0.05, 0.44);
    soleGeo.translate(0, 0.025, 0.08);
    const sole = new THREE.Mesh(soleGeo, whiteMat);
    shoeGroup.add(sole);

    this.leftLegGroup.add(shoeGroup);

    // Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(-hipX, 0.75, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsStyle === 'shorts' ? skinMat : pantsMat);
    rightLeg.castShadow = true;
    this.rightLegGroup.add(rightLeg);

    const rightShoeGroup = shoeGroup.clone();
    this.rightLegGroup.add(rightShoeGroup);

    this.bodyGroup.add(this.leftLegGroup, this.rightLegGroup);

    // 6. Hoverboard (Futuristic deck below feet when active or unlocked)
    this.buildHoverboard();
  }

  private buildHair(hairGroup: THREE.Group, style: HairStyle, mat: THREE.Material) {
    if (style === 'anime_spike') {
      // Clustered anime spikes
      for (let i = 0; i < 9; i++) {
        const spikeGeo = new THREE.ConeGeometry(0.12, 0.36, 5);
        spikeGeo.translate(0, 0.18, 0);
        const spike = new THREE.Mesh(spikeGeo, mat);
        const angle = (i / 9) * Math.PI * 1.5 - Math.PI * 0.75;
        spike.position.set(Math.cos(angle) * 0.3, 0.32, Math.sin(angle) * 0.25);
        spike.rotation.z = -Math.cos(angle) * 0.4;
        spike.rotation.x = Math.sin(angle) * 0.3;
        hairGroup.add(spike);
      }
      // Top central crest
      const crestGeo = new THREE.ConeGeometry(0.16, 0.45, 6);
      const crest = new THREE.Mesh(crestGeo, mat);
      crest.position.set(0, 0.48, 0.05);
      crest.rotation.x = 0.25;
      hairGroup.add(crest);
    } else if (style === 'high_ponytail') {
      // Base cap + ponytail extension + ribbon
      const baseGeo = new THREE.SphereGeometry(0.41, 14, 12);
      baseGeo.scale(1.02, 1.05, 1.05);
      const base = new THREE.Mesh(baseGeo, mat);
      base.position.set(0, 0.08, -0.04);
      hairGroup.add(base);

      // Ponytail tail
      const tailGeo = new THREE.ConeGeometry(0.14, 0.65, 8);
      tailGeo.translate(0, -0.3, 0);
      const tail = new THREE.Mesh(tailGeo, mat);
      tail.position.set(0, 0.4, -0.38);
      tail.rotation.x = -0.55;
      hairGroup.add(tail);

      // Ribbon
      const ribbonGeo = new THREE.TorusGeometry(0.12, 0.04, 6, 12);
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 });
      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbon.position.set(0, 0.42, -0.36);
      hairGroup.add(ribbon);
    } else if (style === 'twin_buns') {
      // Base hair
      const baseGeo = new THREE.SphereGeometry(0.41, 14, 12);
      const base = new THREE.Mesh(baseGeo, mat);
      base.position.set(0, 0.08, 0);
      hairGroup.add(base);

      // Left Bun & Right Bun
      const bunGeo = new THREE.SphereGeometry(0.18, 12, 10);
      const leftBun = new THREE.Mesh(bunGeo, mat);
      leftBun.position.set(0.36, 0.45, -0.05);
      const rightBun = leftBun.clone();
      rightBun.position.x = -0.36;
      hairGroup.add(leftBun, rightBun);
    } else if (style === 'afro_puffs') {
      // Big voluminous cloud afro
      for (let i = 0; i < 7; i++) {
        const puffGeo = new THREE.SphereGeometry(0.25, 10, 8);
        const puff = new THREE.Mesh(puffGeo, mat);
        const theta = (i / 7) * Math.PI * 2;
        puff.position.set(Math.cos(theta) * 0.28, 0.28 + Math.sin(theta) * 0.1, Math.sin(theta) * 0.25 - 0.05);
        hairGroup.add(puff);
      }
      const topPuff = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), mat);
      topPuff.position.set(0, 0.42, -0.02);
      hairGroup.add(topPuff);
    } else if (style === 'bob_bangs') {
      // Smooth modern bob with front bangs
      const bobGeo = new THREE.CylinderGeometry(0.42, 0.46, 0.5, 16);
      const bob = new THREE.Mesh(bobGeo, mat);
      bob.position.set(0, 0.1, -0.08);
      hairGroup.add(bob);

      // Bangs
      const bangsGeo = new THREE.BoxGeometry(0.5, 0.16, 0.15);
      const bangs = new THREE.Mesh(bangsGeo, mat);
      bangs.position.set(0, 0.28, 0.3);
      hairGroup.add(bangs);
    } else if (style === 'beanie' || style === 'street_cap') {
      // Cool beanie or baseball cap
      const capGeo = new THREE.SphereGeometry(0.44, 16, 12);
      capGeo.scale(1.05, 0.9, 1.1);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.6 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(0, 0.2, -0.02);
      hairGroup.add(cap);

      // Visor / Brim
      const brimGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.05, 16, 1, false, 0, Math.PI);
      const brim = new THREE.Mesh(brimGeo, capMat);
      brim.position.set(0, 0.15, 0.2);
      brim.rotation.x = 0.15;
      hairGroup.add(brim);
    } else {
      // Default sleek / surfer flow
      const flowGeo = new THREE.SphereGeometry(0.42, 14, 12);
      flowGeo.scale(1.04, 1.02, 1.15);
      const flow = new THREE.Mesh(flowGeo, mat);
      flow.position.set(0, 0.12, -0.08);
      hairGroup.add(flow);
    }
  }

  private buildHoverboard() {
    this.hoverboardMesh = new THREE.Group();
    const deckGeo = new THREE.BoxGeometry(0.9, 0.1, 2.2);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.castShadow = true;
    this.hoverboardMesh.add(deck);

    // Glowing thrusters
    const thrusterGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.15, 12);
    const thrusterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
    });
    const frontThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    frontThruster.position.set(0, -0.08, 0.7);
    const rearThruster = frontThruster.clone();
    rearThruster.position.z = -0.7;
    this.hoverboardMesh.add(frontThruster, rearThruster);

    this.hoverboardMesh.position.y = -0.15;
    this.hoverboardMesh.visible = false;
    this.group.add(this.hoverboardMesh);
  }

  public setHoverboardVisible(visible: boolean) {
    this.hoverboardMesh.visible = visible;
  }

  /**
   * Smooth Kinematic Rigging Animation
   */
  public updateAnimation(
    dt: number,
    state: {
      isRunning: boolean;
      isJumping: boolean;
      isSliding: boolean;
      speedMultiplier: number;
      isDead?: boolean;
    }
  ) {
    this.animTimer += dt;

    if (state.isDead) {
      // Stumble / Crash: body tilts back dramatically
      this.bodyGroup.position.y = THREE.MathUtils.damp(this.bodyGroup.position.y, 0.3, 8, dt);
      this.bodyGroup.rotation.x = THREE.MathUtils.damp(this.bodyGroup.rotation.x, -Math.PI * 0.45, 8, dt);
      this.bodyGroup.rotation.z = THREE.MathUtils.damp(this.bodyGroup.rotation.z, 0.3, 8, dt);
      return;
    }

    if (state.isSliding) {
      // Slide pose: pitch body horizontally, tuck legs, lower center of gravity
      this.bodyGroup.position.y = THREE.MathUtils.damp(this.bodyGroup.position.y, 0.35, 14, dt);
      this.bodyGroup.rotation.x = THREE.MathUtils.damp(this.bodyGroup.rotation.x, Math.PI * 0.42, 14, dt);
      this.bodyGroup.rotation.y = THREE.MathUtils.damp(this.bodyGroup.rotation.y, 0.2, 12, dt);

      this.leftLegGroup.rotation.x = THREE.MathUtils.damp(this.leftLegGroup.rotation.x, -0.3, 14, dt);
      this.rightLegGroup.rotation.x = THREE.MathUtils.damp(this.rightLegGroup.rotation.x, 0.4, 14, dt);
      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, -0.6, 14, dt);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, 0.8, 14, dt);
      return;
    }

    if (state.isJumping) {
      // Jumping pose: acrobatic leap, arms flair, legs tuck up
      this.bodyGroup.position.y = THREE.MathUtils.damp(this.bodyGroup.position.y, 0.05, 10, dt);
      this.bodyGroup.rotation.x = THREE.MathUtils.damp(this.bodyGroup.rotation.x, -0.25, 10, dt);
      this.bodyGroup.rotation.y = THREE.MathUtils.damp(this.bodyGroup.rotation.y, 0, 10, dt);

      this.leftLegGroup.rotation.x = THREE.MathUtils.damp(this.leftLegGroup.rotation.x, 0.7, 10, dt);
      this.rightLegGroup.rotation.x = THREE.MathUtils.damp(this.rightLegGroup.rotation.x, -0.6, 10, dt);
      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, -1.8, 10, dt);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, -1.8, 10, dt);
      return;
    }

    // Normal Running Cycle
    if (state.isRunning) {
      const runFrequency = 14 * state.speedMultiplier;
      this.runPhase += dt * runFrequency;

      const swing = Math.sin(this.runPhase);
      const cosSwing = Math.cos(this.runPhase);

      // Bounce torso up and down slightly with stride
      this.bodyGroup.position.y = 0.05 + Math.abs(cosSwing) * 0.08;
      // Slight forward lean for athletic runner momentum
      this.bodyGroup.rotation.x = 0.15;
      this.bodyGroup.rotation.y = swing * 0.08;
      this.bodyGroup.rotation.z = -swing * 0.04;

      // Leg strides (opposite legs)
      this.leftLegGroup.rotation.x = swing * 0.85;
      this.rightLegGroup.rotation.x = -swing * 0.85;

      // Arm swings (contralateral to legs)
      this.leftArmGroup.rotation.x = -swing * 0.85;
      this.rightArmGroup.rotation.x = swing * 0.85;

      // Subtle elbow flex
      this.leftArmGroup.rotation.z = 0.15;
      this.rightArmGroup.rotation.z = -0.15;

      // Hair bounce
      this.headGroup.rotation.x = Math.abs(cosSwing) * 0.08;
    } else {
      // Idle breathing pose (for title/customizer preview)
      const idleSwing = Math.sin(this.animTimer * 2.5);
      this.bodyGroup.position.y = 0.03 + idleSwing * 0.02;
      this.bodyGroup.rotation.x = 0;
      this.bodyGroup.rotation.y = 0;
      this.bodyGroup.rotation.z = 0;

      this.leftLegGroup.rotation.x = 0;
      this.rightLegGroup.rotation.x = 0;
      this.leftArmGroup.rotation.x = idleSwing * 0.08;
      this.rightArmGroup.rotation.x = -idleSwing * 0.08;
    }

    // Shield subtle glow oscillation
    if (this.shieldMesh.visible) {
      this.shieldMesh.rotation.y += dt * 1.5;
      const mat = this.shieldMesh.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.4 + Math.sin(this.animTimer * 6) * 0.12;
    }
  }
}
