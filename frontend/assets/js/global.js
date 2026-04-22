const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../auth/login.html";
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../auth/login.html";
  });
}