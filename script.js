document.addEventListener('DOMContentLoaded', () => {
  const startScreen = document.getElementById('start-screen');
  const playBtn = document.getElementById('play-btn');
  const credits = document.getElementById('credits');

  // Generate stars
  createStars();

  // Play button
  playBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');

    // Calculate end position based on credits height
    setTimeout(() => {
      const creditsHeight = credits.scrollHeight;
      const viewportHeight = window.innerHeight;
      credits.style.setProperty('--end-position', `-${creditsHeight}px`);
      credits.classList.add('rolling');
    }, 1500);
  });

  // Create star particles
  function createStars() {
    const starLayers = [
      { el: document.getElementById('stars'), count: 80, sizeRange: [1, 2] },
      { el: document.getElementById('stars2'), count: 40, sizeRange: [2, 3] },
      { el: document.getElementById('stars3'), count: 20, sizeRange: [2, 4] },
    ];

    starLayers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const star = document.createElement('div');
        const size = layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]);
        star.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background: #fff;
          border-radius: 50%;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          opacity: ${0.2 + Math.random() * 0.8};
        `;
        layer.el.appendChild(star);
      }
    });
  }

  // ===== Canvas Comet System =====
  const canvas = document.getElementById('comet-canvas');
  const ctx = canvas.getContext('2d');
  const comets = [];
  const sparkles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Comet {
    constructor() {
      // Start from random position along top or right edge
      if (Math.random() < 0.7) {
        this.x = Math.random() * canvas.width;
        this.y = -10;
      } else {
        this.x = canvas.width + 10;
        this.y = Math.random() * canvas.height * 0.4;
      }

      // Direction: falling diagonally (slight variation)
      const angle = (215 + Math.random() * 40) * (Math.PI / 180);
      const speed = 6 + Math.random() * 8;
      this.vx = Math.cos(angle) * speed;
      this.vy = -Math.sin(angle) * speed;

      this.life = 1.0;
      this.decay = 0.003 + Math.random() * 0.004;
      this.size = 2 + Math.random() * 2;
      this.tailLength = 25 + Math.floor(Math.random() * 35);

      // Trail history
      this.trail = [];

      // Gold-white color mix
      const gold = Math.random();
      this.r = Math.round(255 - gold * 43);
      this.g = Math.round(255 - gold * 80);
      this.b = Math.round(255 - gold * 200);
    }

    update() {
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > this.tailLength) this.trail.pop();

      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;

      // Emit sparkles
      if (Math.random() < 0.4 && this.life > 0.2) {
        sparkles.push(new Sparkle(this.x, this.y, this.r, this.g, this.b));
      }
    }

    draw() {
      if (this.life <= 0) return;

      // Draw tail with gradient
      for (let i = 1; i < this.trail.length; i++) {
        const t = 1 - i / this.trail.length;
        const alpha = t * t * this.life * 0.8;
        const width = this.size * t;

        ctx.beginPath();
        ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
        ctx.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Outer glow
      const glowSize = this.size * 8 * this.life;
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
      glow.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, ${0.3 * this.life})`);
      glow.addColorStop(0.4, `rgba(${this.r}, ${this.g}, ${this.b}, ${0.1 * this.life})`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Bright core
      const coreSize = this.size * this.life;
      const core = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, coreSize * 2);
      core.addColorStop(0, `rgba(255, 255, 255, ${this.life})`);
      core.addColorStop(0.5, `rgba(${this.r}, ${this.g}, ${this.b}, ${this.life * 0.8})`);
      core.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, coreSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();
    }

    isDead() {
      return this.life <= 0;
    }
  }

  class Sparkle {
    constructor(x, y, r, g, b) {
      this.x = x + (Math.random() - 0.5) * 6;
      this.y = y + (Math.random() - 0.5) * 6;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
      this.life = 0.6 + Math.random() * 0.4;
      this.decay = 0.015 + Math.random() * 0.025;
      this.size = 0.5 + Math.random() * 1.5;
      this.r = r;
      this.g = g;
      this.b = b;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.life -= this.decay;
    }

    draw() {
      if (this.life <= 0) return;
      const alpha = this.life * this.life;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
      ctx.fill();
    }

    isDead() {
      return this.life <= 0;
    }
  }

  // ===== Firework System =====
  const fireworkRockets = [];
  const fireworkParticles = [];

  const FIREWORK_COLORS = [
    [255, 215, 0],    // gold
    [255, 100, 100],  // red
    [100, 200, 255],  // sky blue
    [255, 150, 50],   // orange
    [200, 130, 255],  // purple
    [100, 255, 180],  // mint
    [255, 200, 150],  // peach
    [255, 255, 255],  // white
  ];

  class FireworkRocket {
    constructor(targetX, targetY) {
      this.x = targetX + (Math.random() - 0.5) * 60;
      this.y = canvas.height + 10;
      this.targetX = targetX;
      this.targetY = targetY;
      this.speed = 4 + Math.random() * 3;
      this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.trail = [];
      this.alive = true;
      this.color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
    }

    update() {
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > 12) this.trail.pop();

      this.x += this.vx;
      this.y += this.vy;

      // Check if reached target
      const dist = Math.hypot(this.x - this.targetX, this.y - this.targetY);
      if (dist < this.speed * 2) {
        this.explode();
        this.alive = false;
      }
    }

    draw() {
      // Rocket trail
      for (let i = 0; i < this.trail.length; i++) {
        const t = 1 - i / this.trail.length;
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, 1.5 * t, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${t * 0.6})`;
        ctx.fill();
      }

      // Rocket head glow
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 6);
      g.addColorStop(0, `rgba(255, 255, 255, 0.9)`);
      g.addColorStop(0.5, `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 0.4)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    explode() {
      const particleCount = 60 + Math.floor(Math.random() * 50);
      const baseColor = this.color;
      const type = Math.random();

      for (let i = 0; i < particleCount; i++) {
        let angle, speed, color;

        if (type < 0.3) {
          // Ring burst
          angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
          speed = 3 + Math.random() * 2;
          color = baseColor;
        } else if (type < 0.6) {
          // Multi-color scatter
          angle = Math.random() * Math.PI * 2;
          speed = 1 + Math.random() * 5;
          color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
        } else {
          // Classic sphere
          angle = Math.random() * Math.PI * 2;
          speed = 1 + Math.random() * 4.5;
          color = baseColor;
        }

        fireworkParticles.push(new FireworkParticle(
          this.x, this.y, angle, speed, color
        ));
      }

      // Inner sparkle burst
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        fireworkParticles.push(new FireworkParticle(
          this.x, this.y, angle, speed, [255, 255, 255], true
        ));
      }
    }

    isDead() { return !this.alive; }
  }

  class FireworkParticle {
    constructor(x, y, angle, speed, color, isSpark = false) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.gravity = 0.03 + Math.random() * 0.02;
      this.friction = isSpark ? 0.96 : 0.975;
      this.life = isSpark ? 0.6 : (0.8 + Math.random() * 0.5);
      this.decay = isSpark ? 0.02 : (0.006 + Math.random() * 0.008);
      this.r = color[0];
      this.g = color[1];
      this.b = color[2];
      this.size = isSpark ? (0.5 + Math.random()) : (1.5 + Math.random() * 2);
      this.isSpark = isSpark;
      this.trail = [];
    }

    update() {
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > (this.isSpark ? 4 : 8)) this.trail.pop();

      this.vy += this.gravity;
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;

      // Twinkle effect near end of life
      if (this.life < 0.3 && Math.random() < 0.1) {
        this.life -= 0.05;
      }
    }

    draw() {
      if (this.life <= 0) return;
      const alpha = this.life * this.life;

      // Particle trail
      if (!this.isSpark) {
        for (let i = 1; i < this.trail.length; i++) {
          const t = 1 - i / this.trail.length;
          ctx.beginPath();
          ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
          ctx.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${t * alpha * 0.4})`;
          ctx.lineWidth = this.size * t * this.life;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // Glow
      const glowR = this.size * 3 * this.life;
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR);
      glow.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha * 0.6})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
      ctx.fill();
    }

    isDead() { return this.life <= 0; }
  }

  function launchFirework() {
    const x = canvas.width * (0.15 + Math.random() * 0.7);
    const y = canvas.height * (0.1 + Math.random() * 0.35);
    fireworkRockets.push(new FireworkRocket(x, y));
  }

  function launchFireworkBarrage() {
    // Initial burst: 5 fireworks rapid-fire
    for (let i = 0; i < 5; i++) {
      setTimeout(() => launchFirework(), i * 300);
    }
    // Sustained barrage: keep firing for ~8 seconds
    let count = 0;
    const barrage = setInterval(() => {
      launchFirework();
      if (Math.random() < 0.4) launchFirework(); // double shot sometimes
      count++;
      if (count > 15) clearInterval(barrage);
    }, 500);
  }

  // ===== Thanks Section Detection =====
  let fireworkTriggered = false;
  const thanksSection = document.querySelector('.thanks');

  function checkThanksVisible() {
    if (fireworkTriggered || !thanksSection) return;
    const rect = thanksSection.getBoundingClientRect();
    // Trigger when thanks section enters the bottom half of screen
    if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
      fireworkTriggered = true;
      launchFireworkBarrage();
    }
  }

  // ===== Main Animation Loop =====
  let nextSpawn = 1000 + Math.random() * 2000;
  let spawnTimer = 0;

  function animateAll(dt) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check thanks section visibility
    checkThanksVisible();

    // Spawn comets
    spawnTimer += dt;
    if (spawnTimer >= nextSpawn) {
      comets.push(new Comet());
      if (Math.random() < 0.2) {
        setTimeout(() => comets.push(new Comet()), 100 + Math.random() * 300);
      }
      spawnTimer = 0;
      nextSpawn = 3000 + Math.random() * 5000;
    }

    // Update & draw comets
    for (let i = comets.length - 1; i >= 0; i--) {
      comets[i].update();
      comets[i].draw();
      if (comets[i].isDead()) comets.splice(i, 1);
    }

    // Update & draw comet sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      sparkles[i].update();
      sparkles[i].draw();
      if (sparkles[i].isDead()) sparkles.splice(i, 1);
    }

    // Update & draw firework rockets
    for (let i = fireworkRockets.length - 1; i >= 0; i--) {
      fireworkRockets[i].update();
      fireworkRockets[i].draw();
      if (fireworkRockets[i].isDead()) fireworkRockets.splice(i, 1);
    }

    // Update & draw firework particles
    for (let i = fireworkParticles.length - 1; i >= 0; i--) {
      fireworkParticles[i].update();
      fireworkParticles[i].draw();
      if (fireworkParticles[i].isDead()) fireworkParticles.splice(i, 1);
    }
  }

  let lastTime = performance.now();
  function mainLoop(now) {
    const dt = now - lastTime;
    lastTime = now;
    animateAll(dt);
    requestAnimationFrame(mainLoop);
  }
  requestAnimationFrame(mainLoop);

  // Keyboard shortcut: Space to play
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !startScreen.classList.contains('hidden')) {
      e.preventDefault();
      playBtn.click();
    }
  });
});
