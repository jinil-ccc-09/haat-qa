(function (global) {
  'use strict';

  const GST_RATE = 0.18;
  const SHIP_FEE = 50;
  const FREE_SHIP_AT = 500;
  const PER_ITEM_MAX = 10;

  const COUPONS = [
    { code: 'SAVE10', kind: 'percent', value: 10, min: 1000, validTill: '2030-12-31', label: '10% off on orders of ₹1,000 or more' },
    { code: 'FLAT200', kind: 'flat', value: 200, min: 1500, validTill: '2030-12-31', label: '₹200 off on orders of ₹1,500 or more' },
    { code: 'EXPIRED50', kind: 'percent', value: 50, min: 0, validTill: '2025-12-31', label: 'Monsoon sale: 50% off' }
  ];

  const round2 = Util.round2;
  const lineAmount = (unit, qty) => Math.floor(unit * qty * 100) / 100;

  const Cart = {
    GST_RATE, SHIP_FEE, FREE_SHIP_AT, PER_ITEM_MAX, COUPONS,

    key() { return Auth.userKey('haat.cart'); },
    couponKey() { return Auth.userKey('haat.coupons'); },

    get() { return Store.get(Cart.key(), []); },
    save(lines) { Store.set(Cart.key(), lines); Auth.refreshBadge(); },
    clear() { Store.remove(Cart.key()); Store.remove(Cart.couponKey()); Auth.refreshBadge(); },

    coupons() { return Store.get(Cart.couponKey(), []); },
    saveCoupons(codes) { Store.set(Cart.couponKey(), codes); },

    limitFor(id) { return Math.min(Catalog.stockOf(id), PER_ITEM_MAX); },

    add(id) {
      const p = Catalog.find(id);
      if (!p) return { ok: false, message: 'This item is no longer available.' };
      const lines = Cart.get();
      const line = lines.find(l => l.id === id);
      const limit = Catalog.stockOf(id);
      if (line) {
        if (line.qty >= limit) return { ok: false, message: `Only ${limit} of ${p.name} in stock.` };
        line.qty += 1;
      } else {
        lines.push({ id, qty: 1, addedAt: Date.now() });
      }
      Cart.save(lines);
      return { ok: true };
    },

    unitPrice(p) {
      const base = p.offerPrice !== undefined ? p.offerPrice : p.price;
      return round2(base - base * p.discount / 100);
    },

    totals(lines, codes) {
      const items = lines.map(l => {
        const p = Catalog.find(l.id);
        const unit = Cart.unitPrice(p);
        return {
          id: p.id, name: p.name, qty: l.qty, unit, mrp: p.price,
          total: lineAmount(unit, l.qty)
        };
      });
      const subtotal = round2(items.reduce((s, i) => s + i.total, 0));
      const listTotal = round2(items.reduce((s, i) => s + i.mrp * i.qty, 0));
      const applied = (codes || []).map(c => COUPONS.find(x => x.code === c)).filter(Boolean);
      let couponOff = applied.reduce((s, c) => s + (c.kind === 'percent' ? round2(subtotal * c.value / 100) : c.value), 0);
      couponOff = Math.min(round2(couponOff), subtotal);
      const net = round2(subtotal - couponOff);
      const gst = round2(subtotal * GST_RATE);
      const shipping = items.length === 0 ? 0 : (net > FREE_SHIP_AT ? 0 : SHIP_FEE);
      const grand = round2(net + gst + shipping);
      const count = items.reduce((n, i) => n + i.qty, 0);
      return { items, count, subtotal, listTotal, applied, couponOff, net, gst, shipping, grand };
    },

    orderValueFor(coupon, t) {
      return coupon.kind === 'percent' ? t.listTotal : t.subtotal;
    },

    isExpired(input) {
      const c = COUPONS.find(x => x.code === input.trim());
      return !!c && new Date(c.validTill + 'T23:59:59') < new Date();
    },

    applyCoupon(input) {
      const code = input.trim().toUpperCase();
      if (!code) return { ok: false, message: 'Please enter a coupon code.' };
      const coupon = COUPONS.find(c => c.code === code);
      if (!coupon) return { ok: false, message: 'Invalid coupon code.' };
      if (Cart.isExpired(input)) return { ok: false, message: 'This coupon has expired.' };
      const codes = Cart.coupons();
      if (codes.includes(code)) return { ok: false, message: 'This coupon is already applied.' };
      const t = Cart.totals(Cart.get(), []);
      if (Cart.orderValueFor(coupon, t) < coupon.min) {
        return { ok: false, message: `Add items worth ${Util.inr(coupon.min - t.subtotal)} more to use ${code} (minimum order ${Util.inr(coupon.min)}).` };
      }
      codes.push(code);
      Cart.saveCoupons(codes);
      return { ok: true, message: `${code} applied.` };
    },

    removeCoupon(code) {
      Cart.saveCoupons(Cart.coupons().filter(c => c !== code));
    },

    revalidateCoupons(lines) {
      const codes = Cart.coupons();
      if (!codes.length) return [];
      const t = Cart.totals(lines, []);
      const dropped = [];
      const kept = codes.filter(code => {
        const c = COUPONS.find(x => x.code === code);
        const ok = c && lines.length > 0 && Cart.orderValueFor(c, t) >= c.min;
        if (!ok) dropped.push(code);
        return ok;
      });
      if (dropped.length) Cart.saveCoupons(kept);
      return dropped;
    },

    summaryRows(t) {
      const couponNames = t.applied.map(c => c.code).join(' + ');
      return `
        <div class="row"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><b id="sumSubtotal">${Util.inr(t.subtotal)}</b></div>
        <div class="row row--save"><span>Coupon discount${couponNames ? ` <em>(${couponNames})</em>` : ''}</span><b id="sumCoupon">− ${Util.inr(t.couponOff)}</b></div>
        <div class="row"><span>GST (18%)</span><b id="sumGst">${Util.inr(t.gst)}</b></div>
        <div class="row"><span>Shipping</span><b id="sumShip">${t.shipping ? Util.inr(t.shipping) : 'FREE'}</b></div>
        <div class="row row--grand"><span>Grand total</span><b id="sumGrand">${Util.inr(t.grand)}</b></div>`;
    }
  };

  function initCartPage() {
    const host = document.getElementById('cartItems');
    if (!host) return;

    const layout = document.getElementById('cartLayout');
    const empty = document.getElementById('cartEmpty');
    const summary = document.getElementById('summaryRows');
    const meter = document.getElementById('shipMeter');
    const chips = document.getElementById('appliedCoupons');
    const couponForm = document.getElementById('couponForm');
    const couponInput = document.getElementById('couponInput');
    const couponMsg = document.getElementById('couponMsg');
    const offers = document.getElementById('offerList');

    let lines = Cart.get();

    offers.innerHTML = COUPONS.filter(c => !Cart.isExpired(c.code)).map(c =>
      `<li><button type="button" class="offer" data-code="${c.code}"><b>${c.code}</b><span>${c.label}</span></button></li>`
    ).join('');
    offers.addEventListener('click', e => {
      const b = e.target.closest('[data-code]');
      if (!b) return;
      couponInput.value = b.getAttribute('data-code');
      couponInput.focus();
    });

    function persist() {
      Cart.save(lines);
      const dropped = Cart.revalidateCoupons(lines);
      dropped.forEach(code => UI.toast(`${code} was removed because your order no longer meets its minimum.`, 'info'));
    }

    function render() {
      if (!lines.length) {
        layout.hidden = true;
        empty.hidden = false;
        return;
      }
      layout.hidden = false;
      empty.hidden = true;

      const t = Cart.totals(lines, Cart.coupons());
      const view = lines.slice().reverse();

      host.innerHTML = view.map((l, idx) => {
        const p = Catalog.find(l.id);
        const item = t.items.find(i => i.id === l.id);
        const limit = Cart.limitFor(l.id);
        return `<li class="line" data-id="${l.id}">
          <div class="line-art">${Catalog.art(p, 'art art--sm')}</div>
          <div class="line-info">
            <h3>${Util.esc(p.name)}</h3>
            <p class="line-meta">${Util.esc(p.region)}</p>
            <p class="line-unit">${Util.inr(item.unit)} each${p.discount ? ` <s>${Util.inr(p.price)}</s>` : ''}</p>
          </div>
          <div class="stepper" role="group" aria-label="Quantity for ${Util.esc(p.name)}">
            <button type="button" class="step" data-dec="${l.id}" aria-label="Decrease quantity" ${l.qty <= 1 ? 'disabled' : ''}>−</button>
            <input type="number" class="qty" data-qty="${l.id}" value="${l.qty}" min="1" max="${Math.max(1, limit)}" aria-label="Quantity" inputmode="numeric">
            <button type="button" class="step" data-inc="${l.id}" aria-label="Increase quantity" ${l.qty >= limit ? 'disabled' : ''}>+</button>
          </div>
          <div class="line-total"><span class="sr-only">Item total</span>${Util.inr(item.total)}</div>
          <button type="button" class="remove" data-remove="${idx}" aria-label="Remove ${Util.esc(p.name)}">Remove</button>
        </li>`;
      }).join('');

      summary.innerHTML = Cart.summaryRows(t);

      chips.innerHTML = t.applied.map(c =>
        `<span class="coupon-chip">${c.code}<button type="button" data-drop="${c.code}" aria-label="Remove coupon ${c.code}">×</button></span>`
      ).join('');

      const gap = round2(FREE_SHIP_AT - t.net);
      const pct = Math.min(100, Math.round((t.net / FREE_SHIP_AT) * 100));
      meter.innerHTML = gap > 0
        ? `<p>Add <b>${Util.inr(gap)}</b> more for <b>free delivery</b>.</p><div class="meter"><span style="width:${pct}%"></span></div>`
        : `<p class="meter-done">You have unlocked <b>free delivery</b>.</p><div class="meter"><span style="width:100%"></span></div>`;
    }

    host.addEventListener('click', e => {
      const inc = e.target.closest('[data-inc]');
      const dec = e.target.closest('[data-dec]');
      const rem = e.target.closest('[data-remove]');
      if (inc) {
        const l = lines.find(x => x.id === inc.getAttribute('data-inc'));
        const limit = Cart.limitFor(l.id);
        if (l.qty < limit) l.qty += 1;
        else UI.toast(`You can buy at most ${limit} of this item.`, 'info');
        persist(); render();
      } else if (dec) {
        const l = lines.find(x => x.id === dec.getAttribute('data-dec'));
        if (l.qty > 1) l.qty -= 1;
        persist(); render();
      } else if (rem) {
        const removed = lines.splice(Number(rem.getAttribute('data-remove')), 1)[0];
        persist(); render();
        if (removed) UI.toast(`${Catalog.find(removed.id).name} removed from your basket.`, 'info');
      }
    });

    host.addEventListener('change', e => {
      const input = e.target.closest('[data-qty]');
      if (!input) return;
      const l = lines.find(x => x.id === input.getAttribute('data-qty'));
      const limit = Cart.limitFor(l.id);
      let v = parseInt(input.value, 10);
      if (!Number.isFinite(v) || v < 1) v = 1;
      if (v > limit) {
        v = limit;
        UI.toast(`You can buy at most ${limit} of this item.`, 'info');
      }
      l.qty = v;
      render();
    });

    chips.addEventListener('click', e => {
      const b = e.target.closest('[data-drop]');
      if (!b) return;
      Cart.removeCoupon(b.getAttribute('data-drop'));
      couponMsg.textContent = '';
      render();
    });

    couponForm.addEventListener('submit', e => {
      e.preventDefault();
      const res = Cart.applyCoupon(couponInput.value);
      couponMsg.textContent = res.message;
      couponMsg.className = 'msg' + (res.ok ? ' msg--ok' : '');
      if (res.ok) couponInput.value = '';
      render();
    });

    document.getElementById('toCheckout').addEventListener('click', () => {
      location.href = 'checkout.html';
    });

    render();
  }

  global.Cart = Cart;
  document.addEventListener('DOMContentLoaded', initCartPage);
})(window);
