/* =============================================
   KÉP STUDIO — script.js
   Effects: Cursor · Slideshow · 3D Tilt ·
            Scroll Reveal · Parallax · Nav
   ============================================= */

/* ─── CUSTOM CURSOR ─────────────────────── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0;
let curX   = 0, curY   = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

// Smooth cursor follow
function animateCursor() {
  curX += (mouseX - curX) * 0.12;
  curY += (mouseY - curY) * 0.12;
  cursor.style.left = curX + 'px';
  cursor.style.top  = curY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Expand on interactive elements
const hoverTargets = document.querySelectorAll(
  'a, button, .studio-card, select, input, textarea, .tag-btn'
);
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
});


/* ─── HERO SLIDESHOW ─────────────────────── */
const slides   = document.querySelectorAll('.hero-slide');
const counter  = document.getElementById('currentSlide');
let current    = 0;
let slideTimer;

function goToSlide(n) {
  slides[current].classList.remove('active');
  current = (n + slides.length) % slides.length;
  slides[current].classList.add('active');
  counter.textContent = String(current + 1).padStart(2, '0');
}

function startSlideshow() {
  slideTimer = setInterval(() => goToSlide(current + 1), 5000);
}
startSlideshow();

// Pause on hover
const heroSection = document.querySelector('.hero');
heroSection.addEventListener('mouseenter', () => clearInterval(slideTimer));
heroSection.addEventListener('mouseleave', () => startSlideshow());


/* ─── SCROLL REVEAL ─────────────────────── */
const revealEls = document.querySelectorAll('.reveal-up');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings within a parent
      const siblings = entry.target.parentElement.querySelectorAll('.reveal-up');
      siblings.forEach((sib, idx) => {
        if (!sib.classList.contains('visible')) {
          setTimeout(() => sib.classList.add('visible'), idx * 90);
        }
      });
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// Trigger hero items immediately
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 300 + i * 150);
    });
  }, 100);
});


/* ─── 3D TILT ON STUDIO CARDS ───────────── */
const cards = document.querySelectorAll('.studio-card');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect    = card.getBoundingClientRect();
    const x       = e.clientX - rect.left;
    const y       = e.clientY - rect.top;
    const cx      = rect.width  / 2;
    const cy      = rect.height / 2;
    const rotateX = -((y - cy) / cy) * 5;
    const rotateY =  ((x - cx) / cx) * 5;

    card.style.transform   = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.transition  = 'transform 0.1s ease';
    card.style.boxShadow   = `${-rotateY * 2}px ${rotateX * 2}px 40px rgba(196,28,28,0.18)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.boxShadow  = 'none';
  });
});


/* ─── HERO PARALLAX ─────────────────────── */
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      // Parallax slides
      document.querySelectorAll('.hero-slide.active').forEach(slide => {
        slide.style.transform = `scale(1) translateY(${scrollY * 0.3}px)`;
      });

      // Hero content fade on scroll
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        const opacity = Math.max(0, 1 - scrollY / 500);
        heroContent.style.opacity  = opacity;
        heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
      }

      // Active nav link based on section
      updateActiveNav(scrollY);

      ticking = false;
    });
    ticking = true;
  }
});


/* ─── ACTIVE NAV HIGHLIGHT ───────────────── */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveNav(scrollY) {
  let active = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 200;
    if (scrollY >= top) active = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${active}`);
  });
}


/* ─── BOOKING TAGS ───────────────────────── */
function toggleTag(btn) {
  btn.classList.toggle('active');
}


/* ─── BOOKING SUBMIT ─────────────────────── */
function submitBooking() {
  const zone  = document.getElementById('zone').value;
  const date  = document.getElementById('bookDate').value;
  const phone = document.querySelector('input[type="tel"]').value;

  if (!zone) {
    shakeField(document.querySelector('.select-wrap'));
    return;
  }
  if (!date) {
    shakeField(document.querySelector('input[type="date"]'));
    return;
  }
  if (!phone.trim()) {
    shakeField(document.querySelector('input[type="tel"]'));
    return;
  }

  // Show modal
  document.getElementById('modalOverlay').classList.add('show');
}

function shakeField(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
  el.style.borderColor = 'var(--red)';
  setTimeout(() => el.style.borderColor = '', 1500);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}

// Close modal on overlay click
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// Shake keyframe via JS (fallback for dynamic injection)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-6px); }
  75%       { transform: translateX(6px); }
}`;
document.head.appendChild(shakeStyle);


/* ─── SMOOTH NAV SCROLL ──────────────────── */
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ─── ZONE HOVER 3D CARD ─────────────────── */
document.querySelectorAll('.zone-item').forEach(zone => {
  zone.addEventListener('mousemove', (e) => {
    const rect = zone.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
    zone.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg)`;
    zone.style.transition = 'transform 0.15s ease';
  });
  zone.addEventListener('mouseleave', () => {
    zone.style.transform  = 'perspective(600px) rotateY(0) rotateX(0)';
    zone.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  });
});


/* ─── MARQUEE PAUSE ON HOVER ─────────────── */
const marquee = document.querySelector('.marquee-track');
if (marquee) {
  marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
  marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
}
