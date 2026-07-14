// signupscript.js
document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, no need to sign up again
  if (isLoggedIn()) {
    window.location.href = "account.html";
    return;
  }

  document.getElementById("signupForm").addEventListener("submit", handleSignup);
});

async function handleSignup(e) {
  e.preventDefault();
  const errorEl = document.getElementById("signupError");
  errorEl.textContent = "";

  const payload = {
    name: document.getElementById("signupName").value.trim(),
    email: document.getElementById("signupEmail").value.trim(),
    phone: document.getElementById("signupPhone").value.trim(),
    password: document.getElementById("signupPassword").value,
  };

  const btn = document.getElementById("signupBtn");
  btn.disabled = true;
  btn.textContent = "Creating account...";

  try {
    const res = await fetch(`${AUTH_API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Could not create account");

    saveAuth(data.data.token, data.data.user);
    window.location.href = "account.html";
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign Up";
  }
}
