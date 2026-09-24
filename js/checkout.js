(function (global) {
  'use strict';

  const round2 = Util.round2;

  const RULES = {
    fullName(v) {
      if (!v.length) return 'Full name is required.';
      if (!/^[A-Za-z ]{3,50}$/.test(v)) return 'Name should be 3 to 50 letters and spaces only.';
      return '';
    },
    phone(v) {
      if (!v.trim()) return 'Mobile number is required.';
      if (v.trim().length !== 10) return 'Enter a valid 10-digit mobile number.';
      return '';
    },
    custEmail(v) {
      const s = v.trim();
      if (!s) return 'Email is required.';
      if (s.length > 50) return 'Email must not exceed 50 characters.';
      if (!/^.+@.+\..+$/.test(s)) return 'Enter a valid email address.';
      return '';
    },
    address(v) {
      const s = v.trim();
      if (!s) return 'Delivery address is required.';
      if (s.length < 10) return 'Address should be at least 10 characters.';
      if (s.length > 200) return 'Address must not exceed 200 characters.';
      return '';
    },
    pincode(v) {
      const s = v.trim();
      if (!s) return 'Pincode is required.';
      if (!/^\d{5,6}$/.test(s)) return 'Enter a valid 6-digit pincode.';
      return '';
    }
  };

  function orderId() {
    const d = new Date();
    const stamp = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    return 'HT' + stamp + '-' + String(Math.floor(1000 + Math.random() * 9000));
  }

  const Orders = {
    key() { return Auth.userKey('haat.orders'); },
    all() { return Store.get(Orders.key(), []); },
    add(order) {
      const list = Orders.all();
      list.unshift(order);
      Store.set(Orders.key(), list);
    }
  };

  function initCheckout() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    const wrap = document.getElementById('checkoutLayout');
    const empty = document.getElementById('checkoutEmpty');
    const done = document.getElementById('confirmation');
    const side = document.getElementById('checkoutSummary');
    const placeBtn = document.getElementById('placeOrder');

    const session = Auth.getSession();
    const emailField = document.getElementById('custEmail');
    if (session && !emailField.value) emailField.value = session.email;

    function snapshot() {
      const lines = Cart.get();
      const codes = Cart.coupons();
      return { lines, codes, t: Cart.totals(lines, codes) };
    }

    function renderSummary() {
      const { lines, t } = snapshot();
      if (!lines.length) {
        wrap.hidden = true;
        empty.hidden = false;
        return;
      }
      side.innerHTML = `
        <h2 class="panel-title">Order summary</h2>
        <ul class="mini-list">
          ${t.items.map(i => `<li><span>${Util.esc(i.name)} <em>× ${i.qty}</em></span><b>${Util.inr(i.total)}</b></li>`).join('')}
        </ul>
        <div class="sum">${Cart.summaryRows(t)}</div>
        <a class="link" href="cart.html">← Edit basket</a>`;
    }

    function setError(id, message) {
      const field = document.getElementById(id);
      const box = document.getElementById(id + 'Err');
      if (field) {
        field.classList.toggle('is-invalid', !!message);
        field.setAttribute('aria-invalid', message ? 'true' : 'false');
      }
      if (box) box.textContent = message || '';
    }

    Object.keys(RULES).forEach(id => {
      const f = document.getElementById(id);
      f.addEventListener('blur', () => setError(id, RULES[id](f.value)));
      f.addEventListener('input', () => setError(id, ''));
    });
    Util.qsa('input[name="payment"]').forEach(r => r.addEventListener('change', () => setError('payment', '')));

    function validate() {
      let first = null;
      Object.keys(RULES).forEach(id => {
        const f = document.getElementById(id);
        const msg = RULES[id](f.value);
        setError(id, msg);
        if (msg && !first) first = f;
      });
      const pay = form.querySelector('input[name="payment"]:checked');
      setError('payment', pay ? '' : 'Choose a payment method.');
      if (!pay && !first) first = form.querySelector('input[name="payment"]');
      if (first) first.focus();
      return !first;
    }

    function finalize(snap, details) {
      const t = snap.t;
      const order = {
        id: orderId(),
        placedAt: new Date().toISOString(),
        items: t.items,
        coupons: t.applied.map(c => c.code),
        subtotal: t.subtotal,
        couponOff: t.couponOff,
        gst: t.gst,
        shipping: t.shipping,
        paid: round2(t.net + t.gst),
        customer: details,
        status: 'Confirmed'
      };
      Orders.add(order);
      Catalog.reduceStock(order.items.map(i => i.id));
      Cart.clear();
      showConfirmation(order);
    }

    function showConfirmation(o) {
      wrap.hidden = true;
      done.hidden = false;
      placeBtn.classList.remove('is-loading');
      placeBtn.textContent = 'Place order';
      done.innerHTML = `
        <div class="stamp" aria-hidden="true">✓</div>
        <h1>Dhanyavaad, ${Util.esc(o.customer.name.trim().split(' ')[0] || 'friend')}!</h1>
        <p class="lead">Your order <b id="orderId">${o.id}</b> is confirmed. Payment: ${o.customer.payment}.</p>
        <div class="panel">
          <table class="table">
            <thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col">Total</th></tr></thead>
            <tbody>${o.items.map(i => `<tr><td>${Util.esc(i.name)}</td><td>${i.qty}</td><td>${Util.inr(i.unit)}</td><td>${Util.inr(i.total)}</td></tr>`).join('')}</tbody>
          </table>
          <div class="sum">
            <div class="row"><span>Subtotal</span><b id="cSubtotal">${Util.inr(o.subtotal)}</b></div>
            <div class="row row--save"><span>Coupon discount${o.coupons.length ? ` <em>(${o.coupons.join(' + ')})</em>` : ''}</span><b id="cCoupon">− ${Util.inr(o.couponOff)}</b></div>
            <div class="row"><span>GST (18%)</span><b id="cGst">${Util.inr(o.gst)}</b></div>
            <div class="row"><span>Shipping</span><b id="cShip">${o.shipping ? Util.inr(o.shipping) : 'FREE'}</b></div>
            <div class="row row--grand"><span>Total paid</span><b id="cGrand">${Util.inr(o.paid)}</b></div>
          </div>
          <p class="ship-to"><b>Delivering to:</b> ${Util.esc(o.customer.name)}, ${Util.esc(o.customer.address)} – ${Util.esc(o.customer.pincode)} · ${Util.esc(o.customer.phone)}</p>
        </div>
        <div class="actions">
          <a class="btn btn--primary" href="products.html">Continue shopping</a>
          <a class="btn btn--ghost" href="orders.html">View my orders</a>
        </div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate()) return;
      const snap = snapshot();
      if (!snap.lines.length) { renderSummary(); return; }
      const details = {
        name: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value.trim(),
        email: emailField.value.trim(),
        address: document.getElementById('address').value.trim(),
        pincode: document.getElementById('pincode').value.trim(),
        payment: form.querySelector('input[name="payment"]:checked').value
      };
      placeBtn.classList.add('is-loading');
      placeBtn.textContent = 'Placing order…';
      setTimeout(() => finalize(snap, details), 1400);
    });

    renderSummary();
  }

  global.Orders = Orders;
  document.addEventListener('DOMContentLoaded', initCheckout);
})(window);
