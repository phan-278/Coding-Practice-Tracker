/* =====================================================
   KÉP STUDIO — script.js
   Modules:
   1. Storage (local + Supabase-ready)
   2. Cursor
   3. Hero Slideshow
   4. Scroll Reveal + 3D Tilt
   5. Navigation
   6. Marquee
   7. Zone Lightbox
   8. Calendar (mini + hourly timeline)
   9. Booking Form (5 steps)
   10. Admin Panel
   11. Utilities
   ===================================================== */


/* ================================================================
   1. STORAGE — Local fallback (Supabase-ready)
================================================================ */

// bookings stored as array in localStorage
let _bookings = JSON.parse(localStorage.getItem('kep_bookings') || '[]');

function getBookings() {
  return _bookings;
}

function saveBookings() {
  localStorage.setItem('kep_bookings', JSON.stringify(_bookings));
}

function addBooking(data) {
  const entry = {
    ...data,
    id: 'BK-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  _bookings.unshift(entry);
  saveBookings();
  return entry;
}

function updateBookingStatus(id, status) {
  const b = _bookings.find(x => x.id === id);
  if (b) { b.status = status; saveBookings(); }
}


/* ================================================================
   2. CURSOR
================================================================ */
(function initCursor() {
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  (function animCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animCursor);
  })();

  // Expand on interactive elements
  const targets = 'a, button, select, input, textarea, .studio-card, .zone-card, .zone-radio, .equip-item, .cal-day, .slide-dot, .tz-tab';
  document.querySelectorAll(targets).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
  });
})();


/* ================================================================
   3. HERO SLIDESHOW
================================================================ */
(function initSlideshow() {
  const slides   = document.querySelectorAll('.slide');
  const dotsWrap = document.getElementById('slideDots');
  let current = 0;
  let timer;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slide-dot' + (i === 0 ? ' active' : '');
    d.onclick = () => { goSlide(i); resetTimer(); };
    dotsWrap.appendChild(d);
  });

  function goSlide(n) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current].classList.add('active');
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goSlide(current + 1), 5000);
  }

  resetTimer();

  // Expose for HTML buttons
  window.nextSlide = () => { goSlide(current + 1); resetTimer(); };
  window.prevSlide = () => { goSlide(current - 1); resetTimer(); };

  // Pause on hover
  const hero = document.querySelector('.hero');
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', resetTimer);
})();


/* ================================================================
   4. SCROLL REVEAL + 3D TILT
================================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Stagger siblings
      const siblings = entry.target.parentElement.querySelectorAll('.reveal-up');
      siblings.forEach((sib, i) => {
        if (!sib.classList.contains('visible')) {
          setTimeout(() => sib.classList.add('visible'), i * 90);
        }
      });
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => obs.observe(el));

  // Trigger hero immediately after load
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 300 + i * 150);
    });
  }, 100);
})();

(function init3DTilt() {
  document.querySelectorAll('.studio-card, .zone-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = -((e.clientY - r.top)  / r.height - 0.5) * 7;
      const ry =  ((e.clientX - r.left) / r.width  - 0.5) * 7;
      card.style.transform  = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
      card.style.transition = 'transform 0.1s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    });
  });
})();


/* ================================================================
   5. NAVIGATION — smooth scroll + active highlight
================================================================ */
(function initNav() {
  const links = document.querySelectorAll('.nav-link');
  const secs  = document.querySelectorAll('section[id]');

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  window.addEventListener('scroll', () => {
    let active = '';
    secs.forEach(s => {
      if (window.scrollY >= s.offsetTop - 220) active = s.id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + active));
  });
})();


/* ================================================================
   6. MARQUEE — pause on hover
================================================================ */
(function initMarquee() {
  const mq = document.querySelector('.marquee-track');
  if (!mq) return;
  mq.addEventListener('mouseenter', () => mq.style.animationPlayState = 'paused');
  mq.addEventListener('mouseleave', () => mq.style.animationPlayState = 'running');
})();


