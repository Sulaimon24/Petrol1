// ===============================
// JELFAD JS
// - Scroll reveal via IntersectionObserver
// - Price ticker (manual JSON)
// - Stats counter-up
// - Mobile menu
// - Branch locator
// - Prices local editor (exportable)
// ===============================

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

// Footer year
(() => {
  const y = new Date().getFullYear();
  const el = document.getElementById('year');
  if (el) el.textContent = y;
})();

// Reveal on scroll
(() => {
  const items = $$('.reveal-up');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.15 });
  items.forEach(i => io.observe(i));
})();

// Mobile menu
(() => {
  const toggle = $('.menu-toggle');
  const nav = $('.nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.style.display === 'flex';
    nav.style.display = open ? 'none' : 'flex';
  });
})();

// Price ticker
(async () => {
  const ticker = document.getElementById('price-ticker');
  if (!ticker) return;
  try {
    const res = await fetch('/data/prices.json', { cache: 'no-store' });
    const data = await res.json();
    const items = [...data.items, ...data.items]; // duplicate for continuous scroll
    ticker.innerHTML = items.map(it => `
      <span class="ticker-item">
        <span class="ticker-dot"></span>
        <span>${it.product}</span>
        <strong>₦${Number(it.price).toLocaleString()}</strong>
      </span>
    `).join('');
  } catch (e) {
    ticker.textContent = 'Unable to load prices.';
  }
})();

// Counter-up
(() => {
  const elms = $$('[data-count]');
  if (!elms.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.getAttribute('data-count'));
      let current = 0;
      const step = Math.ceil(target / 60);
      const t = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(t); }
        el.textContent = current;
      }, 20);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  elms.forEach(el => io.observe(el));
})();

// Branch locator
(async () => {
  const list = document.getElementById('branches-list');
  const search = document.getElementById('branch-search');
  if (!list || !search) return;
  let branches = [];
  try {
    const res = await fetch('/data/branches.json', { cache: 'no-store' });
    branches = await res.json();
  } catch (e) {
    branches = [];
  }

  const render = (arr) => {
    list.innerHTML = arr.map(b => `
      <div class="branch-card">
        <h4>${b.name}</h4>
        <p>${b.address}</p>
        <p><strong>${b.city}</strong> • ${b.hours}</p>
        <a class="btn btn-outline" href="tel:${b.phone.replace(/\s/g,'')}">Call</a>
      </div>
    `).join('');
  };

  render(branches);

  search.addEventListener('input', () => {
    const q = search.value.toLowerCase();
    const filtered = branches.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q)
    );
    render(filtered);
  });
})();

// Prices local editor (non-persistent; export JSON)
(() => {
  const btn = document.getElementById('edit-prices');
  const dialog = document.getElementById('price-dialog');
  const rowsWrap = document.getElementById('price-form-rows');
  const tableBody = $('#price-table tbody');
  if (!btn || !dialog || !rowsWrap || !tableBody) return;

  let data = { items: [] };

  const load = async () => {
    try {
      const res = await fetch('/data/prices.json', { cache: 'no-store' });
      const json = await res.json();
      data = json;
      renderTable();
    } catch (e) {
      tableBody.innerHTML = '<tr><td colspan="2">Failed to load prices.</td></tr>';
    }
  };

  const renderTable = () => {
    tableBody.innerHTML = data.items.map(it => `
      <tr><td>${it.product}</td><td>₦${Number(it.price).toLocaleString()}</td></tr>
    `).join('');
  };

  const renderForm = () => {
    rowsWrap.innerHTML = data.items.map((it, i) => `
      <div class="row" data-i="${i}" style="display:grid;grid-template-columns:1fr 140px;gap:12px;margin-bottom:8px;">
        <input type="text" value="${it.product}" aria-label="Product ${i+1}"/>
        <input type="number" value="${it.price}" aria-label="Price ${i+1}"/>
      </div>
    `).join('');
  };

  btn.addEventListener('click', async () => {
    await load();
    renderForm();
    dialog.showModal();
  });

  $('#save-prices')?.addEventListener('click', (e) => {
    e.preventDefault();
    const rows = $$('.row', rowsWrap);
    data.items = rows.map(r => {
      const [pEl, vEl] = $$('input', r);
      return { product: pEl.value.trim(), price: Number(vEl.value) || 0 };
    });
    renderTable();
    dialog.close();
  });

  $('#export-prices')?.addEventListener('click', (e) => {
    e.preventDefault();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prices.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // initial table
  load();
})();


//Dot around mouse cursor
document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.querySelector(".custom-cursor");
  let mouseX = 0, mouseY = 0; // Mouse position
  let currentX = 0, currentY = 0;  //Dot position
  const lag = 0.1;

  // Cursor follows with lag
  function animateCursor() {
    currentX += (mouseX - currentX-5) * lag;
    currentY += (mouseY - currentY-5) * lag;
    cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Track mouse
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Detect background color under cursor
    const elementUnderCursor = document.elementFromPoint(mouseX, mouseY);
    if (elementUnderCursor) {
      const bg = window.getComputedStyle(elementUnderCursor).backgroundColor;
      const isBlack = bg === "rgb(0, 0, 0)";
      cursor.style.backgroundColor = isBlack ? "white" : "black";
    }
  });

  // Click ripple + scale
  window.addEventListener("mousedown", () => {
    cursor.classList.add("clicking", "rippling");
  });

  window.addEventListener("mouseup", () => {
    cursor.classList.remove("clicking");
    setTimeout(() => {
      cursor.classList.remove("rippling");
    }, 300);
  });
});
