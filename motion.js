'use strict';
(() => {
  const hero = document.querySelector('.hero-art');
  const categories = document.querySelector('#categories');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const allowed = () => finePointer.matches && !reduced.matches && !document.documentElement.classList.contains('motion-paused');
  let pending = 0, activeCard = null, latest = null;
  function resetCard(card) {
    if (!card) return;
    ['--rx', '--ry', '--px', '--py'].forEach(p => card.style.removeProperty(p));
  }
  function reset() {
    cancelAnimationFrame(pending); pending = 0; latest = null;
    hero.style.removeProperty('--scene-x'); hero.style.removeProperty('--scene-y');
    resetCard(activeCard); activeCard = null;
  }
  function queue(kind, target, event) {
    if (!allowed() || event.pointerType === 'touch') return;
    latest = {kind, target, x: event.clientX, y: event.clientY};
    if (pending) return;
    pending = requestAnimationFrame(() => {
      pending = 0;
      if (!allowed() || !latest || !latest.target.isConnected) return;
      const {kind, target, x, y} = latest;
      const box = target.getBoundingClientRect();
      const nx = Math.max(0, Math.min(1, (x - box.left) / box.width));
      const ny = Math.max(0, Math.min(1, (y - box.top) / box.height));
      if (kind === 'hero') {
        hero.style.setProperty('--scene-x', `${(0.5 - ny) * 8}deg`);
        hero.style.setProperty('--scene-y', `${(nx - 0.5) * 10}deg`);
      } else {
        if (activeCard !== target) resetCard(activeCard);
        activeCard = target;
        target.style.setProperty('--px', `${nx * 100}%`);
        target.style.setProperty('--py', `${ny * 100}%`);
        target.style.setProperty('--rx', `${(0.5 - ny) * 6}deg`);
        target.style.setProperty('--ry', `${(nx - 0.5) * 6}deg`);
      }
    });
  }
  hero.addEventListener('pointermove', e => queue('hero', hero, e), {passive:true});
  hero.addEventListener('pointerleave', reset);
  categories.addEventListener('pointermove', e => {
    const card = e.target.closest('.category');
    if (card) queue('card', card, e); else reset();
  }, {passive:true});
  categories.addEventListener('pointerleave', reset);
  categories.addEventListener('click', reset);
  document.querySelector('#motion-toggle').addEventListener('click', reset);
  reduced.addEventListener('change', reset);
  finePointer.addEventListener('change', reset);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(items => {
      hero.classList.toggle('motion-offscreen', !items[0].isIntersecting);
    }, {threshold:0}).observe(hero);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
    hero.classList.toggle('motion-tab-hidden', document.hidden);
  });
})();