/* ================================================================
   7. ZONE LIGHTBOX
================================================================ */
const ZONE_DATA = {
  O: {
    title: '"O" Zone — Lầu 1 (1F)',
    images: [
      'KepDaSpace/studio1.jpg',
      'KepDaSpace/studio5.jpg',
      'KepDaSpace/studio2.jpg',
    ],
    info: `
      <strong>O Zone · 1F</strong><br>
      Sảnh chính rộng ~80m² với cột bê tông, ánh sáng tự nhiên cửa sổ vòm.<br>
      Điện 3 pha · Máy lạnh · Wifi tốc độ cao<br><br>
      <strong>Giá:</strong> 600K / 2 giờ đầu — 250K / giờ thêm
    `
  },
  C: {
    title: '"C" Zone — Lầu 2 (2F)',
    images: [
      'KepDaSpace/studio4.jpg',
      'KepDaSpace/studio6.jpg',
      'KepDaSpace/studio3.jpg',
    ],
    info: `
      <strong>C Zone · 2F</strong><br>
      Tầng thượng private, makeup 3 gương, phòng thay đồ, rèm lụa mờ.<br>
      Cầu thang biểu tượng đỏ · Natural light<br><br>
      <strong>Giá:</strong> 500K / 2 giờ đầu — 200K / giờ thêm
    `
  },
  Full: {
    title: 'Full House — Toàn bộ 2 tầng',
    images: [
      'KepDaSpace/studio6.jpg',
      'KepDaSpace/studio1.jpg',
      'KepDaSpace/studio4.jpg',
    ],
    info: `
      <strong>Full House</strong><br>
      Thuê trọn 2 tầng cho production lớn, workshop, pop-up event hoặc buổi chụp thương mại.<br>
      Cả 2 tầng · Setup support · Ưu tiên giờ cao điểm<br><br>
      <strong>Giá:</strong> Thương lượng trực tiếp
    `
  }
};

let _lightboxZone = 'O';

function openZoneLightbox(zone) {
  _lightboxZone = zone;
  const data = ZONE_DATA[zone];

  document.getElementById('lightboxTitle').textContent = data.title;
  document.getElementById('lightboxInfo').innerHTML    = data.info;

  const grid = document.getElementById('lightboxGrid');
  grid.innerHTML = data.images.map(src =>
    `<div class="lb-img" style="background-image:url('${src}')"></div>`
  ).join('');

  openModal('zoneLightbox');
}

function bookFromLightbox() {
  closeModal('zoneLightbox');
  // Pre-select zone in form
  const radioEl = document.querySelector(`input[name="zone"][value="${_lightboxZone}"]`);
  if (radioEl) { radioEl.checked = true; onZoneChange(); }
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.openZoneLightbox = openZoneLightbox;
window.bookFromLightbox = bookFromLightbox;


/* ================================================================
   8. CALENDAR
================================================================ */
const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_LABELS   = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                        'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const TIMELINE_START = 8;   // 08:00
const TIMELINE_END   = 21;  // 21:00

let calDate        = new Date();
let calSelectedDay = null;    // 'YYYY-MM-DD'
let timelineZone   = 'O';

// ── Mini Calendar ──

function renderCalendar() {
  const y = calDate.getFullYear();
  const m = calDate.getMonth();
  document.getElementById('calTitle').textContent = MONTH_LABELS[m] + ' ' + y;

  // Weekday headers
  const wdEl = document.getElementById('calWeekdays');
  wdEl.innerHTML = WEEKDAY_LABELS.map(d => `<div class="wd">${d}</div>`).join('');

  const firstDay      = new Date(y, m, 1).getDay();
  const daysInMonth   = new Date(y, m + 1, 0).getDate();
  const prevMonthDays = new Date(y, m, 0).getDate();
  const today         = new Date(); today.setHours(0, 0, 0, 0);
  const bookings      = getBookings();

  const grid = document.getElementById('calDays');
  grid.innerHTML = '';

  // Prev month tail
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.appendChild(makeDayCell(prevMonthDays - i, true, false, [], null));
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dt      = new Date(y, m, day);
    const dateStr = toDateStr(dt);
    const isToday = dt.getTime() === today.getTime();
    const isSel   = dateStr === calSelectedDay;

    const dayBks = bookings.filter(b =>
      b.date === dateStr &&
      b.status !== 'rejected' &&
      (b.zone === timelineZone || b.zone === 'Full' || timelineZone === 'Full')
    );

    const cell = makeDayCell(day, false, isToday, dayBks, dateStr);
    if (isSel) cell.classList.add('selected');
    grid.appendChild(cell);
  }

  // Next month head
  const filled  = firstDay + daysInMonth;
  const remain  = (7 - filled % 7) % 7;
  for (let i = 1; i <= remain; i++) {
    grid.appendChild(makeDayCell(i, true, false, [], null));
  }
}

