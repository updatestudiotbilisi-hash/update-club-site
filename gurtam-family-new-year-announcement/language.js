const languageLink = document.querySelector('.languages a');
const languageUrl = new URL(languageLink.href);
function retainSection() {
  languageUrl.hash = location.hash;
  languageLink.href = languageUrl.href;
}
addEventListener('hashchange', retainSection);
addEventListener('popstate', retainSection);
document.addEventListener('click', retainSection);
retainSection();

for (const button of document.querySelectorAll('[data-expand="program"]')) {
  const items = [...document.querySelectorAll('#program details')];
  const english = document.documentElement.lang === 'en';
  function updateLabel() {
    const expanded = items.every(item => item.open);
    button.textContent = english
      ? (expanded ? 'Collapse full program' : 'Expand full program')
      : (expanded ? 'Свернуть всю программу' : 'Раскрыть всю программу');
  }
  button.addEventListener('click', () => {
    const open = items.some(item => !item.open);
    for (const item of items) item.open = open;
    updateLabel();
  });
  for (const item of items) item.addEventListener('toggle', updateLabel);
}
