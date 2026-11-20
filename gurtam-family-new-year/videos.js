const coverClip = document.querySelector('.hero-clip');
const musicClip = document.querySelector('.music-clip');
const overviewPanel = document.getElementById('overview');
const activitiesPanel = document.getElementById('activities');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const isCompact = matchMedia('(max-width: 680px)').matches;

function syncCover() {
  if (reduceMotion.matches || overviewPanel.hidden) {
    coverClip.pause();
    return;
  }
  if (!coverClip.hasAttribute('src')) {
    coverClip.src = isCompact ? 'videos/hero-center-mobile.mp4' : 'videos/hero-center.mp4?v=2';
  }
  coverClip.play().catch(() => {});
}

const panelObserver = new MutationObserver(() => {
  syncCover();
  if (activitiesPanel.hidden) musicClip.pause();
});
panelObserver.observe(overviewPanel, {attributeFilter: ['hidden']});
panelObserver.observe(activitiesPanel, {attributeFilter: ['hidden']});
reduceMotion.addEventListener('change', syncCover);
requestAnimationFrame(() => requestAnimationFrame(syncCover));

let musicStarted = false;
const musicObserver = new IntersectionObserver(entries => {
  if (!entries.some(entry => entry.intersectionRatio >= 0.25) || activitiesPanel.hidden || reduceMotion.matches) {
    musicClip.pause();
    musicStarted = false;
    return;
  }
  if (musicStarted) return;
  musicStarted = true;
  musicClip.play().catch(() => {
    musicStarted = false;
  });
}, {threshold: 0.25});

musicClip.addEventListener('play', () => {
  musicStarted = true;
});
musicObserver.observe(musicClip);
new MutationObserver(() => {
  if (activitiesPanel.hidden) musicStarted = false;
}).observe(activitiesPanel, {attributeFilter: ['hidden']});

const eveningSection = document.querySelector('.evening');
const eveningReveal = new IntersectionObserver(entries => {
  if (!entries.some(entry => entry.isIntersecting)) return;
  eveningSection.classList.add('evening-revealed');
  eveningReveal.disconnect();
}, {threshold: 0.12});
eveningReveal.observe(eveningSection);
