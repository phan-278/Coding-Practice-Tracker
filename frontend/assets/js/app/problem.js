// ============================================================
// problems.js  —  Problems list page logic
// ============================================================

import { getUser } from "../auth/authService.js";
import { apiFetch } from "../services/api.js";

// ── Sidebar user ──────────────────────────────────────────
const user = getUser();
if (user) {
  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();
  document.getElementById("sidebarAvatar").textContent = initials;
  document.getElementById("sidebarName").textContent   = user.username || user.email;
}
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "../auth/login.html";
});

// ── State ─────────────────────────────────────────────────
let allProblems = [];
let filtered    = [];
let currentPage = 1;
const PAGE_SIZE = 15;

// ── DOM refs ──────────────────────────────────────────────
const problemsBody  = document.getElementById("problemsBody");
const pagination    = document.getElementById("pagination");
const searchInput   = document.getElementById("searchInput");
const diffFilter    = document.getElementById("diffFilter");
const statusFilter  = document.getElementById("statusFilter");
const sortFilter    = document.getElementById("sortFilter");
const platformBtns  = document.querySelectorAll("[data-platform]");
const addProblemBtn = document.getElementById("addProblemBtn");
const modalOverlay  = document.getElementById("modalOverlay");
const closeModal    = document.getElementById("closeModal");
const cancelModal   = document.getElementById("cancelModal");
const submitProblem = document.getElementById("submitProblem");
const modalMsg      = document.getElementById("modalMsg");

// ── Load problems ─────────────────────────────────────────
async function loadProblems() {
  try {
    const data = await apiFetch("/problems");
    allProblems = data.problems || data;
  } catch {
    // Demo data
    allProblems = buildDemoProblems();
  }
  applyFilters();
}

function applyFilters() {
  const q        = searchInput.value.trim().toLowerCase();
  const diff     = diffFilter.value;
  const status   = statusFilter.value;
  const sort     = sortFilter.value;
  const platform = document.querySelector("[data-platform].active")?.dataset.platform || "all";

  filtered = allProblems.filter(p => {
    if (q && !p.title.toLowerCase().includes(q)) return false;
    if (diff   !== "all" && p.difficulty !== diff)   return false;
    if (status !== "all" && p.status     !== status) return false;
    if (platform !== "all" && p.platform.toLowerCase() !== platform) return false;
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt||b.created_at) - new Date(a.createdAt||a.created_at);
    if (sort === "oldest") return new Date(a.createdAt||a.created_at) - new Date(b.createdAt||b.created_at);
    if (sort === "title")  return a.title.localeCompare(b.title);
    return 0;
  });

  currentPage = 1;
  renderTable();
  renderPagination();
}

