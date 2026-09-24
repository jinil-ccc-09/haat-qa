(function (global) {
  'use strict';

  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const INKS = ['#1d2b53', '#b5382a', '#2f6b4f', '#7a4b1e', '#5b3a7a'];
  const LENGTH = 6;

  let current = '';
  let canvas = null;
  let input = null;

  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = list => list[Math.floor(Math.random() * list.length)];

  function generate() {
    let s = '';
    for (let i = 0; i < LENGTH; i++) s += pick(GLYPHS);
    return s;
  }

  function draw() {
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 180;
    const h = canvas.clientHeight || 56;
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    ctx.fillStyle = '#fbf3e4';
    ctx.fillRect(0, 0, w, h);

    for (let x = 6; x < w; x += 12) {
      for (let y = 6; y < h; y += 12) {
        ctx.fillStyle = 'rgba(181, 56, 42, 0.12)';
        ctx.beginPath();
        ctx.arc(x + ((y / 12) % 2) * 6, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = pick(INKS) + '55';
      ctx.lineWidth = rand(1, 2);
      ctx.beginPath();
      ctx.moveTo(0, rand(0, h));
      ctx.bezierCurveTo(w * 0.3, rand(0, h), w * 0.7, rand(0, h), w, rand(0, h));
      ctx.stroke();
    }

    const step = (w - 20) / LENGTH;
    ctx.textBaseline = 'middle';
    for (let i = 0; i < current.length; i++) {
      ctx.save();
      ctx.translate(12 + step * i + step / 4, h / 2 + rand(-4, 4));
      ctx.rotate(rand(-0.35, 0.35));
      ctx.font = `700 ${Math.round(rand(22, 28))}px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = pick(INKS);
      ctx.fillText(current[i], 0, 0);
      ctx.restore();
    }
  }

  function renew() {
    current = generate();
    draw();
  }

  const Captcha = {
    mount(canvasEl, inputEl, refreshBtn) {
      canvas = canvasEl;
      input = inputEl;
      renew();
      refreshBtn.addEventListener('click', () => {
        renew();
        refreshBtn.classList.add('is-spinning');
        setTimeout(() => refreshBtn.classList.remove('is-spinning'), 500);
      });
      window.addEventListener('resize', draw);
    },

    reset() {
      renew();
      if (input) input.value = '';
    },

    matches(value) {
      return value.trim().localeCompare(current, 'en', { sensitivity: 'accent' }) === 0;
    }
  };

  global.Captcha = Captcha;
})(window);
