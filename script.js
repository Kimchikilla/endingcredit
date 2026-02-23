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

  // Keyboard shortcut: Space to play
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !startScreen.classList.contains('hidden')) {
      e.preventDefault();
      playBtn.click();
    }
  });
});
