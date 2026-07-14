// accountscript.js
document.addEventListener("DOMContentLoaded", () => {
  // Protect this page — redirect to login if not authenticated
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const user = getCurrentUser();
  document.getElementById("welcomeName").textContent = `Hi, ${user?.name || "there"}`;
  document.getElementById("welcomeEmail").textContent = user?.email || "";

  document.getElementById("logoutBtn").addEventListener("click", logout);

  loadOrderHistory();
});

async function loadOrderHistory() {
  const listEl = document.getElementById("orderHistoryList");

  try {
    const res = await fetch(`${AUTH_API_BASE}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();

    if (res.status === 401) {
      // Token expired/invalid — send back to login
      logout();
      return;
    }

    if (!data.success) throw new Error(data.message || "Could not load order history");

    if (data.data.length === 0) {
      listEl.innerHTML = `<p class="empty-state-text">You haven't placed any orders yet. <a href="order.html" style="color:#e08414;">Order something delicious →</a></p>`;
      return;
    }

    listEl.innerHTML = data.data.map(renderOrderCard).join("");
  } catch (err) {
    listEl.innerHTML = `<p class="empty-state-text">Couldn't load your orders. Please try again.</p>`;
  }
}

function renderOrderCard(order) {
  const itemsSummary = order.items.map((i) => `${i.quantity}× ${escapeHtmlAuth(i.name)}`).join(", ");
  const date = new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  return `
    <div class="order-history-card">
      <div class="order-history-top">
        <span class="order-history-number">${order.orderNumber}</span>
        <span class="status-badge status-${order.status}">${order.status}</span>
      </div>
      <div class="order-history-date">${date} · ${capitalizeAuth(order.type)}</div>
      <div class="order-history-items">${itemsSummary}</div>
      <div class="order-history-bottom">
        <span class="order-history-total">₦${order.total.toLocaleString()}</span>
        <a href="track.html?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customerPhone)}" style="font-size:0.85rem; color:#e08414;">Track this order →</a>
      </div>
    </div>
  `;
}

function capitalizeAuth(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
