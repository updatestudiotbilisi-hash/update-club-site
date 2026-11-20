const eveningCards = document.getElementById('evening-cards');
const eveningControls = document.querySelector('.evening-controls');
const eveningPrevious = eveningControls.querySelector('.evening-prev');
const eveningNext = eveningControls.querySelector('.evening-next');
const eveningItems = [...eveningCards.children];

function updateEveningControls() {
  eveningPrevious.disabled = eveningCards.scrollLeft <= 1;
  eveningNext.disabled = eveningCards.scrollLeft + eveningCards.clientWidth >= eveningCards.scrollWidth - 1;
}

function stepEvening(direction) {
  const stride = eveningItems[1].offsetLeft - eveningItems[0].offsetLeft;
  const index = Math.round(eveningCards.scrollLeft / stride);
  eveningCards.scrollTo({
    left: (index + direction) * stride,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  });
}

eveningControls.hidden = false;
eveningPrevious.addEventListener('click', () => stepEvening(-1));
eveningNext.addEventListener('click', () => stepEvening(1));
eveningCards.addEventListener('scroll', updateEveningControls, {passive: true});
new ResizeObserver(updateEveningControls).observe(eveningCards);
updateEveningControls();