function makeDayCell(dayNum, otherMonth, isToday, bookings, dateStr) {
  const cell = document.createElement('div');
  cell.className = 'cal-day' +
    (otherMonth ? ' other-month' : '') +
    (isToday    ? ' today' : '');

  const numEl = document.createElement('span');
  numEl.className = 'day-n';
  numEl.textContent = dayNum;
  cell.appendChild(numEl);

  if (bookings.length > 0) {
    const dots = document.createElement('div');
    dots.className = 'day-dots';
    bookings.forEach(b => {
      const d = document.createElement('span');
      d.className = 'ddot ' + (b.status === 'confirmed' ? 'ddot-confirmed' : 'ddot-pending');
      dots.appendChild(d);
    });
    cell.appendChild(dots);
  }

  if (dateStr) {
    cell.onclick = () => selectDay(dateStr);
  }
  return cell;
}

function selectDay(dateStr) {
  calSelectedDay = dateStr;
  // Update selected styling
  document.querySelectorAll('.cal-day.selected').forEach(c => c.classList.remove('selected'));
  // Re-render calendar to apply selection
  renderCalendar();
  // Pre-fill date in form
  document.getElementById('fDate').value = dateStr;
  // Render timeline
  renderTimeline(dateStr);
}

window.calPrev = function() { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); };
window.calNext = function() { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); };
window.switchTimelineZone = function(zone, btn) {
  timelineZone = zone;
  document.querySelectorAll('.tz-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderCalendar();
  if (calSelectedDay) renderTimeline(calSelectedDay);
};

// ── Hourly Timeline ──

function renderTimeline(dateStr) {
  const wrap     = document.getElementById('timelineWrap');
  const bookings = getBookings().filter(b =>
    b.date === dateStr &&
    b.status !== 'rejected' &&
    (b.zone === timelineZone || b.zone === 'Full' || timelineZone === 'Full')
  );

  const hours    = TIMELINE_END - TIMELINE_START; // number of columns
  const colCount = hours;

  // Build header row: zone label + hour labels
  let html = `<div class="tl-grid" style="--tl-cols:${colCount};">`;

  // Hour header
  html += '<div class="tl-zone-label" style="font-size:.38rem;color:var(--warm-grey);">Giờ</div>';
  for (let h = TIMELINE_START; h < TIMELINE_END; h++) {
    html += `<div class="tl-hour-label">${h}h</div>`;
  }

  // Zone rows
  const zonesToShow = timelineZone === 'Full' ? ['O', 'C'] : [timelineZone];

  zonesToShow.forEach(z => {
    // Zone label
    html += `<div class="tl-zone-label">${z}</div>`;

    // Build slot cells
    const zoneBookings = bookings.filter(b => b.zone === z || b.zone === 'Full');

    for (let h = TIMELINE_START; h < TIMELINE_END; h++) {
      const booked = zoneBookings.find(b => {
        const start = parseInt((b.startTime || '08:00').split(':')[0]);
        const end   = parseInt((b.endTime   || '10:00').split(':')[0]);
        return h >= start && h < end;
      });

      if (booked) {
        // Show booking block only at its start hour
        const bStart = parseInt((booked.startTime || '08:00').split(':')[0]);
        const bEnd   = parseInt((booked.endTime   || '10:00').split(':')[0]);
        const span   = bEnd - bStart;

        if (h === bStart) {
          const statusClass = booked.status === 'confirmed' ? 'booked-confirmed' : 'booked-pending';
          const label       = booked.status === 'confirmed' ? '✓ ' + (booked.name || '') : '⏳ ' + (booked.name || 'Pending');
          html += `
            <div class="tl-cell ${statusClass}"
                 style="grid-column: span ${span}; position:relative;">
              <div class="tl-block ${booked.status}" title="${label}">${label}</div>
            </div>`;
          h += span - 1; // skip merged hours (the for-loop will h++ so subtract 1)
        }
      } else {
        html += '<div class="tl-cell"></div>';
      }
    }
  });

  html += '</div>';

  // Date heading
  const dLabel = document.createElement('div');
  dLabel.style.cssText = 'font-family:var(--font-body);font-size:.56rem;letter-spacing:.14em;color:var(--warm-grey);margin-bottom:8px;text-transform:uppercase;';
  dLabel.textContent = formatDate(dateStr);

  wrap.innerHTML = '';
  wrap.appendChild(dLabel);
  wrap.insertAdjacentHTML('beforeend', html);
}


/* ================================================================
   9. BOOKING FORM
================================================================ */
let currentStep = 1;
let selectedEquip = {}; // { key: price }

// ── Step navigation ──
function goStep(n) {
  if (n > currentStep && !validateStep(currentStep)) return;

  document.getElementById('fs' + currentStep).classList.remove('active');
  markStep(currentStep, 'done');

  currentStep = n;
  document.getElementById('fs' + currentStep).classList.add('active');
  markStep(currentStep, 'active');

  if (n === 5) renderSummary();
}

function markStep(n, state) {
  const el = document.getElementById('sp' + n);
  el.classList.remove('active', 'done');
  el.classList.add(state);
}

function validateStep(n) {
  if (n === 1) {
    if (!document.querySelector('input[name="zone"]:checked')) {
      showToast('Vui lòng chọn khu vực.'); return false;
    }
  }
  if (n === 2) {
    if (!document.getElementById('fDate').value) {
      showToast('Vui lòng chọn ngày.'); return false;
    }
    if (!document.getElementById('fStart').value) {
      showToast('Vui lòng chọn giờ bắt đầu.'); return false;
    }
    if (!document.getElementById('fEnd').value) {
      showToast('Vui lòng chọn giờ kết thúc.'); return false;
    }
    const start = parseInt(document.getElementById('fStart').value);
    const end   = parseInt(document.getElementById('fEnd').value);
    if (end <= start) {
      showToast('Giờ kết thúc phải sau giờ bắt đầu.'); return false;
    }
    if (document.getElementById('conflictWarn').style.display !== 'none') {
      showToast('Khung giờ đang bị trùng lịch. Vui lòng chọn giờ khác.'); return false;
    }
  }
  if (n === 4) {
    if (!document.getElementById('fName').value.trim()) {
      showToast('Vui lòng nhập họ tên.'); return false;
    }
    if (!document.getElementById('fPhone').value.trim()) {
      showToast('Vui lòng nhập số điện thoại.'); return false;
    }
  }
  return true;
}

// ── Event handlers ──
function onZoneChange() {
  checkConflict();
  updateDurationInfo();
}

function onDateChange() {
  const dateStr = document.getElementById('fDate').value;
  if (dateStr) {
    // Sync calendar selection
    calSelectedDay = dateStr;
    const d = new Date(dateStr);
    calDate  = new Date(d.getFullYear(), d.getMonth(), 1);
    renderCalendar();
    renderTimeline(dateStr);
  }
  checkConflict();
}

function onTimeChange() {
  updateDurationInfo();
  checkConflict();
}

function updateDurationInfo() {
  const zone  = getSelectedZone();
  const start = document.getElementById('fStart').value;
  const end   = document.getElementById('fEnd').value;
  const info  = document.getElementById('durationInfo');

  if (!start || !end || !zone) { info.style.display = 'none'; return; }

  const sh    = parseInt(start);
  const eh    = parseInt(end);
  const hours = eh - sh;
  if (hours <= 0) { info.style.display = 'none'; return; }

  const total = calcPrice(zone, hours);
  const priceStr = zone === 'Full' ? 'Liên hệ báo giá' : total.toLocaleString() + 'K';

  info.style.display = 'block';
  info.innerHTML = `
    Thời gian: <strong>${start} — ${end}</strong> (${hours} giờ)&nbsp;&nbsp;·&nbsp;&nbsp;
    Tạm tính: <strong style="color:var(--red)">${priceStr}</strong>
  `;
}

function checkConflict() {
  const zone  = getSelectedZone();
  const date  = document.getElementById('fDate').value;
  const start = document.getElementById('fStart').value;
  const end   = document.getElementById('fEnd').value;
  const warn  = document.getElementById('conflictWarn');

  if (!zone || !date || !start || !end) { warn.style.display = 'none'; return; }

  const sh = parseInt(start);
  const eh = parseInt(end);
  const hasConflict = getBookings().some(b => {
    if (b.status === 'rejected') return false;
    if (b.date !== date) return false;
    // Check zone overlap (Full House blocks everything)
    const zoneMatch = b.zone === zone || b.zone === 'Full' || zone === 'Full';
    if (!zoneMatch) return false;
    // Time overlap check: existing.start < new.end && existing.end > new.start
    const bs = parseInt((b.startTime || '08:00').split(':')[0]);
    const be = parseInt((b.endTime   || '10:00').split(':')[0]);
    return sh < be && eh > bs;
  });

  warn.style.display = hasConflict ? 'block' : 'none';
}

function toggleTag(btn) {
  btn.classList.toggle('active');
}

function toggleEquip(el) {
  const key   = el.dataset.key;
  const price = parseInt(el.dataset.price);
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) selectedEquip[key] = price;
  else delete selectedEquip[key];
}

