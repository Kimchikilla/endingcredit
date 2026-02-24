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

  // Spawn timer
  let nextSpawn = 1000 + Math.random() * 2000;
  let spawnTimer = 0;

  function animateComets(dt) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn new comets
    spawnTimer += dt;
    if (spawnTimer >= nextSpawn) {
      comets.push(new Comet());
      // Occasionally spawn a second one close together
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

    // Update & draw sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      sparkles[i].update();
      sparkles[i].draw();
      if (sparkles[i].isDead()) sparkles.splice(i, 1);
    }
  }

  let lastTime = performance.now();
  function cometLoop(now) {
    const dt = now - lastTime;
    lastTime = now;
    animateComets(dt);
    requestAnimationFrame(cometLoop);
  }
  requestAnimationFrame(cometLoop);

  // Keyboard shortcut: Space to play
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !startScreen.classList.contains('hidden')) {
      e.preventDefault();
      playBtn.click();
    }
  });
});
