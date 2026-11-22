const cover = document.querySelector('.hero-clip');
const assetBase = document.currentScript.src;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 680px)').matches;

const coverObserver = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting || reducedMotion.matches) {
    cover.pause();
    return;
  }
  if (!cover.hasAttribute('src')) {
    cover.src = new URL(compact ? 'videos/hero-center-mobile.mp4' : 'videos/hero-center.mp4?v=2', assetBase).href;
  }
  cover.play().catch(() => {});
});
coverObserver.observe(cover);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) cover.pause();
  else {
    coverObserver.unobserve(cover);
    coverObserver.observe(cover);
  }
});
