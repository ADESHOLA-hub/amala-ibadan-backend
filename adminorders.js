// adminorders.js
const API_BASE = "http://localhost:5000/api";

let allOrders = [];
let activeStatus = "all";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

document.addEventListener("DOMContentLoaded", () => {
  loadOrders();

  document.getElementById("statusFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;
    activeStatus = btn.dataset.status;
    document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active-pill"));
    btn.classList.add("active-pill");
    renderOrders();
  });

  // Auto-refresh every 30s so new orders show up without manual reload
  setInterval(loadOrders, 30000);
});

async function loadOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    allOrders = data.data;
    renderStats();
    renderOrders();
  } catch (err) {
    showToast("Couldn't load orders. Is the server running?", true);
    document.getElementById("ordersTableBody").innerHTML =
      `<tr><td colspan="8" class="empty-state-text">Failed to load orders.</td></tr>`;
  }
}

function renderStats() {
  const todayStr = new Date().toDateString();
  const todayOrders = allOrders.filter((o) => new Date(o.createdAt).toDateString() === todayStr);
  const revenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  document.getElementById("statsBar").textContent =
    `Today: ${todayOrders.length} orders · ₦${revenue.toLocaleString()} revenue`;
}

function renderOrders() {
  const tbody = document.getElementById("ordersTableBody");
  const filtered = activeStatus === "all" ? allOrders : allOrders.filter((o) => o.status === activeStatus);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state-text">No orders here yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((order) => {
      const itemsSummary = order.items
        .map((i) => `${i.quantity}× ${escapeHtml(i.name)}`)
        .join(", ");

      const statusOptions = STATUS_FLOW.map(
        (s) => `<option value="${s}" ${s === order.status ? "selected" : ""}>${capitalize(s)}</option>`
      ).join("");

      return `
        <tr>
          <td><strong>${order.orderNumber}</strong></td>
          <td>
            ${escapeHtml(order.customerName)}<br>
            <span style="color:#888;font-size:0.82rem;">${escapeHtml(order.customerPhone || "—")}</span>
          </td>
          <td class="order-items-cell">${itemsSummary}</td>
          <td>${capitalize(order.type)}${order.deliveryAddress ? `<br><span style="color:#888;font-size:0.8rem;">${escapeHtml(order.deliveryAddress)}</span>` : ""}</td>
          <td>₦${order.total.toLocaleString()}</td>
          <td>
            <span class="status-badge status-${order.status}">${order.status}</span>
          </td>
          <td style="color:#888;font-size:0.82rem;">${formatTime(order.createdAt)}</td>
          <td>
            <select class="status-select" onchange="updateStatus('${order._id}', this.value)">
              ${statusOptions}
            </select>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function updateStatus(orderId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    showToast(`Order updated to "${newStatus}"`);
    loadOrders();
  } catch (err) {
    showToast(err.message || "Could not update order", true);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show" + (isError ? " toast-error" : "");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
