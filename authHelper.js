// authHelper.js
// Include this script FIRST (before any other admin script) on EVERY ADMIN page only.
// Do NOT include this on public pages (menu.html, order.html, index.html, etc.)
// — it will force-redirect any page it's loaded on straight to login.html.

const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 hours

(function () {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Check how long it's been since the last recorded activity
  const lastActive = parseInt(localStorage.getItem('adminLastActive') || '0', 10);
  const now = Date.now();

  if (lastActive && (now - lastActive > INACTIVITY_LIMIT_MS)) {
    // Been inactive too long — force logout
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminLastActive');
    window.location.href = 'login.html';
    return;
  }

  // Still within the window — refresh the "last active" timestamp
  localStorage.setItem('adminLastActive', now.toString());
})();

// Reset the inactivity timer on real user activity
['click', 'keydown', 'mousemove', 'scroll'].forEach((evt) => {
  window.addEventListener(evt, () => {
    localStorage.setItem('adminLastActive', Date.now().toString());
  }, { passive: true });
});

// Periodically check in the background (every minute) in case the page
// is left open with no activity at all — logs out once the limit is hit
setInterval(() => {
  const lastActive = parseInt(localStorage.getItem('adminLastActive') || '0', 10);
  if (lastActive && (Date.now() - lastActive > INACTIVITY_LIMIT_MS)) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminLastActive');
    window.location.href = 'login.html';
  }
}, 60 * 1000);

// Call this from any admin fetch() call to attach the auth header, e.g.:
//   fetch(url, { headers: authHeaders() })
function authHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// If the backend ever responds 401 (expired/invalid token), call this to log out
function handleAuthError(response) {
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminLastActive');
    window.location.href = 'login.html';
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUsername');
  localStorage.removeItem('adminLastActive');
  window.location.href = 'login.html';
}