// ── Pricing ──
const BASE_PRICES = { O: 600, C: 500, Full: 0 };   // for first 2h
const ADD_PRICES  = { O: 250, C: 200, Full: 0 };    // per extra hour

function calcPrice(zone, hours) {
  if (!zone || zone === 'Full') return 0;
  const base    = BASE_PRICES[zone] || 0;
  const addH    = Math.max(0, hours - 2);
  const addRate = ADD_PRICES[zone] || 0;
  const equip   = Object.values(selectedEquip).reduce((a, b) => a + b, 0);
  return base + addH * addRate + equip;
}

// ── Summary (Step 5) ──
function renderSummary() {
  const zone     = getSelectedZone();
  const date     = document.getElementById('fDate').value;
  const start    = document.getElementById('fStart').value;
  const end      = document.getElementById('fEnd').value;
  const name     = document.getElementById('fName').value;
  const phone    = document.getElementById('fPhone').value;
  const note     = document.getElementById('fNote').value;
  const purposes = [...document.querySelectorAll('.tag-btn.active')].map(b => b.textContent).join(', ');
  const equips   = Object.keys(selectedEquip).join(', ') || 'Không';
  const hours    = end && start ? parseInt(end) - parseInt(start) : 0;
  const total    = calcPrice(zone, hours);
  const deposit  = Math.round(total / 2);

  const zoneLabel = { O: '"O" Zone · 1F', C: '"C" Zone · 2F', Full: 'Full House' }[zone] || zone;

  document.getElementById('summaryBox').innerHTML = `
    <div class="sum-row"><span>Khu vực</span><span>${zoneLabel}</span></div>
    <div class="sum-row"><span>Ngày</span><span>${formatDate(date)}</span></div>
    <div class="sum-row"><span>Thời gian</span><span>${start} — ${end} (${hours} giờ)</span></div>
    <div class="sum-row"><span>Mục đích</span><span>${purposes || '—'}</span></div>
    <div class="sum-row"><span>Thiết bị thuê</span><span>${equips}</span></div>
    <div class="sum-row"><span>Họ tên</span><span>${name}</span></div>
    <div class="sum-row"><span>SĐT / Zalo</span><span>${phone}</span></div>
    ${note ? `<div class="sum-row"><span>Ghi chú</span><span>${note}</span></div>` : ''}
    <div class="sum-row total">
      <span>Tổng cộng</span>
      <span>${zone === 'Full' ? 'Liên hệ' : total.toLocaleString() + 'K'}</span>
    </div>
    <div class="sum-row">
      <span>Đặt cọc 50%</span>
      <span style="color:var(--red);font-weight:600;">${zone === 'Full' ? '—' : deposit.toLocaleString() + 'K'}</span>
    </div>
  `;
}