function renderTable() {
  const start  = (currentPage - 1) * PAGE_SIZE;
  const slice  = filtered.slice(start, start + PAGE_SIZE);

  if (!slice.length) {
    problemsBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:40px 0;">No problems found. Try adjusting filters.</td></tr>`;
    return;
  }

  problemsBody.innerHTML = slice.map((p, i) => {
    const num      = start + i + 1;
    const diffCls  = (p.difficulty || "").toLowerCase();
    const statusCls= (p.status     || "").toLowerCase();
    const tags     = (p.tags || []).slice(0, 3).map(t => `<span class="platform-tag">${escHtml(t)}</span>`).join(" ");
    const date     = p.createdAt || p.created_at ? formatDate(p.createdAt || p.created_at) : "—";
    const link     = p.url
      ? `<a href="${escHtml(p.url)}" target="_blank" class="problem-title-link">${escHtml(p.title)}</a>`
      : `<span class="problem-title-link" style="cursor:default">${escHtml(p.title)}</span>`;

    return `
      <tr>
        <td style="color:var(--text-muted)">${num}</td>
        <td>${link}</td>
        <td><span class="platform-tag">${escHtml(p.platform || "—")}</span></td>
        <td><span class="badge badge-${diffCls}">${escHtml(p.difficulty || "—")}</span></td>
        <td><span class="badge badge-${statusCls}">${escHtml(p.status || "Unsolved")}</span></td>
        <td>${tags || "<span style='color:var(--text-muted)'>—</span>"}</td>
        <td style="color:var(--text-muted)">${date}</td>
        <td>
          <button onclick="deleteProblem('${p._id || p.id}')" style="color:var(--text-muted);font-size:15px;transition:color 0.15s;" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--text-muted)'" title="Delete">🗑</button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderPagination() {
  const total = Math.ceil(filtered.length / PAGE_SIZE);
  if (total <= 1) { pagination.innerHTML = ""; return; }

  const pages = [];
  pages.push(`<button class="page-btn" ${currentPage===1?"disabled":""} onclick="goPage(${currentPage-1})">‹</button>`);
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - currentPage) <= 1) {
      pages.push(`<button class="page-btn ${i===currentPage?"active":""}" onclick="goPage(${i})">${i}</button>`);
    } else if (Math.abs(i - currentPage) === 2) {
      pages.push(`<span style="color:var(--text-muted);align-self:center;">…</span>`);
    }
  }
  pages.push(`<button class="page-btn" ${currentPage===total?"disabled":""} onclick="goPage(${currentPage+1})">›</button>`);
  pagination.innerHTML = pages.join("");
}

window.goPage = (n) => { currentPage = n; renderTable(); renderPagination(); window.scrollTo({top:0,behavior:"smooth"}); };

// ── Delete ────────────────────────────────────────────────
window.deleteProblem = async (id) => {
  if (!id || !confirm("Delete this problem?")) return;
  try {
    await apiFetch(`/problems/${id}`, { method: "DELETE" });
    allProblems = allProblems.filter(p => (p._id || p.id) !== id);
    applyFilters();
  } catch(e) {
    alert("Failed to delete. Please try again.");
  }
};

// ── Platform filter buttons ───────────────────────────────
platformBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    platformBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});

// ── Other filters ─────────────────────────────────────────
searchInput.addEventListener("input", applyFilters);
diffFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);
sortFilter.addEventListener("change", applyFilters);

// ── Modal ─────────────────────────────────────────────────
function openModal()  { modalOverlay.style.display = "flex"; }
function closeModalFn() { modalOverlay.style.display = "none"; clearModal(); }
function clearModal() {
  ["mTitle","mPlatform","mDifficulty","mStatus","mUrl","mTags","mNotes"].forEach(id => {
    document.getElementById(id).value = "";
  });
  modalMsg.textContent = "";
}

addProblemBtn.addEventListener("click", openModal);
closeModal.addEventListener("click", closeModalFn);
cancelModal.addEventListener("click", closeModalFn);
modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) closeModalFn(); });

submitProblem.addEventListener("click", async () => {
  const title      = document.getElementById("mTitle").value.trim();
  const platform   = document.getElementById("mPlatform").value;
  const difficulty = document.getElementById("mDifficulty").value;
  const status     = document.getElementById("mStatus").value;
  const url        = document.getElementById("mUrl").value.trim();
  const tagsRaw    = document.getElementById("mTags").value.trim();
  const notes      = document.getElementById("mNotes").value.trim();

  if (!title || !platform || !difficulty) {
    modalMsg.textContent = "⚠️ Please fill in Title, Platform, and Difficulty.";
    modalMsg.style.color = "var(--danger)";
    return;
  }

  const payload = {
    title, platform, difficulty, status, url, notes,
    tags: tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [],
  };

  submitProblem.textContent = "Saving...";
  submitProblem.disabled = true;

  try {
    const newProblem = await apiFetch("/problems", { method: "POST", body: JSON.stringify(payload) });
    allProblems.unshift(newProblem.problem || newProblem);
    applyFilters();
    modalMsg.textContent = "✅ Problem added!";
    modalMsg.style.color = "var(--accent)";
    setTimeout(closeModalFn, 1000);
  } catch (err) {
    modalMsg.textContent = "❌ Failed to save. Please try again.";
    modalMsg.style.color = "var(--danger)";
  } finally {
    submitProblem.textContent = "Save Problem";
    submitProblem.disabled = false;
  }
});

// ── Helpers ───────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}
function escHtml(str = "") {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function buildDemoProblems() {
  const platforms = ["LeetCode","LeetCode","Codeforces","HackerRank","LeetCode"];
  const diffs     = ["Easy","Medium","Hard","Easy","Medium","Hard"];
  const statuses  = ["Solved","Attempted","Unsolved","Solved","Solved"];
  const tagSets   = [["array","hash-map"],["dp","memoization"],["graph","bfs"],["string","sliding-window"],["binary-search"]];
  const titles    = [
    "Two Sum","Longest Palindromic Substring","Trapping Rain Water",
    "Binary Search","Merge Intervals","Valid Parentheses","Climbing Stairs",
    "Maximum Subarray","Jump Game","Coin Change","Word Break","LRU Cache",
    "Find Median from Data Stream","Serialize and Deserialize Binary Tree","Course Schedule",
    "Number of Islands","Clone Graph","Pacific Atlantic Water Flow","Alien Dictionary","Minimum Window Substring",
  ];
  return titles.map((t, i) => ({
    _id: String(i + 1),
    title: t,
    platform: platforms[i % platforms.length],
    difficulty: diffs[i % diffs.length],
    status: statuses[i % statuses.length],
    tags: tagSets[i % tagSets.length],
    url: "#",
    createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  }));
}

// ── Boot ──────────────────────────────────────────────────
loadProblems();