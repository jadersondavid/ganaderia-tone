// Formato de pesos colombianos
const cop = n => '$' + Math.round(n).toLocaleString('es-CO');

// ---------- Escalera de valor (diapositiva 6) ----------
const escalera = [
  { lbl: 'Ovocito viable', val: 45000 },
  { lbl: 'Preñez Gyrolando (3 meses)', val: 2000000 },
  { lbl: 'Gyrolando Plus recién nacida', val: 3500000 },
  { lbl: 'Ternera 140 kg (Medellín)', val: 5320000 },
  { lbl: 'Preñez confirmada Gyr pura', val: 8000000 },
  { lbl: 'Venta de aspiración (desde)', val: 10000000 },
  { lbl: 'Cría viva Gyr pura', val: 15000000, top: true },
];
const maxVal = Math.max(...escalera.map(e => e.val));
document.getElementById('bars').innerHTML = escalera.map(e => `
  <div class="bar-row${e.top ? ' top' : ''}">
    <span class="lbl">${e.lbl}</span>
    <div class="bar-track">
      <div class="bar-fill" data-w="${(e.val / maxVal) * 82}"></div>
      <span class="bar-val">${cop(e.val)}</span>
    </div>
  </div>`).join('');

function animarBarras(on) {
  document.querySelectorAll('.bar-fill').forEach(f => {
    f.style.width = on ? f.dataset.w + '%' : '0';
    f.nextElementSibling.style.left = on ? f.dataset.w + '%' : '0';
  });
}

// ---------- Simulador (diapositiva 9) ----------
const productos = [
  { n: 'Gyrolando Plus con registro, recién nacida', q: 1, p: 3500000 },
  { n: 'Novilla / ternera de 140 kg (140 × $38.000)', q: 1, p: 5320000 },
  { n: 'Venta de aspiración', q: 1, p: 10000000 },
  { n: 'Ovocitos viables', q: 1, p: 41500 },
  { n: 'Cría viva Gyr pura', q: 1, p: 15000000 },
  { n: 'Preñez confirmada Gyr pura', q: 1, p: 8000000 },
  { n: 'Preñez confirmada Gyrolando (3 meses)', q: 1, p: 1900000 },
];
const body = document.getElementById('simBody');
body.innerHTML = productos.map((r, i) => `
  <tr>
    <td>${r.n}</td>
    <td><input class="qty" type="number" min="0" value="${r.q}" data-i="${i}" data-k="q"></td>
    <td><input type="number" min="0" step="1000" value="${r.p}" data-i="${i}" data-k="p"></td>
    <td class="sub" id="sub${i}"></td>
  </tr>`).join('');

function calcular() {
  let total = 0;
  productos.forEach((r, i) => {
    const s = r.q * r.p;
    total += s;
    document.getElementById('sub' + i).textContent = cop(s);
  });
  document.getElementById('simTotal').textContent = cop(total);
}
body.addEventListener('input', e => {
  const t = e.target;
  productos[t.dataset.i][t.dataset.k] = Math.max(0, Number(t.value) || 0);
  calcular();
});
calcular();

// ---------- Navegación ----------
const slides = [...document.querySelectorAll('.slide')];
let actual = 0;

function ir(n) {
  actual = Math.max(0, Math.min(slides.length - 1, n));
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === actual);
    s.classList.toggle('past', i < actual);
  });
  document.getElementById('count').textContent = `${actual + 1} / ${slides.length}`;
  document.getElementById('bar').style.width = ((actual + 1) / slides.length * 100) + '%';
  animarBarras(slides[actual].contains(document.getElementById('bars')));
  history.replaceState(null, '', '#' + (actual + 1));
}

document.getElementById('prev').onclick = () => ir(actual - 1);
document.getElementById('next').onclick = () => ir(actual + 1);
document.getElementById('fs').onclick = pantallaCompleta;

function pantallaCompleta() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
}

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); ir(actual + 1); }
  else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); ir(actual - 1); }
  else if (e.key === 'Home') ir(0);
  else if (e.key === 'End') ir(slides.length - 1);
  else if (e.key.toLowerCase() === 'f') pantallaCompleta();
});

// Deslizar con el dedo en celular
let x0 = null, y0 = null;
document.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  if (x0 === null || e.target.tagName === 'INPUT') return;
  const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) ir(actual + (dx < 0 ? 1 : -1));
  x0 = null;
});

ir((parseInt(location.hash.slice(1), 10) || 1) - 1);
