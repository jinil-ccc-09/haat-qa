(function () {
  'use strict';

  function initOrders() {
    const host = document.getElementById('orderList');
    if (!host) return;
    const list = Orders.all();
    const empty = document.getElementById('ordersEmpty');

    if (!list.length) {
      empty.hidden = false;
      return;
    }

    host.innerHTML = list.map(o => {
      const when = new Date(o.placedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      const qty = o.items.reduce((n, i) => n + i.qty, 0);
      return `<li class="order">
        <div class="order-head">
          <div>
            <p class="order-id">${o.id}</p>
            <p class="order-when">${when} · ${o.customer.payment}</p>
          </div>
          <span class="pill">${o.status}</span>
        </div>
        <div class="order-art">${o.items.slice(0, 4).map(i => {
          const p = Catalog.find(i.id);
          return p ? Catalog.art(p, 'art art--xs') : '';
        }).join('')}</div>
        <p class="order-items">${o.items.map(i => `${Util.esc(i.name)} × ${i.qty}`).join(', ')}</p>
        <div class="order-foot"><span>${qty} item${qty === 1 ? '' : 's'}</span><b>${Util.inr(o.paid)}</b></div>
      </li>`;
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', initOrders);
})();
