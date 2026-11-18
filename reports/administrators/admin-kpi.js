'use strict';

const AdminKPI = (() => {
  const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
  const fmt = value => value == null ? '—' : number.format(value);
  const gel = value => value == null ? '—' : fmt(value) + ' GEL';
  const monthName = value => new Date(value + '-01T12:00:00').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const date = value => value.split('-').reverse().join('.');
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const knownNames = {
    'nina-shartava': 'Нина Шартава',
    'anastasia-saralidze': 'Анастасия Саралидзе',
    'kristina-kardava': 'Кристина Кардава',
    'svetlana-demkina': 'Светлана Демкина'
  };
  async function decrypt(url, password) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Report unavailable');
    const enc = await response.json();
    const bytes = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(enc.salt), iterations: enc.iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(enc.iv) }, key, bytes(enc.data))));
  }
  function personCard(row, management) {
    const link = management ? '<a class="kpi-cabinet" href="personal/' + escape(row.slug) + '/">Личный кабинет ↗</a>' : '';
    const breakdown = row.products.map(product =>
      '<li><span>' + escape(product.category) + '</span><strong>' + gel(product.amount) + '</strong><small>' + fmt(product.purchases) + ' оплат</small></li>').join('');
    const bonus = row.bonus ? gel(row.bonus.total) : '—';
    const detail = row.bonus ? gel(row.bonus.service) + ' за услуги + ' + gel(row.bonus.sales) + ' с продаж' : 'Учётная запись владельца';
    return '<article class="kpi-person"><header><div><h3>' + escape(row.name) + '</h3>' +
      (row.owner ? '<p>Владелец</p>' : '') + '</div>' + link + '</header>' +
      '<div class="kpi-stats">' + [
        ['Записано на этот месяц', fmt(row.booked)], ['Визиты состоялись', fmt(row.arrived)],
        ['Оплаченные услуги', fmt(row.services)], ['Оплаченные продажи', gel(row.sales)],
        ['Смены по графику', fmt(row.shifts)]
      ].map(([label,value]) => '<div><span>' + label + '</span><strong>' + value + '</strong></div>').join('') +
      '</div><ul class="kpi-products">' + breakdown + '</ul>' +
      '<div class="kpi-pay"><span>Расчётная премия</span><strong>' + bonus + '</strong><small>' + detail + '</small></div>' +
      (row.pending ? '<p class="kpi-note">Услуг на сверке оплаты: ' + fmt(row.pending) + '.</p>' : '') + '</article>';
  }
  function render(root, data, management) {
    const draw = month => {
      const entry = data.months.find(item => item.month === month) || data.months[0];
      if (!entry) return;
      const remaining = entry.next == null ? 'Достигнута высшая ступень' :
        'До ступени ' + fmt(entry.next) + ' — ещё ' + fmt(entry.next - entry.studioVisits) + ' визитов';
      const rates = data.thresholds.map((rate, index) => {
        const next = data.thresholds[index + 1];
        const band = next ? fmt(rate.from) + '–' + fmt(next.from - 1) : 'От ' + fmt(rate.from);
        return '<li' + (rate.from === entry.tier.from ? ' class="current"' : '') + '><strong>' + band + '</strong><span>' +
          (rate.from ? gel(rate.service) + ' за услугу · ' + fmt(rate.percent) + '% с продаж' : 'Только оклад') + '</span></li>';
      }).join('');
      $('kpi-detail').innerHTML =
        '<div class="kpi-progress"><div><small>Закрытые коммерческие визиты студии</small><strong>' + fmt(entry.studioVisits) + '</strong><span>' + remaining + '</span></div>' +
        '<ul aria-label="Ступени мотивации">' + rates + '</ul></div>' +
        '<p class="kpi-note">' + (entry.closed ? 'Закрытый месяц' : 'Предварительный расчёт') + ' · по ' + date(entry.through) + ' включительно.</p>' +
        '<div class="kpi-people">' + entry.people.map(person => personCard(person, management)).join('') + '</div>' +
        (management && entry.unmatched ? '<p class="kpi-note">Поступления на сверке продавца или категории: ' + gel(entry.unmatched) + '.</p>' : '') +
        '<details class="kpi-method" open><summary>Как считается премия</summary>' +
        '<p>Итог месяца определяет ставку для всего месяца. В общий порог входят состоявшиеся коммерческие визиты студии, включая онлайн. Личная премия учитывает услуги по записям, созданным под вашим аккаунтом, после посещения и полной оплаты. Две оплаченные услуги дают две выплаты.</p>' +
        '<p>Комиссия считается по оплаченным товарам, абонементам, депозитам и сертификатам у продавца, указанного в Altegio, за вычетом возвратов. Визит относится к месяцу посещения, продажа — к месяцу оплаты.</p></details>';
    };
    root.innerHTML = '<div class="kpi-heading"><div><p class="eyebrow">МОТИВАЦИЯ</p><h2>Записи, продажи и премия</h2></div>' +
      '<div><label for="kpi-month">Месяц</label><select id="kpi-month"></select></div></div><div id="kpi-detail"></div>';
    for (const entry of data.months) $('kpi-month').add(new Option(monthName(entry.month), entry.month));
    $('kpi-month').onchange = event => draw(event.target.value);
    draw(data.months[0]?.month);
  }
  if ($('personal-login')) {
    const slug = location.pathname.split('/').filter(Boolean).at(-1);
    $('personal-name').textContent = knownNames[slug] || 'Аналитика администратора';
    $('personal-login').onsubmit = async event => {
      event.preventDefault();
      const input = $('personal-password');
      const button = event.currentTarget.querySelector('button');
      button.disabled = true;
      $('personal-error').textContent = 'Проверяем пароль…';
      try {
        const data = await decrypt('data.enc.json', input.value);
        render($('motivation'), data, false);
        input.value = '';
        $('personal-error').textContent = '';
        $('lock').hidden = true;
        $('personal-report').hidden = false;
      } catch {
        $('personal-error').textContent = 'Не удалось открыть кабинет. Проверьте пароль.';
      } finally {
        button.disabled = false;
      }
    };
    $('personal-logout').onclick = () => location.reload();
  }
  return { decrypt, render };
})();
