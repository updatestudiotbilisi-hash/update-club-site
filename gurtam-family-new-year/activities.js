const activityModal = document.querySelector('.activity-modal');
const activityPhoto = activityModal.querySelector('.activity-full-photo');
const activityTitle = activityModal.querySelector('h2');
const activityDescription = activityModal.querySelector('.activity-description');

for (const station of document.querySelectorAll('.station')) {
  const summary = station.querySelector('summary');
  const thumbnail = summary.querySelector('img');
  const title = summary.querySelector('span');
  const description = station.querySelector('.station-copy');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'station-trigger';
  button.setAttribute('aria-haspopup', 'dialog');
  button.append(thumbnail, title);
  const card = document.createElement('article');
  card.className = 'station-card';
  card.append(button);
  station.replaceWith(card);

  button.addEventListener('click', () => {
    activityPhoto.src = thumbnail.src;
    activityPhoto.alt = thumbnail.alt;
    activityTitle.textContent = title.textContent;
    activityDescription.replaceChildren(...[...description.children].map(node => node.cloneNode(true)));
    activityModal.showModal();
  });
}
activityModal.querySelector('.activity-close').addEventListener('click', () => activityModal.close());
activityModal.addEventListener('click', event => {
  if (event.target === activityModal) activityModal.close();
});

for (const button of document.querySelectorAll('.evening-details')) {
  const card = button.closest('article');
  const thumbnail = card.querySelector('img');
  const description = card.querySelector('.evening-copy');
  button.hidden = false;
  description.hidden = true;
  button.addEventListener('click', () => {
    activityPhoto.src = thumbnail.src;
    activityPhoto.alt = thumbnail.alt;
    activityTitle.textContent = card.querySelector('h3').textContent;
    activityDescription.replaceChildren(...[...description.children].map(node => node.cloneNode(true)));
    activityModal.showModal();
  });
}