// ── Submit ──
function submitBooking() {
  const zone  = getSelectedZone();
  const date  = document.getElementById('fDate').value;
  const start = document.getElementById('fStart').value;
  const end   = document.getElementById('fEnd').value;
  const name  = document.getElementById('fName').value.trim();
  const phone = document.getElementById('fPhone').value.trim();

  if (!zone || !date || !start || !end || !name || !phone) {
    showToast('Vui lòng điền đầy đủ thông tin.'); return;
  }

  const hours   = parseInt(end) - parseInt(start);
  const total   = calcPrice(zone, hours);
  const deposit = Math.round(total / 2);
  const purposes = [...document.querySelectorAll('.tag-btn.active')].map(b => b.textContent);

  const booking = addBooking({
    name, phone, zone,
    date, startTime: start, endTime: end, hours,
    equipments: Object.keys(selectedEquip),
    purposes,
    note: document.getElementById('fNote').value,
    total, deposit
  });

  // Refresh calendar to show new booking
  renderCalendar();
  if (calSelectedDay === date) renderTimeline(date);

  // Show QR payment modal
  showQRModal(booking);

  // Reset form
  resetForm();
}

function showQRModal(booking) {
  const amount    = booking.zone === 'Full' ? 'Liên hệ' : (booking.deposit || 0).toLocaleString() + 'K';
  const content   = `KEP ${booking.id}`;
  const qrData    = encodeURIComponent(`MOMO:0xxx-${content}-${amount}`);
  const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrData}`;

  document.getElementById('qrImg').src      = qrUrl;
  document.getElementById('qrAmount').textContent  = amount;
  document.getElementById('qrContent').textContent = content;

  openModal('qrModal');
}

function resetForm() {
  currentStep = 1;
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById('fs1').classList.add('active');
  [1,2,3,4,5].forEach(n => { markStep(n, n === 1 ? 'active' : ''); });

  document.querySelectorAll('input[name="zone"]').forEach(r => r.checked = false);
  document.getElementById('fDate').value  = '';
  document.getElementById('fStart').value = '';
  document.getElementById('fEnd').value   = '';
  document.getElementById('fName').value  = '';
  document.getElementById('fPhone').value = '';
  document.getElementById('fNote').value  = '';
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.equip-item').forEach(e => e.classList.remove('selected'));
  Object.keys(selectedEquip).forEach(k => delete selectedEquip[k]);
  document.getElementById('durationInfo').style.display  = 'none';
  document.getElementById('conflictWarn').style.display  = 'none';
}

// ── Expose to HTML ──
window.goStep     = goStep;
window.onZoneChange  = onZoneChange;
window.onDateChange  = onDateChange;
window.onTimeChange  = onTimeChange;
window.toggleTag  = toggleTag;
window.toggleEquip = toggleEquip;
window.submitBooking = submitBooking;


/* ================================================================
   10. ADMIN PANEL
================================================================ */
const ADMIN_PASSWORD = 'kep2025';
let adminFilter = 'all';

function openLogin() { openModal('loginModal'); }

function tryLogin() {
  const pw = document.getElementById('adminPw').value;
  if (pw === ADMIN_PASSWORD) {
    closeModal('loginModal');
    document.getElementById('adminPw').value = '';
    document.getElementById('loginError').style.display = 'none';
    openAdminPanel();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}

function openAdminPanel() {
  document.getElementById('adminPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderAdmin();
}

function closeAdmin() {
  document.getElementById('adminPanel').classList.remove('open');
  document.body.style.overflow = '';
}

function renderAdmin() {
  const all = getBookings();

  // Stats
  const counts = {
    pending:   all.filter(b => b.status === 'pending').length,
    confirmed: all.filter(b => b.status === 'confirmed').length,
    rejected:  all.filter(b => b.status === 'rejected').length,
    revenue:   all.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.total || 0), 0)
  };

  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card"><div class="stat-lbl">Chờ duyệt</div><div class="stat-val red">${counts.pending}</div></div>
    <div class="stat-card"><div class="stat-lbl">Đã xác nhận</div><div class="stat-val">${counts.confirmed}</div></div>
    <div class="stat-card"><div class="stat-lbl">Từ chối</div><div class="stat-val">${counts.rejected}</div></div>
    <div class="stat-card"><div class="stat-lbl">Doanh thu</div><div class="stat-val">${counts.revenue.toLocaleString()}K</div></div>
  `;

  renderAdminTable(all);
}

