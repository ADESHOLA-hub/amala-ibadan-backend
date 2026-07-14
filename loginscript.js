// loginscript.js
document.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) {
    window.location.href = "account.html";
    return;
  }

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
});

async function handleLogin(e) {
  e.preventDefault();
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";

  const payload = {
    email: document.getElementById("loginEmail").value.trim(),
    password: document.getElementById("loginPassword").value,
  };

  const btn = document.getElementById("loginBtn");
  btn.disabled = true;
  btn.textContent = "Logging in...";

  try {
    const res = await fetch(`${AUTH_API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Could not log in");

    saveAuth(data.data.token, data.data.user);
    window.location.href = "account.html";
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Log In";
  }
}
