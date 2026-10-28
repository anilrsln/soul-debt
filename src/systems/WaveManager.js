import { CONFIG } from '../config.js';
import GameState from '../state/GameState.js';
import Enemy from '../entities/Enemy.js';

/** WaveManager — Düşman dalgalarını yönetir. */
export default class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.spawnTimer = 0;
    this.waveBreakTimer = 0;
    this.isWaveBreak = false;
    this.isFloorBreak = false; // kat-arası tam-duraklama (K28)
    this.isDeployPhase = false; // floor başı dizme fazı (K38): ekip barda, oyuncu dizer, "BAŞLA" der

    // K27: lane YOK — düşmanlar savaş alanının rastgele Y'sinde doğar (serbest akış).
    this._spawnBandTop = CONFIG.CORRIDOR_TOP + 20;
    this._spawnBandBottom = CONFIG.CORRIDOR_BOTTOM - 20;
    this.calculateWaveEnemies();
  }

  /** Bu wave bir boss dalgası mı? (her CONFIG.WAVES.bossEvery katında) */
  isBossWave(wave = GameState.wave.current) {
    const every = CONFIG.WAVES.bossEvery || 0;
    return every > 0 && wave % every === 0;
  }

  calculateWaveEnemies() {
    const wave = GameState.wave.current;
    GameState.wave.enemiesInWave = this.isBossWave(wave)
      ? 1 // boss dalgasında tek büyük düşman
      : Math.floor(CONFIG.WAVES.baseEnemiesPerWave + (wave - 1) * CONFIG.WAVES.enemiesPerWaveGrowth);
    GameState.wave.enemiesSpawned = 0;
    GameState.wave.enemiesKilled = 0;
  }

  getAvailableEnemyTypes() {
    const wave = GameState.wave.current;
    return Object.entries(CONFIG.WAVES.typeUnlocks)
      .filter(([, unlockWave]) => wave >= unlockWave)
      .map(([type]) => type);
  }

  selectEnemyType() {
    const available = this.getAvailableEnemyTypes();
    const weights = { ghoul: 40, gargoyle: 20, imp: 20, soulVessel: 15, cursedKnight: 5, warden: 10, ooze: 10, cultist: 8 };
    let total = 0;
    const list = available.map(type => {
      const w = weights[type] || 10;
      total += w;
      return { type, weight: w };
    });
    let roll = Math.random() * total;
    for (const entry of list) { roll -= entry.weight; if (roll <= 0) return entry.type; }
    return available[0];
  }

  /** Boss rotasyonuna göre bu wave'deki boss tipini döndürür. */
  getBossType(wave) {
    const rotation = CONFIG.BOSS_ROTATION;
    if (!rotation || rotation.length === 0) return 'boss_tank';
    const every = CONFIG.WAVES.bossEvery || 10;
    const idx = Math.floor(wave / every) - 1; // wave=10→0, wave=20→1, ...
    return rotation[idx % rotation.length];
  }

  /** Bu wave tanrı wave'i mi? (godFloor'un son dalgası — oyunun finali, K26) */
  isGodWave() {
    const P = CONFIG.PRESTIGE;
    return GameState.wave.current === P.godFloor * P.wavesPerFloor;
  }

  spawnEnemy() {
    const bossY = (this._spawnBandTop + this._spawnBandBottom) / 2;
    // TANRI dalgası (Kat N finali): tek, çok güçlü boss — yenince ZAFER (K26)
    if (this.isGodWave()) {
      const god = this.scene.enemyPool.acquire(this.scene, CONFIG.PRESTIGE.godBossType, GameState.wave.current, bossY, { boss: true, god: true });
      // tanrıyı normal boss'tan güçlendir
      god.maxHP = Math.floor(god.maxHP * CONFIG.PRESTIGE.godHpMultiplier);
      god.currentHP = god.maxHP;
      god.isGod = true;
      this.enemies.push(god);
      GameState.wave.enemiesSpawned++;
      this.scene.events.emit('god-wave', { wave: GameState.wave.current });
      return;
    }
    // Normal boss dalgası
    if (this.isBossWave()) {
      const bossType = this.getBossType(GameState.wave.current);
      const boss = this.scene.enemyPool.acquire(this.scene, bossType, GameState.wave.current, bossY, { boss: true });
      this.enemies.push(boss);
      GameState.wave.enemiesSpawned++;
      this.scene.events.emit('boss-wave', { wave: GameState.wave.current, bossType });
      return;
    }
    const type = this.selectEnemyType();
    const laneY = this._spawnBandTop + Math.random() * (this._spawnBandBottom - this._spawnBandTop);
    const enemy = this.scene.enemyPool.acquire(this.scene, type, GameState.wave.current, laneY);
    this.enemies.push(enemy);
    GameState.wave.enemiesSpawned++;
  }

  /** Splitter ölünce küçük çocukları öldüğü yerde spawn eder. */
  spawnChildren(data) {
    const corridorTop = CONFIG.CORRIDOR_TOP;
    const corridorBottom = CONFIG.CORRIDOR_BOTTOM;
    const n = data.count || 2;
    for (let i = 0; i < n; i++) {
      const spread = i - (n - 1) / 2;
      const childY = Math.max(corridorTop, Math.min(corridorBottom, data.y + spread * 18));
      const child = this.scene.enemyPool.acquire(this.scene, 'ooze', data.wave, childY, {
        hpFactor: data.hpFactor, rewardFactor: data.rewardFactor, scale: data.scale,
        noSplit: true, child: true, spawnX: data.x + spread * 6,
      });
      this.enemies.push(child);
    }
  }

  /** Tamamlanan wave bir KAT sonu mu? (wavesPerFloor'un katı). Kat sonunda tam-duraklama fazı. */
  isFloorEnd(completedWave) {
    const per = CONFIG.PRESTIGE?.wavesPerFloor || 10;
    return completedWave > 0 && completedWave % per === 0;
  }

  completeWave() {
    const completedWave = GameState.wave.current;
    GameState.stats.totalWavesCompleted++;
    GameState.wave.current++;
    this.scene.events.emit('wave-complete', {
      completedWave,
      nextWave: GameState.wave.current,
    });
    this.scene.game.events.emit('sfx', 'waveComplete');
    this.calculateWaveEnemies();

    // Kat sonu (boss sonrası) → TAM-DURAKLAMA kurulum fazı (K28 revize): savaş durur, oyuncu
    // sakin kafayla dizer/örer/absorbe eder/ölüleri gözden geçirir, hazır olunca "İn" der.
    // god wave'in sonu hariç (orada zafer/prestige akışı devreye girer — K26).
    if (this.isFloorEnd(completedWave) && !this.isGodWave()) {
      this.isFloorBreak = true;
      this.scene.events.emit('floor-break', { completedFloor: completedWave / (CONFIG.PRESTIGE?.wavesPerFloor || 10) });
    } else {
      // Normal wave arası: kısa otomatik ara (eskisi gibi)
      this.isWaveBreak = true;
      this.waveBreakTimer = CONFIG.WAVES.timeBetweenWaves;
    }
  }

  /** Oyuncu "İn" dedi — kat-arası duraklamayı bitir, dizme fazına geç (K38). */
  resumeFromFloorBreak() {
    if (!this.isFloorBreak) return;
    this.isFloorBreak = false;
    this.spawnTimer = 0;
    this.scene.events.emit('floor-resumed', { wave: GameState.wave.current });
    // İniş kartından sonra dizme fazını başlat (yeni floor'un ilk wave'i öncesi)
    this.startDeployPhase();
  }

  /** Floor başı dizme fazını başlat (K38): savaş durur, ekip bara toplanır, oyuncu dizer. */
  startDeployPhase() {
    this.isDeployPhase = true;
    this.scene.events.emit('deploy-phase-start', { wave: GameState.wave.current });
  }

  /** Oyuncu "BAŞLA" dedi — dizme fazını bitir, wave başlasın (K38). */
  endDeployPhase() {
    if (!this.isDeployPhase) return;
    this.isDeployPhase = false;
    this.spawnTimer = 0;
    this.scene.events.emit('deploy-phase-end', { wave: GameState.wave.current });
  }

  update(delta) {
    const deltaMs = delta * 1000;
    // Kat-arası tam-duraklama: spawn YOK, oyuncu "İn" deyene kadar bekler (K28). Kalan düşman
    // normalde olmaz (kat boss ölünce biter) ama güvenlik için kalanları güncelle.
    if (this.isFloorBreak) {
      this.updateEnemies(delta);
      return;
    }
    // Dizme fazı (K38): spawn YOK, oyuncu "BAŞLA" diyene kadar bekler. Savaş alanında düşman olmaz.
    if (this.isDeployPhase) {
      this.updateEnemies(delta);
      return;
    }
    if (this.isWaveBreak) {
      this.waveBreakTimer -= deltaMs;
      if (this.waveBreakTimer <= 0) { this.isWaveBreak = false; this.spawnTimer = 0; }
      this.updateEnemies(delta);
      return;
    }
    this.spawnTimer -= deltaMs;
    if (this.spawnTimer <= 0 && GameState.wave.enemiesSpawned < GameState.wave.enemiesInWave) {
      this.spawnEnemy();
      this.spawnTimer = CONFIG.WAVES.timeBetweenSpawns;
    }
    this.updateEnemies(delta);
    if (GameState.wave.enemiesSpawned >= GameState.wave.enemiesInWave && this.enemies.length === 0) {
      this.completeWave();
    }
  }

  updateEnemies(delta) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(delta, this.enemies);
      if (!e.alive && !e.dying) { this.enemies.splice(i, 1); this.scene.enemyPool.release(e); }
    }
  }

  clearAll() {
    this.enemies.forEach(e => this.scene.enemyPool.release(e));
    this.enemies = [];
    this.spawnTimer = 0;
    this.waveBreakTimer = 0;
    this.isWaveBreak = false;
    this.isFloorBreak = false;
  }
}