function filterBookings(f, btn) {
  adminFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAdminTable(getBookings());
}

function renderAdminTable(all) {
  const rows = adminFilter === 'all' ? all : all.filter(b => b.status === adminFilter);
  const tbody = document.getElementById('adminTbody');

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--warm-grey);padding:24px;">Không có booking nào.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((b, i) => `
    <tr>
      <td style="font-size:.5rem;color:var(--warm-grey);">${b.id || i + 1}</td>
      <td>${b.name || '—'}</td>
      <td>${b.phone || '—'}</td>
      <td>${b.zone || '—'}</td>
      <td>${b.date || '—'}</td>
      <td>${b.startTime || '—'} – ${b.endTime || '—'}</td>
      <td>${b.total ? b.total.toLocaleString() + 'K' : 'Liên hệ'}</td>
      <td><span class="status-badge s-${b.status}">${statusLabel(b.status)}</span></td>
      <td>
        <div class="action-btns">
          ${b.status !== 'confirmed' ? `<button class="act-btn act-confirm" onclick="actBooking('${b.id}','confirmed')">✓ Duyệt</button>` : ''}
          ${b.status !== 'rejected'  ? `<button class="act-btn act-reject"  onclick="actBooking('${b.id}','rejected')">✕ Từ chối</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function actBooking(id, status) {
  updateBookingStatus(id, status);
  renderAdmin();
  renderCalendar();
  if (calSelectedDay) renderTimeline(calSelectedDay);
  showToast(status === 'confirmed' ? '✓ Đã xác nhận booking.' : 'Đã cập nhật trạng thái.');
}

function statusLabel(s) {
  return { pending: 'Chờ duyệt', confirmed: 'Đã xác nhận', rejected: 'Từ chối' }[s] || s;
}

// Expose to HTML
window.openLogin       = openLogin;
window.tryLogin        = tryLogin;
window.closeAdmin      = closeAdmin;
window.filterBookings  = filterBookings;
window.actBooking      = actBooking;


/* ================================================================
   11. UTILITIES
================================================================ */

// Modal open/close
function openModal(id) {
  document.getElementById(id).classList.add('show');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}
// Close modal when clicking overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
});
window.openModal  = openModal;
window.closeModal = closeModal;

// Toast
function showToast(msg, dur = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

// Date helpers
function toDateStr(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function formatDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function getSelectedZone() {
  const r = document.querySelector('input[name="zone"]:checked');
  return r ? r.value : '';
}


/* ================================================================
   INIT
================================================================ */
renderCalendar();
