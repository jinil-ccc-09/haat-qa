(function (global) {
  'use strict';

  const CATALOG = [
    { id: 'HT101', name: 'Brass Diya Lamp (Pair)', category: 'Home Decor', price: 450, discount: 10, stock: 20, rating: 4.6, reviews: 214, region: 'Moradabad, Uttar Pradesh',
      blurb: 'Hand-cast brass diyas with a lotus base. Polished by hand, they glow warm long after the wick is out.', art: { petals: 8, ink: '#b5382a', bg: '#f6e3c8' } },
    { id: 'HT102', name: 'Madhubani Wall Art', category: 'Art', price: 1200, discount: 0, stock: 6, rating: 4.8, reviews: 96, region: 'Madhubani, Bihar',
      blurb: 'Natural-pigment painting on handmade paper, showing the fish of plenty. Framed in teak.', art: { petals: 12, ink: '#2f6b4f', bg: '#f3e6cf' } },
    { id: 'HT103', name: 'Kanjeevaram Silk Stole', category: 'Textiles', price: 2400, discount: 15, offerPrice: 2040, festive: true, stock: 4, rating: 4.7, reviews: 58, region: 'Kanchipuram, Tamil Nadu',
      blurb: 'Pure mulberry silk with a gold zari border, woven on a pit loom over nine days.', art: { petals: 16, ink: '#7a1f3d', bg: '#f7dfe0' } },
    { id: 'HT104', name: 'Terracotta Planter Set', category: 'Home Decor', price: 850, discount: 20, stock: 0, rating: 4.3, reviews: 131, region: 'Bankura, West Bengal',
      blurb: 'Three wheel-thrown planters with drainage holes, sun-dried and kiln-fired.', art: { petals: 6, ink: '#a4502b', bg: '#f4dcc6' } },
    { id: 'HT105', name: 'Channapatna Toy Train', category: 'Toys', price: 560, discount: 40, stock: 12, rating: 4.5, reviews: 309, region: 'Channapatna, Karnataka',
      blurb: 'Ivory-wood train finished in lac colours that are safe for little hands.', art: { petals: 5, ink: '#d08a12', bg: '#fbeccb' } },
    { id: 'HT106', name: 'Blue Pottery Mug', category: 'Kitchen', price: 380, discount: 0, stock: 25, rating: 4.2, reviews: 402, region: 'Jaipur, Rajasthan',
      blurb: 'Quartz-clay mug hand-painted in cobalt and turquoise. Holds 300 ml of chai.', art: { petals: 10, ink: '#1f5a9e', bg: '#e1ecf6' } },
    { id: 'HT107', name: 'Pattachitra Scroll', category: 'Art', price: 3200, discount: 30, stock: 3, rating: 4.9, reviews: 41, region: 'Raghurajpur, Odisha',
      blurb: 'A cloth scroll painted with a single-hair brush and natural colours, telling a story from the Jagannath tradition.', art: { petals: 14, ink: '#8c2d19', bg: '#f5e1c0' } },
    { id: 'HT108', name: 'Dhokra Brass Elephant', category: 'Home Decor', price: 1850, discount: 12, stock: 7, rating: 4.6, reviews: 77, region: 'Bastar, Chhattisgarh',
      blurb: 'Lost-wax cast elephant, an art form more than 4,000 years old. Each one is different.', art: { petals: 9, ink: '#6b4a12', bg: '#efe2c4' } },
    { id: 'HT109', name: 'Handloom Cotton Dhurrie', category: 'Textiles', price: 1499, discount: 20, offerPrice: 1199.2, festive: true, stock: 10, rating: 4.4, reviews: 88, region: 'Panipat, Haryana',
      blurb: 'Flat-woven 4 x 6 ft cotton rug in indigo and madder stripes. Reversible.', art: { petals: 7, ink: '#1d2b53', bg: '#e4e2ef' } },
    { id: 'HT110', name: 'Bamboo Serving Tray', category: 'Kitchen', price: 640, discount: 5, stock: 15, rating: 4.1, reviews: 150, region: 'Barpeta, Assam',
      blurb: 'Split-bamboo weave on a light frame, sealed with food-safe lacquer.', art: { petals: 11, ink: '#4f6b1f', bg: '#eaf0d6' } },
    { id: 'HT111', name: 'Ajrakh Table Runner', category: 'Textiles', price: 749, discount: 15, stock: 9, rating: 4.5, reviews: 63, region: 'Kutch, Gujarat',
      blurb: 'Printed in 16 steps with carved wooden blocks and natural indigo. 14 x 72 in.', art: { petals: 13, ink: '#7a2a2a', bg: '#f1dcd4' } },
    { id: 'HT112', name: 'Kondapalli Toy Set', category: 'Toys', price: 999, discount: 10, stock: 5, rating: 4.3, reviews: 45, region: 'Kondapalli, Andhra Pradesh',
      blurb: 'Five village figures carved from light tella poniki wood and painted by hand.', art: { petals: 6, ink: '#c0392b', bg: '#fbe3d6' } },
    { id: 'HT113', name: 'Copper Water Bottle', category: 'Kitchen', price: 1150, discount: 15, stock: 18, rating: 4.3, reviews: 520, region: 'Tamra Nagri, Maharashtra',
      blurb: 'Seamless pure-copper bottle with a hammered finish. Holds 1 litre.', art: { petals: 8, ink: '#a35a1f', bg: '#f6e0cc' } },
    { id: 'HT114', name: 'Warli Painted Coasters', category: 'Art', price: 250, discount: 0, stock: 30, rating: 4.0, reviews: 233, region: 'Dahanu, Maharashtra',
      blurb: 'Set of four mango-wood coasters with Warli harvest-dance motifs.', art: { petals: 4, ink: '#3b2a20', bg: '#efe6da' } }
  ];

  const CATEGORIES = ['All', 'Art', 'Home Decor', 'Kitchen', 'Textiles', 'Toys'];
  const STOCK_KEY = 'haat.stock';

  const Catalog = {
    all: CATALOG,
    categories: CATEGORIES,

    find(id) { return CATALOG.find(p => p.id === id); },

    sellPrice(p) {
      return p.offerPrice !== undefined ? p.offerPrice : Util.round2(p.price * (100 - p.discount) / 100);
    },

    stockOf(id) {
      const overrides = Store.get(STOCK_KEY, {});
      const p = Catalog.find(id);
      return Object.prototype.hasOwnProperty.call(overrides, id) ? overrides[id] : (p ? p.stock : 0);
    },

    reduceStock(ids) {
      const overrides = Store.get(STOCK_KEY, {});
      ids.forEach(id => {
        overrides[id] = Math.max(0, Catalog.stockOf(id) - 1);
        Store.set(STOCK_KEY, overrides);
      });
    },

    art(p, cls) {
      const n = p.art.petals;
      const petals = [];
      for (let i = 0; i < n; i++) {
        const a = (360 / n) * i;
        petals.push(`<ellipse cx="60" cy="30" rx="${Math.max(5, 34 / n + 3)}" ry="17" transform="rotate(${a} 60 60)"/>`);
      }
      const dots = [];
      for (let i = 0; i < n * 2; i++) {
        const a = (Math.PI * 2 / (n * 2)) * i;
        dots.push(`<circle cx="${(60 + Math.cos(a) * 50).toFixed(1)}" cy="${(60 + Math.sin(a) * 50).toFixed(1)}" r="2.2"/>`);
      }
      return `<svg class="${cls || 'art'}" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${Util.esc(p.name)} illustration">
        <rect width="120" height="120" fill="${p.art.bg}"/>
        <g fill="${p.art.ink}" opacity="0.18">${dots.join('')}</g>
        <g fill="${p.art.ink}" opacity="0.85">${petals.join('')}</g>
        <circle cx="60" cy="60" r="16" fill="${p.art.bg}" stroke="${p.art.ink}" stroke-width="2"/>
        <circle cx="60" cy="60" r="7" fill="#e3a72f"/>
      </svg>`;
    }
  };

  function stars(r) {
    const full = Math.round(r);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  function stockLabel(n) {
    if (n <= 0) return '<span class="stock stock--out">Out of stock</span>';
    if (n <= 5) return `<span class="stock stock--low">Only ${n} left</span>`;
    return `<span class="stock">In stock: ${n}</span>`;
  }

  function priceBlock(p) {
    const sell = Catalog.sellPrice(p);
    const off = p.discount > 0
      ? `<s class="mrp">${Util.inr(p.price)}</s><span class="off">${p.discount}% off</span>`
      : '';
    return `<div class="price"><b>${Util.inr(sell)}</b>${off}</div>`;
  }

  function initListing() {
    const grid = document.getElementById('grid');
    if (!grid) return;

    const search = document.getElementById('search');
    const sort = document.getElementById('sort');
    const chipsHost = document.getElementById('chips');
    const count = document.getElementById('resultCount');
    const empty = document.getElementById('emptyState');
    let category = 'All';

    chipsHost.innerHTML = CATEGORIES.map(c =>
      `<button type="button" class="chip${c === 'All' ? ' is-on' : ''}" data-cat="${c}" aria-pressed="${c === 'All'}">${c}</button>`
    ).join('');

    chipsHost.addEventListener('click', e => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      category = b.getAttribute('data-cat');
      Util.qsa('.chip', chipsHost).forEach(c => {
        const on = c === b;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', String(on));
      });
      render();
    });

    const sorters = {
      featured: () => 0,
      'price-asc': (a, b) => Catalog.sellPrice(a) - Catalog.sellPrice(b),
      'price-desc': (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name)
    };

    function render() {
      const q = search.value.trim();
      const list = CATALOG
        .filter(p => category === 'All' || p.category === category)
        .filter(p => !q || p.name.includes(q) || p.category.includes(q))
        .slice()
        .sort(sorters[sort.value] || sorters.featured);

      count.textContent = `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}`;
      empty.hidden = list.length > 0;

      grid.innerHTML = list.map(p => {
        const st = Catalog.stockOf(p.id);
        return `<article class="card${st <= 0 ? ' is-out' : ''}" data-id="${p.id}">
          <div class="card-art">
            ${Catalog.art(p)}
            ${p.festive ? '<span class="ribbon">Festive offer</span>' : ''}
            ${p.discount > 0 ? `<span class="tag">-${p.discount}%</span>` : ''}
            <button type="button" class="peek" data-view="${p.id}" aria-label="Quick view ${Util.esc(p.name)}">Quick view</button>
          </div>
          <div class="card-body">
            <p class="cat">${p.category}</p>
            <h3 class="card-title">${Util.esc(p.name)}</h3>
            <p class="meta">${Util.esc(p.region)} · ${stockLabel(st)}</p>
            <p class="rating" aria-label="Rated ${p.rating.toFixed(1)} out of 5"><span class="stars">${stars(p.rating)}</span> ${p.rating.toFixed(1)} <span class="meta">(${p.reviews})</span></p>
            ${priceBlock(p)}
            <button type="button" class="btn btn--primary btn--block" data-add="${p.id}" ${st <= 0 ? 'disabled' : ''}>${st <= 0 ? 'Sold out' : 'Add to basket'}</button>
          </div>
        </article>`;
      }).join('');
    }

    function add(id) {
      const p = Catalog.find(id);
      const res = Cart.add(id);
      if (res.ok) {
        UI.toast(`${p.name} added to your basket.`, 'success');
        Auth.refreshBadge();
      } else {
        UI.toast(res.message, 'error');
      }
    }

    grid.addEventListener('click', e => {
      const addBtn = e.target.closest('[data-add]');
      if (addBtn && !addBtn.disabled) { add(addBtn.getAttribute('data-add')); return; }
      const viewBtn = e.target.closest('[data-view]');
      if (viewBtn) openQuickView(viewBtn.getAttribute('data-view'));
    });

    function openQuickView(id) {
      const p = Catalog.find(id);
      const st = Catalog.stockOf(id);
      const body = document.getElementById('qvBody');
      body.innerHTML = `
        <div class="qv-art">${Catalog.art(p, 'art art--lg')}</div>
        <div class="qv-info">
          <p class="cat">${p.category} · ${Util.esc(p.region)}</p>
          <h2 id="qvTitle">${Util.esc(p.name)}</h2>
          <p class="rating"><span class="stars">${stars(p.rating)}</span> ${p.rating.toFixed(1)} · ${p.reviews} reviews</p>
          <p class="qv-blurb">${Util.esc(p.blurb)}</p>
          ${priceBlock(p)}
          <p>${stockLabel(st)}</p>
          <button type="button" class="btn btn--primary" id="qvAdd">Add to basket</button>
        </div>`;
      document.getElementById('qvAdd').addEventListener('click', () => {
        add(id);
        UI.closeModal('quickView');
        render();
      });
      UI.openModal('quickView');
    }

    let t = null;
    search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(render, 150); });
    sort.addEventListener('change', render);
    document.getElementById('clearFilters').addEventListener('click', () => {
      search.value = '';
      sort.value = 'featured';
      chipsHost.querySelector('[data-cat="All"]').click();
    });

    UI.wireModals();
    render();
  }

  global.Catalog = Catalog;
  document.addEventListener('DOMContentLoaded', initListing);
})(window);
