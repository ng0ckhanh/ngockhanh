import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Player,
  Bullet,
  Enemy,
  SupplyPod,
  DropItem,
  Platform,
  Gate,
  Particle,
  FloatingText,
  GameDifficulty,
  TopicId,
  Question,
  DayNightPhase,
  WeaponType,
  GameItemType,
} from '../types';
import { sound } from '../utils/audio';
import { QuizModal } from './QuizModal';
import { VirtualControls } from './VirtualControls';
import {
  Heart,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Shield,
  HelpCircle,
  Sun,
  Sunset,
  Moon,
  Crosshair,
  Award,
  ChevronRight,
} from 'lucide-react';

interface GameCanvasProps {
  topicId: TopicId;
  difficulty: GameDifficulty;
  questions: Question[];
  onBackToMenu: () => void;
  onChangeTopic: () => void;
  onOpenInstruction: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  topicId,
  difficulty,
  questions,
  onBackToMenu,
  onChangeTopic,
  onOpenInstruction,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Game UI States
  const [currentHp, setCurrentHp] = useState(100);
  const [currentMana, setCurrentMana] = useState(100);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('normal');
  const [score, setScore] = useState(0);
  const [kills, setKills] = useState(0);
  const [clearedGatesCount, setClearedGatesCount] = useState(0);
  const [totalGatesCount, setTotalGatesCount] = useState(3);
  const [dayPhase, setDayPhase] = useState<DayNightPhase>('day');
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [shieldRemainingTime, setShieldRemainingTime] = useState(0);

