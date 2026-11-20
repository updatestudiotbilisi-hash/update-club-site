const navigation = document.querySelector('.masthead nav');
const tabs = [...navigation.querySelectorAll('[data-tab]')];
const panels = [...document.querySelectorAll('[data-panel]')];

navigation.setAttribute('role', 'tablist');
for (const tab of tabs) {
  const id = tab.hash.slice(1);
  const panel = document.getElementById(id);
  tab.id = 'tab-' + id;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', id);
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
}

function renderTab() {
  const id = location.hash.slice(1);
  const target = document.getElementById(id);
  const selected = target?.closest('[data-panel]')?.id ?? 'overview';

  for (const panel of panels) panel.hidden = panel.id !== selected;
  for (const tab of tabs) {
    const active = tab.hash === '#' + selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || !panels.some(panel => '#' + panel.id === link.hash)) return;
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  event.preventDefault();
  if (location.hash !== link.hash) history.pushState(null, '', link.hash);
  renderTab();
  window.scrollTo(0, 0);
  if (!link.hasAttribute('data-tab')) {
    const heading = document.querySelector(link.hash + ' h2, ' + link.hash + ' h1');
    heading.setAttribute('tabindex', '-1');
    heading.focus({preventScroll: true});
  }
});

navigation.addEventListener('keydown', event => {
  const index = tabs.indexOf(event.target);
  if (index < 0) return;
  const indexes = {ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: tabs.length - 1};
  if (!(event.key in indexes)) return;
  event.preventDefault();
  const next = tabs[(indexes[event.key] + tabs.length) % tabs.length];
  next.focus();
  next.click();
});

window.addEventListener('hashchange', renderTab);
window.addEventListener('popstate', renderTab);
renderTab();

for (const button of document.querySelectorAll('[data-expand]')) {
  const panel = document.getElementById(button.dataset.expand);
  const items = [...panel.querySelectorAll('details')];
  const noun = button.dataset.expand === 'program' ? 'всю программу' : 'все станции';
  function updateLabel() {
    button.textContent = (items.every(item => item.open) ? 'Свернуть ' : 'Раскрыть ') + noun;
  }
  button.addEventListener('click', () => {
    const open = items.some(item => !item.open);
    for (const item of items) item.open = open;
    updateLabel();
  });
  for (const item of items) item.addEventListener('toggle', updateLabel);
}
