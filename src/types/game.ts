/**
 * Rena Runner 3D - Types & Interfaces
 */

export type Gender = 'male' | 'female';
export type FaceShape = 'round' | 'oval' | 'jawline' | 'chibi';
export type EyeStyle = 'anime' | 'bold' | 'friendly';
export type EyebrowStyle = 'arched' | 'thick' | 'trim';
export type NoseStyle = 'button' | 'petite' | 'pointed' | 'classic';

export type MaleHairStyle = 'anime_spike' | 'street_fade' | 'afro_puffs' | 'beanie' | 'surfer_flow';
export type FemaleHairStyle = 'high_ponytail' | 'twin_buns' | 'bob_bangs' | 'long_curls' | 'street_cap';
export type HairStyle = MaleHairStyle | FemaleHairStyle;

export type ShirtStyle = 'hoodie' | 'tshirt' | 'bomber' | 'tank' | 'cyber_jacket';
export type PantsStyle = 'baggy_jeans' | 'cargo' | 'track_pants' | 'shorts' | 'cyber_lowers';

export interface CharacterConfig {
  gender: Gender;
  username: string;
  skinColor: string;
  faceShape: FaceShape;
  eyeColor: string;
  eyeStyle: EyeStyle;
  eyebrowStyle: EyebrowStyle;
  noseStyle: NoseStyle;
  hairStyle: HairStyle;
  hairColor: string;
  shirtStyle: ShirtStyle;
  shirtColor: string;
  shirtAccentColor: string;
  pantsStyle: PantsStyle;
  pantsColor: string;
  shoeColor: string;
}

export type ThemeMode = 'light' | 'dark';

export interface PowerUpState {
  magnet: number; // seconds left
  multiplier: number; // seconds left
  shield: boolean; // active until hit
  superJump: number; // seconds left
}

export type GameStatus = 'title' | 'playing' | 'paused' | 'gameover' | 'customizing';

export interface GameStats {
  score: number;
  highScore: number;
  prevHighScore: number;
  coins: number;
  distance: number;
  multiplier: number;
  newHighScoreAchieved: boolean;
  highScoreGlow: boolean;
  powerUps: PowerUpState;
}

export type ObstacleType =
  | 'hurdle_low'        // Must jump
  | 'hurdle_high'       // Must slide
  | 'train_standard'    // Train block
  | 'train_ramp'        // Train with an entry ramp you can run onto
  | 'sign_barrier'      // Small street barrier
  | 'construction_bar'; // Overhead bar

export type PowerUpType = 'magnet' | 'multiplier' | 'shield' | 'superJump';
