// About page scripts: reveal-on-scroll only
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

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
