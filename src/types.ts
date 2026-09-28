export type TopicId = 'it' | 'math' | 'english' | 'history' | 'science' | 'all';

export interface Question {
  id: string;
  topic: TopicId;
  question: string;
  options: [string, string, string, string]; // A, B, C, D
  correctAnswer: number; // 0, 1, 2, 3
  hint: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface TopicInfo {
  id: TopicId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export type WeaponType = 'normal' | 'spread' | 'laser';

export type GameItemType = 'mushroom' | 'spread' | 'laser';

export type DayNightPhase = 'day' | 'sunset' | 'night' | 'dawn';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isDucking: boolean;
  facing: 'left' | 'right';
  aimDir: 'straight' | 'up' | 'diag_up';
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  weapon: WeaponType;
  shieldActive: boolean;
  shieldTimer: number; // remaining seconds
  invulnerableTimer: number; // hurt frames
  walkFrame: number;
  isJumping: boolean;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: WeaponType | 'enemy' | 'bomb';
  damage: number;
  isPlayer: boolean;
  piercing?: boolean;
  radius: number;
  length?: number;
  color: string;
  life: number;
}

export interface Enemy {
  id: number;
  type: 'patrol' | 'turret' | 'drone' | 'boss';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  shootCooldown: number;
  shootInterval: number;
  facing: 'left' | 'right';
  isAlive: boolean;
  patrolMinX: number;
  patrolMaxX: number;
  scoreValue: number;
  walkFrame?: number;
  color?: string;
}

export interface SupplyPod {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  isAlive: boolean;
  content: GameItemType;
  bobTimer: number;
}

export interface DropItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  type: GameItemType;
  isCollected: boolean;
  life: number; // for despawn or flashing
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'metal' | 'high_scaffold' | 'bridge';
}

export interface Gate {
  id: number;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isCleared: boolean;
  question?: Question;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'spark';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}
