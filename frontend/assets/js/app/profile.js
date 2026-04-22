// ============================================================
// profile.js  —  Profile page logic
// ============================================================

import { getUser } from "../auth/authService.js";
import { apiFetch } from "../services/api.js";

// ── Sidebar ───────────────────────────────────────────────
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

// ── DOM refs ──────────────────────────────────────────────
const profileAvatar      = document.getElementById("profileAvatar");
const profileDisplayName = document.getElementById("profileDisplayName");
const profileHandle      = document.getElementById("profileHandle");
const profileJoined      = document.getElementById("profileJoined");

const inputUsername = document.getElementById("inputUsername");
const inputEmail    = document.getElementById("inputEmail");
const inputFullname = document.getElementById("inputFullname");
const inputLocation = document.getElementById("inputLocation");
const inputBio      = document.getElementById("inputBio");
const saveProfileBtn= document.getElementById("saveProfileBtn");
const profileMsg    = document.getElementById("profileMsg");

const pwCurrent  = document.getElementById("pwCurrent");
const pwNew      = document.getElementById("pwNew");
const pwConfirm  = document.getElementById("pwConfirm");
const changePwBtn= document.getElementById("changePwBtn");
const pwMsg      = document.getElementById("pwMsg");

const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const shareProfileBtn  = document.getElementById("shareProfileBtn");

// Platform modal
const platformModal         = document.getElementById("platformModal");
const platformModalTitle    = document.getElementById("platformModalTitle");
const platformModalLabel    = document.getElementById("platformModalLabel");
const platformUsernameInput = document.getElementById("platformUsernameInput");
const closePlatformModal    = document.getElementById("closePlatformModal");
const confirmPlatformConnect= document.getElementById("confirmPlatformConnect");
const platformModalMsg      = document.getElementById("platformModalMsg");

let currentPlatformKey = null;

// ── Load profile ──────────────────────────────────────────
async function loadProfile() {
  try {
    const data = await apiFetch("/auth/me");
    populateProfile(data.user || data);
  } catch {
    // Fallback to localStorage user
    if (user) populateProfile(user);
  }
}

function populateProfile(u) {
  const initials = (u.username || u.email || "?").slice(0, 2).toUpperCase();
  profileAvatar.textContent      = initials;
  profileDisplayName.textContent = u.fullname || u.username || "Anonymous";
  profileHandle.textContent      = `@${u.username || "unknown"}`;

  if (u.createdAt || u.created_at) {
    const d = new Date(u.createdAt || u.created_at);
    profileJoined.textContent = `Member since ${d.toLocaleDateString("en-GB",{month:"short",year:"numeric"})}`;
  }

  // Form fields
  inputUsername.value = u.username || "";
  inputEmail.value    = u.email    || "";
  inputFullname.value = u.fullname || "";
  inputLocation.value = u.location || "";
  inputBio.value      = u.bio      || "";

  // Platform connections
  if (u.platforms) {
    setPlatformStatus("lc", u.platforms.leetcode);
    setPlatformStatus("cf", u.platforms.codeforces);
    setPlatformStatus("hr", u.platforms.hackerrank);
  }
}

function setPlatformStatus(key, username) {
  const usernameEl = document.getElementById(`${key}Username`);
  const statusEl   = document.getElementById(`${key}Status`);
  const btnEl      = document.getElementById(`${key}ConnectBtn`);

  if (username) {
    usernameEl.textContent   = `@${username}`;
    statusEl.textContent     = "● Connected";
    statusEl.className       = "connect-status connected";
    btnEl.textContent        = "Disconnect";
    btnEl.style.borderColor  = "var(--danger)";
    btnEl.style.color        = "var(--danger)";
    btnEl.style.background   = "rgba(248,113,113,0.1)";
  } else {
    usernameEl.textContent   = "Not connected";
    statusEl.textContent     = "● Disconnected";
    statusEl.className       = "connect-status disconnected";
    btnEl.textContent        = "Connect";
    btnEl.style.borderColor  = "";
    btnEl.style.color        = "";
    btnEl.style.background   = "";
  }
}

// ── Save profile ──────────────────────────────────────────
saveProfileBtn.addEventListener("click", async () => {
  const payload = {
    username: inputUsername.value.trim(),
    fullname: inputFullname.value.trim(),
    location: inputLocation.value.trim(),
    bio:      inputBio.value.trim(),
  };

  if (!payload.username) {
    showMsg(profileMsg, "Username cannot be empty.", "var(--danger)"); return;
  }

  saveProfileBtn.textContent = "Saving...";
  saveProfileBtn.disabled    = true;

  try {
    const updated = await apiFetch("/auth/profile", { method: "PUT", body: JSON.stringify(payload) });
    const u = updated.user || updated;
    // Sync localStorage
    const stored = getUser() || {};
    localStorage.setItem("user", JSON.stringify({ ...stored, ...u }));
    populateProfile({ ...stored, ...u });
    showMsg(profileMsg, "✅ Profile updated!", "var(--accent)");
  } catch {
    showMsg(profileMsg, "❌ Failed to save changes.", "var(--danger)");
  } finally {
    saveProfileBtn.textContent = "Save Changes";
    saveProfileBtn.disabled    = false;
  }
});

