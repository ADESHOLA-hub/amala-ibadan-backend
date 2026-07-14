// authHelper.js
// Shared across pages. Manages the logged-in user's token and basic info.
// Uses localStorage so the login persists across page reloads/visits.

const AUTH_API_BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("authToken");
}

function getCurrentUser() {
  const raw = localStorage.getItem("authUser");
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function saveAuth(token, user) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("authUser", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  window.location.href = "login.html";
}

// Updates any nav bar on the page to show "Account / Logout" vs "Sign Up / Login"
// Call this on DOMContentLoaded on every page that includes this script.
function updateAuthNav() {
  const slot = document.getElementById("authNavSlot");
  if (!slot) return;

  if (isLoggedIn()) {
    const user = getCurrentUser();
    slot.innerHTML = `
      <li><a href="account.html">${escapeHtmlAuth(user?.name || "Account")}</a></li>
      <li><a href="#" id="logoutLink">Logout</a></li>
    `;
    document.getElementById("logoutLink").addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    slot.innerHTML = `
      <li><a href="login.html">Login</a></li>
      <li><a href="signup.html">Sign Up</a></li>
    `;
  }
}

function escapeHtmlAuth(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", updateAuthNav);