  // Active Quiz Modal state
  const [activeQuizGate, setActiveQuizGate] = useState<Gate | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // References for live game loop access
  const gameStateRef = useRef({
    isPaused: false,
    isOver: false,
    cameraX: 0,
    cameraY: 0,
    dayNightTimer: 0, // seconds
    score: 0,
    kills: 0,
    questionsAnswered: 0,
    lastTime: performance.now(),
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      shoot: false,
    },
    usedQuestionIds: new Set<string>(),
  });

  // Entities stored in ref to maintain 60 FPS without React re-render lag
  const entitiesRef = useRef<{
    player: Player;
    bullets: Bullet[];
    enemies: Enemy[];
    supplyPods: SupplyPod[];
    dropItems: DropItem[];
    platforms: Platform[];
    gates: Gate[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    levelLength: number;
  }>({
    player: {
      x: 80,
      y: 380,
      vx: 0,
      vy: 0,
      width: 32,
      height: 48,
      isGrounded: false,
      isDucking: false,
      facing: 'right',
      aimDir: 'straight',
      hp: 100,
      maxHp: 100,
      mana: 100,
      maxMana: 100,
      weapon: 'normal',
      shieldActive: false,
      shieldTimer: 0,
      invulnerableTimer: 0,
      walkFrame: 0,
      isJumping: false,
    },
    bullets: [],
    enemies: [],
    supplyPods: [],
    dropItems: [],
    platforms: [],
    gates: [],
    particles: [],
    floatingTexts: [],
    levelLength: 4800,
  });

  // Pick a random question that hasn't been used yet if possible
  const getRandomQuestion = useCallback((): Question => {
    const available = questions.filter(
      q => !gameStateRef.current.usedQuestionIds.has(q.id)
    );
    const pool = available.length > 0 ? available : questions;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    gameStateRef.current.usedQuestionIds.add(selected.id);
    return selected;
  }, [questions]);

  // LEVEL GENERATOR based on difficulty
  const initLevel = useCallback(() => {
    let numGates = 3;
    let levelLen = 4200;
    if (difficulty === 'medium') {
      numGates = 5;
      levelLen = 6500;
    } else if (difficulty === 'hard') {
      numGates = 7;
      levelLen = 9200;
    }

    setTotalGatesCount(numGates);
    setClearedGatesCount(0);
    setIsGameOver(false);
    setIsVictory(false);
    setActiveQuizGate(null);
    gameStateRef.current.usedQuestionIds.clear();
    gameStateRef.current.isPaused = false;
    gameStateRef.current.isOver = false;
    gameStateRef.current.score = 0;
    gameStateRef.current.kills = 0;
    gameStateRef.current.cameraX = 0;
    gameStateRef.current.dayNightTimer = 0;
    setScore(0);
    setKills(0);
    setCurrentHp(100);
    setCurrentMana(100);
    setCurrentWeapon('normal');
    setIsShieldActive(false);

    // Platforms generation
    const platforms: Platform[] = [
      // Main Ground floor
      { x: 0, y: 520, width: levelLen, height: 120, type: 'ground' },
    ];

    // Multi-tiered scaffolding, metal bridges, elevated bunkers
    const segmentWidth = 750;
    for (let segX = 200; segX < levelLen - 500; segX += segmentWidth) {
      // Tier 1 platforms
      platforms.push({ x: segX + 50, y: 440, width: 220, height: 18, type: 'metal' });
      platforms.push({ x: segX + 320, y: 410, width: 180, height: 18, type: 'metal' });
      // Tier 2 platforms
      platforms.push({ x: segX + 180, y: 340, width: 260, height: 18, type: 'high_scaffold' });
      // Tier 3 elevated sniper / turret deck
      platforms.push({ x: segX + 460, y: 280, width: 200, height: 18, type: 'bridge' });
    }

    // Gates generation (after every section)
    const gates: Gate[] = [];
    const gateSpacing = (levelLen - 800) / numGates;
    for (let i = 1; i <= numGates; i++) {
      const gx = 650 + (i - 1) * gateSpacing;
      gates.push({
        id: i,
        index: i,
        x: gx,
        y: 200,
        width: 38,
        height: 320, // Tall laser barrier
        isCleared: false,
        question: getRandomQuestion(),
      });
    }

    // Enemies generation
    const enemies: Enemy[] = [];
    let enemyId = 1;

    for (let x = 400; x < levelLen - 300; x += 280) {
      // Ground patrol soldier
      enemies.push({
        id: enemyId++,
        type: 'patrol',
        x: x + Math.random() * 80,
        y: 472,
        vx: -1.5,
        vy: 0,
        width: 32,
        height: 48,
        hp: difficulty === 'hard' ? 30 : 20,
        maxHp: difficulty === 'hard' ? 30 : 20,
        shootCooldown: 60 + Math.random() * 120,
        shootInterval: difficulty === 'hard' ? 100 : 160,
        facing: 'left',
        isAlive: true,
        patrolMinX: x - 120,
        patrolMaxX: x + 160,
        scoreValue: 150,
      });

      // Turret on elevated platforms every 560px
      if (x % 560 < 280) {
        enemies.push({
          id: enemyId++,
          type: 'turret',
          x: x + 240,
          y: 295,
          vx: 0,
          vy: 0,
          width: 38,
          height: 38,
          hp: 40,
          maxHp: 40,
          shootCooldown: 80 + Math.random() * 90,
          shootInterval: 140,
          facing: 'left',
          isAlive: true,
          patrolMinX: x,
          patrolMaxX: x,
          scoreValue: 250,
        });
      }
    }

    // Boss on hard difficulty at the end
    if (difficulty === 'hard') {
      enemies.push({
        id: enemyId++,
        type: 'boss',
        x: levelLen - 420,
        y: 360,
        vx: 0,
        vy: 0,
        width: 90,
        height: 120,
        hp: 350,
        maxHp: 350,
        shootCooldown: 60,
        shootInterval: 70,
        facing: 'left',
        isAlive: true,
        patrolMinX: levelLen - 480,
        patrolMaxX: levelLen - 200,
        scoreValue: 3000,
      });
    }

    // Supply pods (capsules flying across sky)
    const supplyPods: SupplyPod[] = [
      { id: 1, x: 500, y: 140, vx: -2.2, vy: 0, width: 36, height: 26, hp: 10, isAlive: true, content: 'spread', bobTimer: 0 },
      { id: 2, x: 1400, y: 150, vx: -2.2, vy: 0, width: 36, height: 26, hp: 10, isAlive: true, content: 'laser', bobTimer: 1.5 },
      { id: 3, x: 2300, y: 130, vx: -2.2, vy: 0, width: 36, height: 26, hp: 10, isAlive: true, content: 'mushroom', bobTimer: 3 },
      { id: 4, x: 3400, y: 160, vx: -2.2, vy: 0, width: 36, height: 26, hp: 10, isAlive: true, content: 'spread', bobTimer: 4.5 },
      { id: 5, x: 4500, y: 140, vx: -2.2, vy: 0, width: 36, height: 26, hp: 10, isAlive: true, content: 'mushroom', bobTimer: 6 },
    ];

    entitiesRef.current = {
      player: {
        x: 100,
        y: 472,
        vx: 0,
        vy: 0,
        width: 32,
        height: 48,
        isGrounded: true,
        isDucking: false,
        facing: 'right',
        aimDir: 'straight',
        hp: 100,
        maxHp: 100,
        mana: 100,
        maxMana: 100,
        weapon: 'normal',
        shieldActive: false,
        shieldTimer: 0,
        invulnerableTimer: 0,
        walkFrame: 0,
        isJumping: false,
      },
      bullets: [],
      enemies,
      supplyPods,
      dropItems: [],
      platforms,
      gates,
      particles: [],
      floatingTexts: [],
      levelLength: levelLen,
    };
  }, [difficulty, getRandomQuestion]);

  // Skill Trigger (Shield or Bomb)
  const triggerSkill = useCallback((skillType: 'shield' | 'bomb') => {
    const { player, enemies, bullets, particles, floatingTexts } = entitiesRef.current;
    if (player.hp <= 0 || gameStateRef.current.isPaused) return;

    if (skillType === 'shield') {
      if (player.mana < 30) {
        floatingTexts.push({
          id: Math.random(),
          x: player.x,
          y: player.y - 20,
          text: 'KHÔNG ĐỦ MANA! (CẦN 30)',
          color: '#f87171',
          life: 40,
        });
        return;
      }
      player.mana = Math.max(0, player.mana - 30);
      player.shieldActive = true;
      player.shieldTimer = 7; // 7 seconds invincibility
      setIsShieldActive(true);
      setShieldRemainingTime(7);
      setCurrentMana(player.mana);
      sound.playShield();

      floatingTexts.push({
        id: Math.random(),
        x: player.x,
        y: player.y - 30,
        text: '🛡️ KHIÊN HỘ THỂ BẬT!',
        color: '#38bdf8',
        life: 50,
      });

      // Spawn burst particles around player
      for (let i = 0; i < 20; i++) {
        const ang = Math.random() * Math.PI * 2;
        particles.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          vx: Math.cos(ang) * 4,
          vy: Math.sin(ang) * 4,
          color: '#38bdf8',
          size: 4,
          life: 30,
          maxLife: 30,
        });
      }
    } else if (skillType === 'bomb') {
      if (player.mana < 40) {
        floatingTexts.push({
          id: Math.random(),
          x: player.x,
          y: player.y - 20,
          text: 'KHÔNG ĐỦ MANA! (CẦN 40)',
          color: '#f87171',
          life: 40,
        });
        return;
      }
      player.mana = Math.max(0, player.mana - 40);
      setCurrentMana(player.mana);
      sound.playMegaBomb();

      // Clear all enemy bullets on screen
      entitiesRef.current.bullets = bullets.filter(b => b.isPlayer);

      // Damage all visible enemies on screen
      const screenLeft = gameStateRef.current.cameraX - 100;
      const screenRight = gameStateRef.current.cameraX + 900;
      enemies.forEach(en => {
        if (en.x >= screenLeft && en.x <= screenRight && en.isAlive) {
          en.hp -= 50;
          for (let p = 0; p < 15; p++) {
            particles.push({
              x: en.x + en.width / 2,
              y: en.y + en.height / 2,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              color: '#f97316',
              size: 5,
              life: 35,
              maxLife: 35,
            });
          }
          if (en.hp <= 0) {
            en.isAlive = false;
            gameStateRef.current.kills++;
            gameStateRef.current.score += en.scoreValue;
            setKills(gameStateRef.current.kills);
            setScore(gameStateRef.current.score);
          }
        }
      });

      floatingTexts.push({
        id: Math.random(),
        x: player.x,
        y: player.y - 30,
        text: '💥 MEGA BOM QUÉT SẠCH!',
        color: '#fbbf24',
        life: 50,
      });
    }
  }, []);

  // Fire Weapon Shoot function
  const shootBullet = useCallback(() => {
    const { player, bullets } = entitiesRef.current;
    if (player.hp <= 0 || gameStateRef.current.isPaused) return;

    sound.playShoot(player.weapon);

    const gunX = player.facing === 'right' ? player.x + player.width + 2 : player.x - 2;
    const gunY = player.isDucking ? player.y + 16 : player.y + 16;
    const baseSpeed = 12;
    const dir = player.facing === 'right' ? 1 : -1;

    let vx = dir * baseSpeed;
    let vy = 0;

    if (player.aimDir === 'up') {
      vx = 0;
      vy = -baseSpeed;
    } else if (player.aimDir === 'diag_up') {
      vx = dir * (baseSpeed * 0.72);
      vy = -baseSpeed * 0.72;
    }

    if (player.weapon === 'normal') {
      bullets.push({
        id: Math.random(),
        x: gunX,
        y: gunY,
        vx,
        vy,
        type: 'normal',
        damage: 15,
        isPlayer: true,
        radius: 4,
        color: '#facc15',
        life: 70,
      });
    } else if (player.weapon === 'spread') {
      // 3-way spread
      const angles = [-0.24, 0, 0.24];
      const baseAngle = Math.atan2(vy, vx);
      angles.forEach(offsetAngle => {
        const finalAngle = baseAngle + offsetAngle;
        bullets.push({
          id: Math.random(),
          x: gunX,
          y: gunY,
          vx: Math.cos(finalAngle) * baseSpeed,
          vy: Math.sin(finalAngle) * baseSpeed,
          type: 'spread',
          damage: 16,
          isPlayer: true,
          radius: 5,
          color: '#fb7185',
          life: 70,
        });
      });
    } else if (player.weapon === 'laser') {
      // Piercing continuous laser beam
      bullets.push({
        id: Math.random(),
        x: gunX,
        y: gunY,
        vx: vx * 1.5,
        vy: vy * 1.5,
        type: 'laser',
        damage: 32,
        isPlayer: true,
        piercing: true,
        radius: 6,
        length: 26,
        color: '#38bdf8',
        life: 55,
      });
    }
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If quiz is open, let QuizModal handle numbers/letters
      if (activeQuizGate) return;

      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') {
        gameStateRef.current.keys.left = true;
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        gameStateRef.current.keys.right = true;
      } else if (code === 'KeyW' || code === 'ArrowUp') {
        gameStateRef.current.keys.up = true;
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        gameStateRef.current.keys.down = true;
      } else if (code === 'Space') {
        e.preventDefault();
        // Jump trigger
        const { player } = entitiesRef.current;
        if (player.isGrounded && !player.isDucking) {
          player.vy = -14;
          player.isGrounded = false;
          player.isJumping = true;
          sound.playJump();
        }
      } else if (code === 'KeyJ') {
        shootBullet();
      } else if (code === 'KeyK') {
        triggerSkill('shield');
      } else if (code === 'KeyB') {
        triggerSkill('bomb');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') {
        gameStateRef.current.keys.left = false;
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        gameStateRef.current.keys.right = false;
      } else if (code === 'KeyW' || code === 'ArrowUp') {
        gameStateRef.current.keys.up = false;
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        gameStateRef.current.keys.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeQuizGate, shootBullet, triggerSkill]);

  // Virtual control bindings for mobile/touch
  const handleVirtualKeyDown = (code: string) => {
    if (code === 'ArrowLeft') gameStateRef.current.keys.left = true;
    if (code === 'ArrowRight') gameStateRef.current.keys.right = true;
    if (code === 'ArrowUp') gameStateRef.current.keys.up = true;
    if (code === 'ArrowDown') gameStateRef.current.keys.down = true;
    if (code === 'Space') {
      const { player } = entitiesRef.current;
      if (player.isGrounded && !player.isDucking) {
        player.vy = -14;
        player.isGrounded = false;
        player.isJumping = true;
        sound.playJump();
      }
    }
    if (code === 'KeyJ') shootBullet();
  };

  const handleVirtualKeyUp = (code: string) => {
    if (code === 'ArrowLeft') gameStateRef.current.keys.left = false;
    if (code === 'ArrowRight') gameStateRef.current.keys.right = false;
    if (code === 'ArrowUp') gameStateRef.current.keys.up = false;
    if (code === 'ArrowDown') gameStateRef.current.keys.down = false;
  };

  // Canvas click to shoot
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current.isPaused) return;
    shootBullet();
  };

  // Initialize level on mount
  useEffect(() => {
    initLevel();
  }, [initLevel]);

  // QUIZ RESOLUTION CALLBACKS (Phần 4)
  const handleQuizAnswerCorrect = () => {
    if (!activeQuizGate) return;
    const gateId = activeQuizGate.id;

    // Explode gate visual particles!
    const { particles, floatingTexts, gates } = entitiesRef.current;
    const targetGate = gates.find(g => g.id === gateId);
    if (targetGate) {
      targetGate.isCleared = true;
      for (let i = 0; i < 45; i++) {
        particles.push({
          x: targetGate.x + Math.random() * targetGate.width,
          y: targetGate.y + Math.random() * targetGate.height,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          color: i % 2 === 0 ? '#38bdf8' : '#f59e0b',
          size: Math.random() * 5 + 3,
          life: 45,
          maxLife: 45,
        });
      }
    }

    sound.playExplosion();
    gameStateRef.current.score += 500;
    gameStateRef.current.questionsAnswered++;
    setScore(gameStateRef.current.score);

    floatingTexts.push({
      id: Math.random(),
      x: (targetGate?.x || 500) - 20,
      y: 260,
      text: '+500 ĐIỂM! CỔNG PHONG ẤN PHÁ HỦY!',
      color: '#34d399',
      life: 60,
    });

    const newCleared = clearedGatesCount + 1;
    setClearedGatesCount(newCleared);
    setActiveQuizGate(null);

    // Unpause game
    gameStateRef.current.isPaused = false;

    // Check Victory condition: all gates cleared!
    if (newCleared >= totalGatesCount) {
      setTimeout(() => {
        setIsVictory(true);
        gameStateRef.current.isOver = true;
        sound.playVictory();
      }, 800);
    }
  };

  const handleQuizAnswerWrong = () => {
    // Deduct a tiny score penalty (min 0)
    gameStateRef.current.score = Math.max(0, gameStateRef.current.score - 50);
    setScore(gameStateRef.current.score);
  };

  // MAIN GAME LOOP (Physics, Render, Camera, Day-Night cycle)
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - gameStateRef.current.lastTime) / 1000, 0.1);
      gameStateRef.current.lastTime = currentTime;

      const {
        player,
        bullets,
        enemies,
        supplyPods,
        dropItems,
        platforms,
        gates,
        particles,
        floatingTexts,
        levelLength,
      } = entitiesRef.current;

      // ===========================
      // 1. UPDATE (If not paused)
      // ===========================
      if (!gameStateRef.current.isPaused && !gameStateRef.current.isOver) {
        // --- Day / Night Cycle (Phần 6) ---
        // Cycle is 100s: 0-35s Day, 35-50s Sunset, 50-85s Night, 85-100s Dawn
        gameStateRef.current.dayNightTimer = (gameStateRef.current.dayNightTimer + dt) % 100;
        const dnTime = gameStateRef.current.dayNightTimer;
        let currentPhase: DayNightPhase = 'day';
        if (dnTime < 35) currentPhase = 'day';
        else if (dnTime < 50) currentPhase = 'sunset';
        else if (dnTime < 85) currentPhase = 'night';
        else currentPhase = 'dawn';

        if (currentPhase !== dayPhase) {
          setDayPhase(currentPhase);
        }

        // --- Mana Regeneration ---
        if (player.mana < player.maxMana) {
          player.mana = Math.min(player.maxMana, player.mana + dt * 2.5); // passive regen
          setCurrentMana(Math.floor(player.mana));
        }

        // --- Shield Timer ---
        if (player.shieldActive) {
          player.shieldTimer -= dt;
          setShieldRemainingTime(Math.max(0, Math.ceil(player.shieldTimer)));
          if (player.shieldTimer <= 0) {
            player.shieldActive = false;
            setIsShieldActive(false);
          }
        }

        // --- Invulnerability Flash Timer ---
        if (player.invulnerableTimer > 0) {
          player.invulnerableTimer -= dt;
        }

        // --- Player Controls & Movement ---
        const { left, right, up, down } = gameStateRef.current.keys;
        const moveSpeed = 4.2;

        if (left) {
          player.vx = -moveSpeed;
          player.facing = 'left';
          player.walkFrame += dt * 10;
        } else if (right) {
          player.vx = moveSpeed;
          player.facing = 'right';
          player.walkFrame += dt * 10;
        } else {
          player.vx = 0;
        }

        // Aiming direction
        if (up && (left || right)) {
          player.aimDir = 'diag_up';
        } else if (up) {
          player.aimDir = 'up';
        } else {
          player.aimDir = 'straight';
        }

        // Ducking
        if (down && player.isGrounded) {
          player.isDucking = true;
          player.height = 28; // Lower hitbox!
        } else {
          player.isDucking = false;
          player.height = 48;
        }

        // Jump physics
        if (up && player.isGrounded && !down) {
          player.vy = -14;
          player.isGrounded = false;
          player.isJumping = true;
          sound.playJump();
        }

        // Gravity
        player.vy += 0.65;
        player.x += player.vx;
        player.y += player.vy;

        // Boundaries
        if (player.x < 10) player.x = 10;
        if (player.x > levelLength - 100) player.x = levelLength - 100;

        // Platform collision
        player.isGrounded = false;
        platforms.forEach(plat => {
          if (
            player.x + player.width > plat.x &&
            player.x < plat.x + plat.width &&
            player.y + player.height >= plat.y &&
            player.y + player.height <= plat.y + 20 &&
            player.vy >= 0
          ) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
            player.isJumping = false;
          }
        });

        // --- Gate Collisions (Phần 4: Chướng ngại vật trắc nghiệm) ---
        gates.forEach(gate => {
          if (!gate.isCleared) {
            // Check collision with player
            if (
              player.x + player.width >= gate.x &&
              player.x <= gate.x + gate.width &&
              player.y + player.height >= gate.y
            ) {
              // Touch the seal gate! Stop player and freeze game
              player.vx = 0;
              player.x = gate.x - player.width - 2; // Bounce back slightly
              gameStateRef.current.isPaused = true;
              setActiveQuizGate(gate);
            }
          }
        });

        // --- Bullets Update ---
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          b.life -= 1;

          // Remove dead bullets or out of screen
          if (b.life <= 0 || b.x < gameStateRef.current.cameraX - 200 || b.x > gameStateRef.current.cameraX + 1100) {
            bullets.splice(i, 1);
            continue;
          }

          // Player bullets hitting enemies
          if (b.isPlayer) {
            let hitTarget = false;
            // Enemies check
            for (const en of enemies) {
              if (
                en.isAlive &&
                b.x >= en.x &&
                b.x <= en.x + en.width &&
                b.y >= en.y &&
                b.y <= en.y + en.height
              ) {
                en.hp -= b.damage;
                hitTarget = true;

                // Hit spark particle
                particles.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  color: b.color,
                  size: 3,
                  life: 15,
                  maxLife: 15,
                });

                if (en.hp <= 0) {
                  en.isAlive = false;
                  sound.playExplosion();
                  gameStateRef.current.kills++;
                  gameStateRef.current.score += en.scoreValue;
                  setKills(gameStateRef.current.kills);
                  setScore(gameStateRef.current.score);

                  // Explosion burst
                  for (let p = 0; p < 18; p++) {
                    particles.push({
                      x: en.x + en.width / 2,
                      y: en.y + en.height / 2,
                      vx: (Math.random() - 0.5) * 8,
                      vy: (Math.random() - 0.5) * 8,
                      color: p % 2 === 0 ? '#f97316' : '#eab308',
                      size: 4,
                      life: 25,
                      maxLife: 25,
                    });
                  }

                  floatingTexts.push({
                    id: Math.random(),
                    x: en.x,
                    y: en.y - 15,
                    text: `+${en.scoreValue}`,
                    color: '#facc15',
                    life: 30,
                  });
                }
                break;
              }
            }

            // Supply pods check (Phần 5)
            for (const pod of supplyPods) {
              if (
                pod.isAlive &&
                b.x >= pod.x &&
                b.x <= pod.x + pod.width &&
                b.y >= pod.y &&
                b.y <= pod.y + pod.height
              ) {
                pod.hp -= b.damage;
                hitTarget = true;
                if (pod.hp <= 0) {
                  pod.isAlive = false;
                  sound.playExplosion();
                  // Drop Item falling to ground!
                  dropItems.push({
                    id: Math.random(),
                    x: pod.x,
                    y: pod.y,
                    vy: 1.5,
                    width: 28,
                    height: 28,
                    type: pod.content,
                    isCollected: false,
                    life: 600, // 10s before disappearing
                  });

                  for (let p = 0; p < 12; p++) {
                    particles.push({
                      x: pod.x + pod.width / 2,
                      y: pod.y + pod.height / 2,
                      vx: (Math.random() - 0.5) * 6,
                      vy: (Math.random() - 0.5) * 6,
                      color: '#38bdf8',
                      size: 4,
                      life: 20,
                      maxLife: 20,
                    });
                  }
                }
                break;
              }
            }

            // Remove non-piercing bullet on hit
            if (hitTarget && !b.piercing) {
              bullets.splice(i, 1);
            }
          } else {
            // Enemy bullet hitting Player
            if (
              !player.shieldActive &&
              player.invulnerableTimer <= 0 &&
              b.x >= player.x &&
              b.x <= player.x + player.width &&
              b.y >= player.y &&
              b.y <= player.y + player.height
            ) {
              player.hp -= b.damage;
              player.invulnerableTimer = 1.0; // 1s flashing
              setCurrentHp(Math.max(0, player.hp));
              bullets.splice(i, 1);

              sound.playExplosion();

              floatingTexts.push({
                id: Math.random(),
                x: player.x,
                y: player.y - 20,
                text: `-${b.damage} HP`,
                color: '#ef4444',
                life: 30,
              });

              if (player.hp <= 0) {
                setIsGameOver(true);
                gameStateRef.current.isOver = true;
                sound.playGameOver();
              }
            }
          }
        }

        // --- Enemies Update ---
        enemies.forEach(en => {
          if (!en.isAlive) return;

          // Patrol soldier logic
          if (en.type === 'patrol') {
            en.x += en.vx;
            if (en.x <= en.patrolMinX) {
              en.vx = Math.abs(en.vx);
              en.facing = 'right';
            } else if (en.x >= en.patrolMaxX) {
              en.vx = -Math.abs(en.vx);
              en.facing = 'left';
            }

            // Patrol shoots at player when in range
            const dist = Math.abs(player.x - en.x);
            if (dist < 420) {
              en.shootCooldown -= 1;
              if (en.shootCooldown <= 0) {
                en.shootCooldown = en.shootInterval;
                const shootDir = player.x < en.x ? -1 : 1;
                en.facing = shootDir === -1 ? 'left' : 'right';
                bullets.push({
                  id: Math.random(),
                  x: shootDir === -1 ? en.x - 4 : en.x + en.width + 4,
                  y: en.y + 16,
                  vx: shootDir * 5,
                  vy: 0,
                  type: 'enemy',
                  damage: 15,
                  isPlayer: false,
                  radius: 5,
                  color: '#ef4444',
                  life: 100,
                });
              }
            }
          } else if (en.type === 'turret') {
            // Aim at player angle
            const dist = Math.hypot(player.x - en.x, player.y - en.y);
            if (dist < 500) {
              en.shootCooldown -= 1;
              if (en.shootCooldown <= 0) {
                en.shootCooldown = en.shootInterval;
                const angle = Math.atan2(player.y - en.y, player.x - en.x);
                bullets.push({
                  id: Math.random(),
                  x: en.x + en.width / 2,
                  y: en.y + en.height / 2,
                  vx: Math.cos(angle) * 4.5,
                  vy: Math.sin(angle) * 4.5,
                  type: 'enemy',
                  damage: 20,
                  isPlayer: false,
                  radius: 6,
                  color: '#f97316',
                  life: 110,
                });
              }
            }
          } else if (en.type === 'boss') {
            // Boss attacks
            en.shootCooldown -= 1;
            if (en.shootCooldown <= 0) {
              en.shootCooldown = en.shootInterval;
              // 3-way boss spread
              [-0.3, 0, 0.3].forEach(angleOff => {
                const angle = Math.atan2(player.y - (en.y + 40), player.x - en.x) + angleOff;
                bullets.push({
                  id: Math.random(),
                  x: en.x,
                  y: en.y + 40,
                  vx: Math.cos(angle) * 5,
                  vy: Math.sin(angle) * 5,
                  type: 'enemy',
                  damage: 25,
                  isPlayer: false,
                  radius: 7,
                  color: '#dc2626',
                  life: 120,
                });
              });
            }
          }
        });

        // --- Supply Pods Update ---
        supplyPods.forEach(pod => {
          if (!pod.isAlive) return;
          pod.x += pod.vx;
          pod.bobTimer += dt * 3;
          pod.y += Math.sin(pod.bobTimer) * 0.8;
          // Loop around screen if left
          if (pod.x < gameStateRef.current.cameraX - 100) {
            pod.x = gameStateRef.current.cameraX + 900;
          }
        });

        // --- Drop Items Update & Collection (Phần 5) ---
        dropItems.forEach(item => {
          if (item.isCollected) return;
          item.life -= 1;
          item.y += item.vy;

          // Ground collision
          if (item.y > 492) {
            item.y = 492;
            item.vy = 0;
          }

          // Player touches drop item
          if (
            player.x + player.width >= item.x &&
            player.x <= item.x + item.width &&
            player.y + player.height >= item.y &&
            player.y <= item.y + item.height
          ) {
            item.isCollected = true;
            sound.playItemPickup();

            if (item.type === 'mushroom') {
              // Nấm thần kỳ: Hồi 100% HP và Mana!
              player.hp = player.maxHp;
              player.mana = player.maxMana;
              setCurrentHp(100);
              setCurrentMana(100);
              floatingTexts.push({
                id: Math.random(),
                x: player.x,
                y: player.y - 25,
                text: '🍄 FULL 100% MÁU & MANA!',
                color: '#4ade80',
                life: 60,
              });
            } else if (item.type === 'spread') {
              // Súng S
              player.weapon = 'spread';
              setCurrentWeapon('spread');
              floatingTexts.push({
                id: Math.random(),
                x: player.x,
                y: player.y - 25,
                text: '💥 NHẬN SÚNG S (SPREAD)!',
                color: '#fb7185',
                life: 60,
              });
            } else if (item.type === 'laser') {
              // Súng L
              player.weapon = 'laser';
              setCurrentWeapon('laser');
              floatingTexts.push({
                id: Math.random(),
                x: player.x,
                y: player.y - 25,
                text: '⚡ NHẬN SÚNG L (LASER XUYÊN THẤU)!',
                color: '#38bdf8',
                life: 60,
              });
            }

            // Collection sparkle
            for (let i = 0; i < 15; i++) {
              particles.push({
                x: item.x + item.width / 2,
                y: item.y + item.height / 2,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: '#facc15',
                size: 3,
                life: 25,
                maxLife: 25,
              });
            }
          }
        });

        // Filter out collected or expired items
        entitiesRef.current.dropItems = dropItems.filter(item => !item.isCollected && item.life > 0);

        // --- Particles Update ---
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;
          if (p.life <= 0) particles.splice(i, 1);
        }

        // --- Floating texts update ---
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
          const t = floatingTexts[i];
          t.y -= 0.6;
          t.life -= 1;
          if (t.life <= 0) floatingTexts.splice(i, 1);
        }

        // --- Smooth Camera Follow ---
        const targetCamX = player.x - 260;
        gameStateRef.current.cameraX += (targetCamX - gameStateRef.current.cameraX) * 0.1;
        if (gameStateRef.current.cameraX < 0) gameStateRef.current.cameraX = 0;
        if (gameStateRef.current.cameraX > levelLength - 860) {
          gameStateRef.current.cameraX = levelLength - 860;
        }
      }

      // ===========================
      // 2. RENDER CANVAS
      // ===========================
      const camX = gameStateRef.current.cameraX;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- SKY BACKGROUND & DAY-NIGHT GRADIENTS (Phần 6) ---
      let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      const dnTimer = gameStateRef.current.dayNightTimer;

      if (dnTimer < 35) {
        // DAY: Bright Cyan & Light Blue
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.6, '#38bdf8');
        skyGrad.addColorStop(1, '#bae6fd');
      } else if (dnTimer < 50) {
        // SUNSET: Vibrant Orange, Crimson, Purple
        const t = (dnTimer - 35) / 15;
        skyGrad.addColorStop(0, '#4c1d95');
        skyGrad.addColorStop(0.4, '#c026d3');
        skyGrad.addColorStop(0.7, '#ea580c');
        skyGrad.addColorStop(1, '#fed7aa');
      } else if (dnTimer < 85) {
        // NIGHT: Deep Midnight Blue & Starfield
        skyGrad.addColorStop(0, '#030712');
        skyGrad.addColorStop(0.6, '#0f172a');
        skyGrad.addColorStop(1, '#1e1b4b');
      } else {
        // DAWN: Violet to Light Blue
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(0.5, '#7c3aed');
        skyGrad.addColorStop(1, '#67e8f9');
      }

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw celestial bodies (Sun / Moon / Stars)
      if (dnTimer >= 50 && dnTimer < 85) {
        // Stars
        ctx.fillStyle = '#ffffff';
        for (let s = 0; s < 50; s++) {
          const sx = (s * 87 + camX * 0.05) % canvas.width;
          const sy = (s * 39) % 220;
          ctx.beginPath();
          ctx.arc(sx, sy, (s % 3 === 0) ? 1.8 : 1, 0, Math.PI * 2);
          ctx.fill();
        }
        // Glowing Crescent Moon
        ctx.save();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(canvas.width - 120, 80, 24, 0, Math.PI * 2);
        ctx.fill();
        // Cut out crescent
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(canvas.width - 110, 75, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Sun with glow
        ctx.save();
        const sunGlow = ctx.createRadialGradient(canvas.width - 120, 80, 10, canvas.width - 120, 80, 50);
        sunGlow.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
        sunGlow.addColorStop(0.5, 'rgba(251, 146, 60, 0.4)');
        sunGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(canvas.width - 120, 80, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Parallax Distant Mountains
      ctx.fillStyle = dnTimer >= 50 && dnTimer < 85 ? '#0f172a' : '#0369a1';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let mx = 0; mx <= canvas.width; mx += 60) {
        const my = 330 + Math.sin((mx + camX * 0.2) * 0.015) * 50;
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Foreground Jungle / Cyber Military Outpost Hills
      ctx.fillStyle = dnTimer >= 50 && dnTimer < 85 ? '#064e3b' : '#047857';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let fx = 0; fx <= canvas.width; fx += 50) {
        const fy = 410 + Math.sin((fx + camX * 0.5) * 0.02) * 35;
        ctx.lineTo(fx, fy);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // --- WORLD RENDERING (Transformed by Camera) ---
      ctx.save();
      ctx.translate(-camX, 0);

      // 1. Draw Platforms (Ground and Scaffolding)
      platforms.forEach(plat => {
        if (plat.type === 'ground') {
          // Dirt / Grass Ground
          ctx.fillStyle = '#15803d'; // Green top grass
          ctx.fillRect(plat.x, plat.y, plat.width, 10);
          ctx.fillStyle = '#451a03'; // Brown bedrock
          ctx.fillRect(plat.x, plat.y + 10, plat.width, plat.height - 10);

          // Top grass pixel texture
          ctx.fillStyle = '#86efac';
          for (let gx = plat.x; gx < plat.x + plat.width; gx += 16) {
            ctx.fillRect(gx, plat.y, 8, 3);
          }
        } else {
          // Metal bridge / High scaffolding
          ctx.fillStyle = '#334155';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          // Metallic border
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

          // Support pillars
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(plat.x + 10, plat.y + plat.height);
          ctx.lineTo(plat.x + 10, plat.y + plat.height + 40);
          ctx.moveTo(plat.x + plat.width - 10, plat.y + plat.height);
          ctx.lineTo(plat.x + plat.width - 10, plat.y + plat.height + 40);
          ctx.stroke();
        }
      });

      // 2. Draw Gates (Cổng phong ấn rào chắn ma thuật)
      gates.forEach(gate => {
        if (!gate.isCleared) {
          // Pulsing holographic energy barrier
          const pulse = (Math.sin(currentTime * 0.008 + gate.id) + 1) * 0.5;
          ctx.save();
          // Glow column
          const gateGrad = ctx.createLinearGradient(gate.x, 0, gate.x + gate.width, 0);
          gateGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
          gateGrad.addColorStop(0.5, `rgba(234, 179, 8, ${0.7 + pulse * 0.3})`);
          gateGrad.addColorStop(1, 'rgba(56, 189, 248, 0.2)');

          ctx.fillStyle = gateGrad;
          ctx.fillRect(gate.x, gate.y, gate.width, gate.height);

          // Cyber Laser Beam lines
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(gate.x + gate.width / 2, gate.y);
          ctx.lineTo(gate.x + gate.width / 2, gate.y + gate.height);
          ctx.stroke();

          // Gate Top & Bottom Generator Pylons
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(gate.x - 8, gate.y - 12, gate.width + 16, 24);
          ctx.fillRect(gate.x - 8, gate.y + gate.height - 12, gate.width + 16, 24);

          ctx.strokeStyle = '#eab308';
          ctx.strokeRect(gate.x - 8, gate.y - 12, gate.width + 16, 24);
          ctx.strokeRect(gate.x - 8, gate.y + gate.height - 12, gate.width + 16, 24);

          // Lock Icon Badge & Gate Index
          ctx.fillStyle = '#eab308';
          ctx.font = 'bold 12px "Chakra Petch", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`CỔNG #${gate.index}`, gate.x + gate.width / 2, gate.y + gate.height / 2 - 20);
          ctx.font = '18px monospace';
          ctx.fillText(`🔒`, gate.x + gate.width / 2, gate.y + gate.height / 2 + 10);
          ctx.restore();
        }
      });

      // 3. Draw Supply Pods (Phần 5: Flying Capsules)
      supplyPods.forEach(pod => {
        if (!pod.isAlive) return;
        ctx.save();
        // Metallic red & silver pod
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.ellipse(pod.x + pod.width / 2, pod.y + pod.height / 2, pod.width / 2, pod.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Flashing wings
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(pod.x - 6, pod.y + 8, 8, 6);
        ctx.fillRect(pod.x + pod.width - 2, pod.y + 8, 8, 6);

        // Letter on Pod
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        const label = pod.content === 'spread' ? 'S' : pod.content === 'laser' ? 'L' : '🍄';
        ctx.fillText(label, pod.x + pod.width / 2, pod.y + pod.height / 2 + 4);
        ctx.restore();
      });

      // 4. Draw Drop Items on ground (Nấm thần kỳ, Súng S, Súng L)
      dropItems.forEach(item => {
        if (item.isCollected) return;
        ctx.save();
        const bounce = Math.sin(currentTime * 0.01 + item.id) * 3;

        // Glowing circle aura
        ctx.beginPath();
        ctx.arc(item.x + item.width / 2, item.y + item.height / 2 + bounce, 18, 0, Math.PI * 2);
        ctx.fillStyle = item.type === 'mushroom' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)';
        ctx.fill();

        // Item box
        ctx.fillStyle = item.type === 'mushroom' ? '#15803d' : '#b45309';
        ctx.fillRect(item.x, item.y + bounce, item.width, item.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(item.x, item.y + bounce, item.width, item.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        const icon = item.type === 'mushroom' ? '🍄' : item.type === 'spread' ? 'S' : 'L';
        ctx.fillText(icon, item.x + item.width / 2, item.y + item.height / 2 + bounce + 5);
        ctx.restore();
      });

      // 5. Draw Enemies
      enemies.forEach(en => {
        if (!en.isAlive) return;
        ctx.save();

        if (en.type === 'patrol') {
          // Red Patrol Soldier
          ctx.fillStyle = '#dc2626'; // Red uniform
          ctx.fillRect(en.x + 6, en.y + 12, 20, 24);

          // Head & Helmet
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.arc(en.x + 16, en.y + 8, 8, 0, Math.PI * 2);
          ctx.fill();

          // Gun barrel facing
          ctx.fillStyle = '#1e293b';
          const gunDir = en.facing === 'left' ? -1 : 1;
          ctx.fillRect(en.x + 16, en.y + 18, gunDir * 18, 5);

          // Moving legs
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(en.x + 8, en.y + 36, 6, 12);
          ctx.fillRect(en.x + 18, en.y + 36, 6, 12);
        } else if (en.type === 'turret') {
          // Heavy Bunker Cannon Turret
          ctx.fillStyle = '#475569';
          ctx.fillRect(en.x + 4, en.y + 16, en.width - 8, 22);

          // Dome
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(en.x + en.width / 2, en.y + 16, 16, Math.PI, 0);
          ctx.fill();

          // Gun aimed at player
          const angle = Math.atan2(player.y - en.y, player.x - en.x);
          ctx.save();
          ctx.translate(en.x + en.width / 2, en.y + 16);
          ctx.rotate(angle);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, -4, 22, 8);
          ctx.restore();
        } else if (en.type === 'boss') {
          // Giant Mecha Alien Boss
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(en.x, en.y, en.width, en.height);

          // Armor plating
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(en.x, en.y, en.width, en.height);

          // Glowing Alien Eye
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(en.x + 30, en.y + 40, 16, 0, Math.PI * 2);
          ctx.fill();

          // Multiple gun turrets
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(en.x - 20, en.y + 30, 24, 10);
          ctx.fillRect(en.x - 20, en.y + 70, 24, 10);

          // Boss Health Bar on head
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(en.x - 10, en.y - 18, en.width + 20, 10);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(en.x - 10, en.y - 18, (en.width + 20) * (en.hp / en.maxHp), 10);
        }

        ctx.restore();
      });

      // 6. Draw Contra Hero Player (Phần 3: Bill/Lance authentic retro sprite)
      const flashVisible = player.invulnerableTimer <= 0 || Math.floor(currentTime / 80) % 2 === 0;
      if (player.hp > 0 && flashVisible) {
        ctx.save();

        const px = player.x;
        const py = player.y;
        const facingRight = player.facing === 'right';

        if (player.isJumping) {
          // Classic Contra Somersault Spin!
          const spinAngle = (currentTime * 0.015) % (Math.PI * 2);
          ctx.save();
          ctx.translate(px + player.width / 2, py + player.height / 2);
          ctx.rotate(facingRight ? spinAngle : -spinAngle);

          // Curled body ball
          ctx.fillStyle = '#15803d'; // Camo green pants
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();

          // Red headband trail
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-12, -14, 12, 6);

          ctx.restore();
        } else if (player.isDucking) {
          // Ducking prone pose (né đạn tầm cao)
          ctx.fillStyle = '#15803d'; // Camo pants
          ctx.fillRect(px, py + 14, 32, 14);

          // Torso & head flat down
          ctx.fillStyle = '#fdba74'; // Skin tone
          ctx.fillRect(px + (facingRight ? 14 : 2), py + 4, 14, 12);

          // Red Headband
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(px + (facingRight ? 12 : 0), py + 6, 16, 4);

          // Gun resting on ground
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px + (facingRight ? 18 : -14), py + 18, 26, 6);
        } else {
          // Standing / Running Pose
          const legPhase = Math.sin(player.walkFrame);

          // Camo Pants / Legs
          ctx.fillStyle = '#166534';
          if (player.vx !== 0) {
            ctx.fillRect(px + 6 + legPhase * 4, py + 30, 8, 18);
            ctx.fillRect(px + 18 - legPhase * 4, py + 30, 8, 18);
          } else {
            ctx.fillRect(px + 6, py + 30, 8, 18);
            ctx.fillRect(px + 18, py + 30, 8, 18);
          }

          // Combat Boots
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px + 4, py + 42, 10, 6);
          ctx.fillRect(px + 18, py + 42, 10, 6);

          // Bare Torso / Military Belt
          ctx.fillStyle = '#fed7aa'; // Muscular skin
          ctx.fillRect(px + 8, py + 14, 16, 16);
          ctx.fillStyle = '#854d0e'; // Ammo bandolier belt
          ctx.fillRect(px + 8, py + 26, 16, 4);

          // Head & Hair
          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(px + 10, py + 2, 12, 12);
          ctx.fillStyle = '#78350f'; // Brown spiky hair
          ctx.fillRect(px + 9, py, 14, 5);

          // Red Bandana Headband
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(px + 8, py + 4, 16, 4);
          // Bandana tail flapping
          const tailDir = facingRight ? -1 : 1;
          ctx.fillRect(px + (facingRight ? 4 : 22), py + 5, tailDir * 6, 3);

          // Contra Assault Gun Rifle
          ctx.fillStyle = '#0f172a';
          if (player.aimDir === 'up') {
            ctx.fillRect(px + (facingRight ? 16 : 10), py - 12, 6, 26);
          } else if (player.aimDir === 'diag_up') {
            ctx.save();
            ctx.translate(px + 16, py + 16);
            ctx.rotate(facingRight ? -Math.PI / 4 : -Math.PI * 3 / 4);
            ctx.fillRect(0, -3, 26, 6);
            ctx.restore();
          } else {
            // Straight forward
            const gunX = facingRight ? px + 14 : px - 12;
            ctx.fillRect(gunX, py + 16, 26, 6);
          }
        }

        // --- MANA SHIELD EFFECT (Aura) ---
        if (player.shieldActive) {
          ctx.save();
          const shieldPulse = (Math.sin(currentTime * 0.012) + 1) * 0.5;
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.8 + shieldPulse * 0.2})`;
          ctx.lineWidth = 3;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.beginPath();
          ctx.arc(px + player.width / 2, py + player.height / 2, 34 + shieldPulse * 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();

          // Hexagonal energy rings
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px + player.width / 2, py + player.height / 2, 28, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      }

      // 7. Draw Bullets
      bullets.forEach(b => {
        ctx.save();
        if (b.type === 'laser') {
          // Glowing Laser beam
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Normal, Spread, Enemy bullets
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      });

      // 8. Draw Particles
      particles.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 9. Draw Floating texts (Damage numbers, Score, Item notifications)
      floatingTexts.forEach(t => {
        ctx.save();
        ctx.font = 'bold 13px "Chakra Petch", monospace';
        ctx.fillStyle = t.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });

      ctx.restore(); // Restore camera translation

      // --- NIGHT PHASE: DYNAMIC LIGHTING / SPOTLIGHT HALO AROUND CONTRA (Phần 6) ---
      if (dnTimer >= 50 && dnTimer < 85) {
        ctx.save();
        // Screen-wide dark mask
        const darknessCanvas = document.createElement('canvas');
        darknessCanvas.width = canvas.width;
        darknessCanvas.height = canvas.height;
        const dCtx = darknessCanvas.getContext('2d');
        if (dCtx) {
          // Fill semi-transparent dark night
          dCtx.fillStyle = 'rgba(2, 6, 23, 0.78)';
          dCtx.fillRect(0, 0, canvas.width, canvas.height);

          // Punch hole with radial gradient around player
          const playerScreenX = player.x - camX + player.width / 2;
          const playerScreenY = player.y + player.height / 2;

          dCtx.globalCompositeOperation = 'destination-out';
          const lightRadius = 160;
          const lightGrad = dCtx.createRadialGradient(
            playerScreenX,
            playerScreenY,
            20,
            playerScreenX,
            playerScreenY,
            lightRadius
          );
          lightGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
          lightGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.6)');
          lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          dCtx.fillStyle = lightGrad;
          dCtx.beginPath();
          dCtx.arc(playerScreenX, playerScreenY, lightRadius, 0, Math.PI * 2);
          dCtx.fill();

          ctx.drawImage(darknessCanvas, 0, 0);
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [dayPhase, clearedGatesCount, totalGatesCount]);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* TOP HUD BAR */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 mb-2 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-['Chakra_Petch',sans-serif] shadow-lg backdrop-blur-md">
        {/* HP & MANA */}
        <div className="flex items-center gap-4">
          {/* HP Bar */}
          <div className="flex items-center gap-2">
            <Heart className={`w-4 h-4 ${currentHp < 30 ? 'text-rose-500 animate-pulse' : 'text-rose-400'}`} />
            <div className="w-24 sm:w-32 bg-slate-950 rounded-full h-3 border border-slate-700 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  currentHp > 50 ? 'bg-emerald-500' : currentHp > 25 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${currentHp}%` }}
              ></div>
            </div>
            <span className="font-mono font-bold text-slate-200">{currentHp}</span>
          </div>

          {/* Mana Bar */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <div className="w-20 sm:w-28 bg-slate-950 rounded-full h-3 border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${currentMana}%` }}
              ></div>
            </div>
            <span className="font-mono font-bold text-cyan-300">{Math.floor(currentMana)}</span>
          </div>
        </div>

        {/* WEAPON & GATE STATUS */}
        <div className="flex items-center gap-3">
          {/* Current Weapon Badge */}
          <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 flex items-center gap-1.5 font-bold">
            <span className="text-slate-400 text-xs">VŨ KHÍ:</span>
            {currentWeapon === 'normal' && <span className="text-yellow-400">RIFLE THƯỜNG</span>}
            {currentWeapon === 'spread' && <span className="text-rose-400">💥 SÚNG S (CHÙM)</span>}
            {currentWeapon === 'laser' && <span className="text-cyan-400">⚡ SÚNG L (LASER)</span>}
          </div>

          {/* Gate progress */}
          <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-yellow-500/40 text-yellow-300 font-bold flex items-center gap-1">
            <span>CỔNG:</span>
            <span className="font-mono text-white">{clearedGatesCount} / {totalGatesCount}</span>
          </div>

          {/* Day / Night indicator */}
          <div className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-700 flex items-center gap-1">
            {dayPhase === 'day' && <span className="text-amber-400 flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> Ngày</span>}
            {dayPhase === 'sunset' && <span className="text-orange-400 flex items-center gap-1"><Sunset className="w-3.5 h-3.5" /> Hoàng hôn</span>}
            {dayPhase === 'night' && <span className="text-indigo-400 flex items-center gap-1"><Moon className="w-3.5 h-3.5" /> Đêm tối</span>}
            {dayPhase === 'dawn' && <span className="text-cyan-400 flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> Bình minh</span>}
          </div>
        </div>

        {/* SCORE & UTILITIES */}
        <div className="flex items-center gap-2">
          <div className="text-slate-300 font-mono font-bold mr-2">
            ĐIỂM: <span className="text-yellow-400">{score}</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Bật/Tắt Âm thanh"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onOpenInstruction}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 cursor-pointer"
            title="Hướng dẫn phím bấm"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onBackToMenu}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Menu
          </button>
        </div>
      </div>

      {/* SHIELD ACTIVE INDICATOR BANNER */}
      {isShieldActive && (
        <div className="absolute top-16 z-20 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 animate-pulse">
          <Shield className="w-4 h-4 text-cyan-400" />
          KHIÊN HỘ THỂ BẢO VỆ: CÒN {shieldRemainingTime}s (BẤT TỬ)
        </div>
      )}

      {/* CANVAS CONTAINER */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-black max-w-5xl w-full">
        <canvas
          ref={canvasRef}
          width={860}
          height={560}
          onClick={handleCanvasClick}
          className="w-full h-auto block cursor-crosshair object-cover"
        />

        {/* KEYBOARD SHORTCUTS HINT ON BOTTOM DESKTOP */}
        <div className="hidden sm:flex absolute bottom-2 left-4 right-4 items-center justify-between text-[11px] text-slate-400/80 font-mono pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1 rounded-full backdrop-blur-xs">
            <span>[A/D]: Chạy</span>
            <span>•</span>
            <span>[W/Space]: Nhảy</span>
            <span>•</span>
            <span>[S]: Cúi né đạn</span>
            <span>•</span>
            <span>[J/Click]: Bắn</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1 rounded-full backdrop-blur-xs">
            <span className="text-cyan-400">[K]: Khiên Mana</span>
            <span>•</span>
            <span className="text-rose-400">[B]: Mega Bom</span>
          </div>
        </div>
      </div>

      {/* VIRTUAL CONTROLS FOR TOUCH / MOBILE SCREENS */}
      <VirtualControls
        onKeyDown={handleVirtualKeyDown}
        onKeyUp={handleVirtualKeyUp}
        onTriggerSkill={triggerSkill}
        mana={currentMana}
      />

      {/* ACTIVE QUIZ GATE MODAL (Phần 4: Chướng ngại vật trắc nghiệm) */}
      {activeQuizGate && activeQuizGate.question && (
        <QuizModal
          question={activeQuizGate.question}
          gateIndex={activeQuizGate.index}
          totalGates={totalGatesCount}
          onAnswerCorrect={handleQuizAnswerCorrect}
          onAnswerWrong={handleQuizAnswerWrong}
        />
      )}

      {/* GAME OVER MODAL */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-4xl mb-2">💀</div>
            <h2 className="text-2xl sm:text-3xl font-black text-rose-500 font-['Chakra_Petch',sans-serif] tracking-wider uppercase mb-1">
              CHIẾN BINH HY SINH
            </h2>
            <p className="text-xs text-slate-400 mb-6">Bạn đã chiến đấu hết mình trên mặt trận tri thức</p>

            <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left font-mono text-xs">
              <div>
                <span className="text-slate-500">Tổng điểm:</span>
                <div className="text-lg font-bold text-yellow-400">{score}</div>
              </div>
              <div>
                <span className="text-slate-500">Kẻ địch diệt:</span>
                <div className="text-lg font-bold text-rose-400">{kills}</div>
              </div>
              <div>
                <span className="text-slate-500">Cổng đã mở:</span>
                <div className="text-lg font-bold text-cyan-400">{clearedGatesCount} / {totalGatesCount}</div>
              </div>
              <div>
                <span className="text-slate-500">Độ khó:</span>
                <div className="text-lg font-bold text-amber-300 uppercase">{difficulty}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={initLevel}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-900/40"
              >
                <RotateCcw className="w-4 h-4" /> Thử Lại Lần Nữa
              </button>

              <button
                onClick={onChangeTopic}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Đổi Chủ Đề Khác
              </button>

              <button
                onClick={onBackToMenu}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs transition cursor-pointer"
              >
                Quay về Menu chính
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY MODAL */}
      {isVictory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-5xl mb-2 animate-bounce">🏆</div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-emerald-400 font-['Chakra_Petch',sans-serif] tracking-wider uppercase mb-1">
              CHIẾN THẮNG HOÀN TOÀN!
            </h2>
            <p className="text-xs text-emerald-300 mb-6">
              Bạn đã phá hủy tất cả Cổng Phong Ấn & đánh bại toàn bộ phòng tuyến kẻ địch!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left font-mono text-xs">
              <div>
                <span className="text-slate-500">Tổng điểm tích lũy:</span>
                <div className="text-xl font-bold text-yellow-400">{score} PTS</div>
              </div>
              <div>
                <span className="text-slate-500">Quái vật tiêu diệt:</span>
                <div className="text-xl font-bold text-rose-400">{kills} lính</div>
              </div>
              <div>
                <span className="text-slate-500">Cổng giải mã:</span>
                <div className="text-xl font-bold text-emerald-400">{totalGatesCount}/{totalGatesCount} 100%</div>
              </div>
              <div>
                <span className="text-slate-500">Danh hiệu đạt:</span>
                <div className="text-sm font-bold text-cyan-300 truncate">
                  {difficulty === 'hard' ? 'CHIẾN THẦN TRI THỨC' : 'CHIẾN BINH TINH NHUỆ'}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={initLevel}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/40"
              >
                <Sparkles className="w-4 h-4" /> Tiếp Tục Chơi Màn Mới
              </button>

              <button
                onClick={onChangeTopic}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Thử Thách Chủ Đề Khác
              </button>

              <button
                onClick={onBackToMenu}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs transition cursor-pointer"
              >
                Quay về Menu chính
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
