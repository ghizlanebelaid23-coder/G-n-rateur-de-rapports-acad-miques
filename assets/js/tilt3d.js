
(function () {
  function initTilt() {
    const targets = document.querySelectorAll('.card, .qcard');
    const maxTilt = 4.5;

    targets.forEach((card) => {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * maxTilt * 2;
        const ry = (px - 0.5) * maxTilt * 2;
        card.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  
  function observeNewCards() {
    const stage = document.getElementById('qflow-root');
    if (!stage || !window.MutationObserver) return;
    const obs = new MutationObserver(() => initTilt());
    obs.observe(stage, { childList: true });
  }

  function initSpotlight() {
    const spot = document.createElement('div');
    spot.className = 'cursor-spotlight';
    document.body.appendChild(spot);
    let raf = null;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          spot.style.transform = `translate(${mx}px, ${my}px)`;
          raf = null;
        });
      }
    });
  }

  function init() {
    initTilt();
    observeNewCards();
    initSpotlight();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