// ── Change password ───────────────────────────────────────
changePwBtn.addEventListener("click", async () => {
  const current = pwCurrent.value;
  const newPw   = pwNew.value;
  const confirm = pwConfirm.value;

  if (!current || !newPw || !confirm) {
    showMsg(pwMsg, "Please fill in all password fields.", "var(--danger)"); return;
  }
  if (newPw !== confirm) {
    showMsg(pwMsg, "New passwords do not match.", "var(--danger)"); return;
  }
  if (newPw.length < 6) {
    showMsg(pwMsg, "New password must be at least 6 characters.", "var(--danger)"); return;
  }

  changePwBtn.textContent = "Updating...";
  changePwBtn.disabled    = true;

  try {
    await apiFetch("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
    });
    pwCurrent.value = pwNew.value = pwConfirm.value = "";
    showMsg(pwMsg, "✅ Password updated!", "var(--accent)");
  } catch (err) {
    showMsg(pwMsg, err.message || "❌ Incorrect current password.", "var(--danger)");
  } finally {
    changePwBtn.textContent = "Update Password";
    changePwBtn.disabled    = false;
  }
});

// ── Platform connect modal ────────────────────────────────
const platformMeta = {
  lc: { title: "Connect LeetCode", label: "LeetCode Username", key: "leetcode" },
  cf: { title: "Connect Codeforces", label: "Codeforces Handle", key: "codeforces" },
  hr: { title: "Connect HackerRank", label: "HackerRank Username", key: "hackerrank" },
};

["lc","cf","hr"].forEach(key => {
  document.getElementById(`${key}ConnectBtn`).addEventListener("click", () => {
    const meta = platformMeta[key];
    currentPlatformKey         = key;
    platformModalTitle.textContent = meta.title;
    platformModalLabel.textContent = meta.label;
    platformUsernameInput.value    = "";
    platformModalMsg.textContent   = "";
    platformModal.style.display    = "flex";
  });
});

closePlatformModal.addEventListener("click", () => { platformModal.style.display = "none"; });
platformModal.addEventListener("click", e => { if (e.target === platformModal) platformModal.style.display = "none"; });

confirmPlatformConnect.addEventListener("click", async () => {
  const username = platformUsernameInput.value.trim();
  if (!username) { platformModalMsg.textContent = "Please enter a username."; platformModalMsg.style.color="var(--danger)"; return; }

  confirmPlatformConnect.textContent = "Connecting...";
  confirmPlatformConnect.disabled    = true;

  try {
    const meta = platformMeta[currentPlatformKey];
    await apiFetch("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ platforms: { [meta.key]: username } }),
    });
    setPlatformStatus(currentPlatformKey, username);
    platformModal.style.display = "none";
  } catch {
    platformModalMsg.textContent = "❌ Failed to connect. Try again.";
    platformModalMsg.style.color = "var(--danger)";
  } finally {
    confirmPlatformConnect.textContent = "Connect";
    confirmPlatformConnect.disabled    = false;
  }
});

// ── Delete account ────────────────────────────────────────
deleteAccountBtn.addEventListener("click", () => {
  const confirmed = confirm("⚠️ Are you absolutely sure?\n\nThis will permanently delete your account and all problem data. This cannot be undone.");
  if (!confirmed) return;
  const typedConfirm = prompt('Type "DELETE" to confirm:');
  if (typedConfirm !== "DELETE") { alert("Account deletion cancelled."); return; }

  apiFetch("/auth/account", { method: "DELETE" })
    .then(() => {
      localStorage.clear();
      window.location.href = "../auth/login.html";
    })
    .catch(() => alert("Failed to delete account. Please try again or contact support."));
});

// ── Share profile ─────────────────────────────────────────
shareProfileBtn.addEventListener("click", () => {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: "My Ludiflex Profile", url });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      shareProfileBtn.textContent = "Link copied!";
      setTimeout(() => { shareProfileBtn.textContent = "Share Profile"; }, 2000);
    });
  }
});

// ── Util ──────────────────────────────────────────────────
function showMsg(el, text, color) {
  el.textContent = text;
  el.style.color = color;
  setTimeout(() => { el.textContent = ""; }, 4000);
}

// ── Boot ──────────────────────────────────────────────────
loadProfile();