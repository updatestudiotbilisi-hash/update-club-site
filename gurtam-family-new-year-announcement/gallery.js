const dialog = document.querySelector('dialog');
const photos = [...document.querySelectorAll('.venue-media figure a')];
const preview = dialog.querySelector('img');
let current = 0;

function show(index) {
  current = (index + photos.length) % photos.length;
  const link = photos[current];
  preview.src = link.href;
  preview.alt = link.querySelector('img').alt;
}
photos.forEach((link, index) => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    show(index);
    dialog.showModal();
  });
});
dialog.querySelector('.close').onclick = () => dialog.close();
dialog.querySelector('.prev').onclick = () => show(current - 1);
dialog.querySelector('.next').onclick = () => show(current + 1);
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') show(current - 1);
  if (event.key === 'ArrowRight') show(current + 1);
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
