// ============================================================
// dashboard.js  —  Dashboard page logic
// ============================================================

import { getToken, getUser } from "../auth/authService.js";
import { apiFetch } from "../services/api.js";

// ── DOM refs ──────────────────────────────────────────────
const sidebarAvatar  = document.getElementById("sidebarAvatar");
const sidebarName    = document.getElementById("sidebarName");
const logoutBtn      = document.getElementById("logoutBtn");

const statTotal  = document.getElementById("statTotal");
const statStreak = document.getElementById("statStreak");
const statWeek   = document.getElementById("statWeek");
const statRate   = document.getElementById("statRate");

const ringEasy   = document.getElementById("ringEasy");
const ringTotal  = document.getElementById("ringTotal");
const valEasy    = document.getElementById("valEasy");
const valMedium  = document.getElementById("valMedium");
const valHard    = document.getElementById("valHard");
const barEasy    = document.getElementById("barEasy");
const barMedium  = document.getElementById("barMedium");
const barHard    = document.getElementById("barHard");

const heatmapGrid  = document.getElementById("heatmapGrid");
const activityList = document.getElementById("activityList");

// ── Init ──────────────────────────────────────────────────
const user = getUser();
if (user) {
  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();
  sidebarAvatar.textContent = initials;
  sidebarName.textContent   = user.username || user.email;
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "../auth/login.html";
});

// ── Load dashboard data ───────────────────────────────────
async function loadDashboard() {
  try {
    const data = await apiFetch("/problems/stats");
    renderStats(data);
    renderDifficultyRing(data.easy, data.medium, data.hard);
    renderHeatmap(data.heatmap || []);
    renderActivity(data.recent || []);
  } catch (err) {
    console.error("Dashboard load error:", err);
    // Show placeholder demo data so UI isn't empty
    const demo = {
      total: 128, streak: 7, week: 11, rate: "74%",
      easy: 68, medium: 45, hard: 15,
      heatmap: buildDemoHeatmap(),
      recent: buildDemoActivity(),
    };
    renderStats(demo);
    renderDifficultyRing(demo.easy, demo.medium, demo.hard);
    renderHeatmap(demo.heatmap);
    renderActivity(demo.recent);
  }
}

// ── Render helpers ────────────────────────────────────────
function renderStats({ total, streak, week, rate }) {
  statTotal.textContent  = total  ?? "—";
  statStreak.textContent = streak != null ? `${streak}d` : "—";
  statWeek.textContent   = week   ?? "—";
  statRate.textContent   = rate   ?? "—";
}

function renderDifficultyRing(easy = 0, medium = 0, hard = 0) {
  const total = easy + medium + hard;
  ringTotal.textContent = total;

  valEasy.textContent   = easy;
  valMedium.textContent = medium;
  valHard.textContent   = hard;

  // Animate bars
  setTimeout(() => {
    barEasy.style.width   = total ? `${(easy   / total) * 100}%` : "0%";
    barMedium.style.width = total ? `${(medium / total) * 100}%` : "0%";
    barHard.style.width   = total ? `${(hard   / total) * 100}%` : "0%";

    // Animate ring (uses easy as main indicator)
    const circ = 345.4;
    const offset = total ? circ - (easy / total) * circ : circ;
    ringEasy.style.strokeDashoffset = offset;
  }, 100);
}

function renderHeatmap(heatmapData) {
  // heatmapData: array of { date: "YYYY-MM-DD", count: N }
  const lookup = {};
  heatmapData.forEach(({ date, count }) => { lookup[date] = count; });

  const today = new Date();
  const cells = [];
  // Show last 52 weeks (364 days)
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const count = lookup[key] || 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
    cells.push({ date: key, level, count });
  }

  heatmapGrid.innerHTML = cells
    .map(c => `<div class="heatmap-cell" data-level="${c.level}" data-tooltip="${c.date}: ${c.count} solved"></div>`)
    .join("");
}

function renderActivity(recent) {
  if (!recent.length) {
    activityList.innerHTML = `<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:24px 0;">No activity yet — go solve some problems! 🚀</div>`;
    return;
  }

  activityList.innerHTML = recent.map(item => {
    const diffClass = (item.difficulty || "easy").toLowerCase();
    const icons = { easy: "✅", medium: "🟡", hard: "🔴" };
    const icon = icons[diffClass] || "✅";
    const ago = timeAgo(item.solvedAt || item.created_at);
    return `
      <div class="activity-item">
        <div class="activity-badge ${diffClass}">${icon}</div>
        <div class="activity-info">
          <div class="activity-name">${escHtml(item.title)}</div>
          <div class="activity-meta">${escHtml(item.platform || "")} · <span class="badge badge-${diffClass}">${item.difficulty}</span></div>
        </div>
        <span class="activity-time">${ago}</span>
      </div>
    `;
  }).join("");
}

// ── Demo placeholders (shown when API is unreachable) ────
function buildDemoHeatmap() {
  const arr = [];
  const today = new Date();
  for (let i = 0; i < 364; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    arr.push({ date: d.toISOString().split("T")[0], count: Math.random() > 0.6 ? Math.floor(Math.random() * 6) : 0 });
  }
  return arr;
}

function buildDemoActivity() {
  return [
    { title: "Two Sum", platform: "LeetCode", difficulty: "Easy",   solvedAt: new Date(Date.now() - 1e6) },
    { title: "Longest Palindromic Substring", platform: "LeetCode", difficulty: "Medium", solvedAt: new Date(Date.now() - 8e6) },
    { title: "Trapping Rain Water", platform: "LeetCode", difficulty: "Hard",   solvedAt: new Date(Date.now() - 2e7) },
    { title: "Binary Search", platform: "HackerRank", difficulty: "Easy",   solvedAt: new Date(Date.now() - 9e7) },
    { title: "Merge Intervals", platform: "LeetCode",  difficulty: "Medium", solvedAt: new Date(Date.now() - 1.5e8) },
  ];
}

// ── Utils ─────────────────────────────────────────────────
function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function escHtml(str = "") {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

loadDashboard();