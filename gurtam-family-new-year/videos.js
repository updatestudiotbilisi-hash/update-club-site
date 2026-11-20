const coverClip = document.querySelector('.hero-clip');
const coverButton = document.querySelector('.hero-motion');
const musicClip = document.querySelector('.music-clip');
const overviewPanel = document.getElementById('overview');
const activitiesPanel = document.getElementById('activities');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobileCover = matchMedia('(max-width: 680px)');
if (mobileCover.matches) coverClip.src = 'videos/hero-center-mobile.mp4';

let coverWanted = !reduceMotion.matches;

function syncCover() {
  if (coverWanted && !overviewPanel.hidden) {
    coverClip.play().catch(() => {});
  } else {
    coverClip.pause();
  }
}
function updateCoverButton() {
  const label = coverClip.paused ? 'Воспроизвести видео' : 'Пауза';
  coverButton.textContent = label;
  coverButton.setAttribute('aria-label', label + ' на обложке');
}
coverButton.addEventListener('click', () => {
  coverWanted = coverClip.paused;
  syncCover();
});
coverClip.addEventListener('play', updateCoverButton);
coverClip.addEventListener('pause', updateCoverButton);

const panelObserver = new MutationObserver(() => {
  syncCover();
  if (activitiesPanel.hidden) musicClip.pause();
});
panelObserver.observe(overviewPanel, {attributeFilter: ['hidden']});
panelObserver.observe(activitiesPanel, {attributeFilter: ['hidden']});
reduceMotion.addEventListener('change', event => {
  coverWanted = !event.matches;
  syncCover();
});
syncCover();

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
