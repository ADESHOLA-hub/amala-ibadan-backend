// trackscript.js
const API_BASE = "http://localhost:5000/api";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "delivered"];

let refreshTimer = null;
let currentLookup = null; // { orderNumber, phone }

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("trackForm").addEventListener("submit", handleTrackSubmit);

  // If arriving fresh from placing an order, the URL carries the order
  // number and phone so we can auto-fill and auto-track immediately.
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get("orderNumber");
  const phone = urlParams.get("phone");

  if (orderNumber && phone) {
    document.getElementById("orderNumberInput").value = orderNumber;
    document.getElementById("phoneInput").value = phone;
    currentLookup = { orderNumber, phone };
    showFreshOrderBanner();
    fetchAndRenderOrder();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(fetchAndRenderOrder, 20000);
  }
});

function showFreshOrderBanner() {
  // Create a full confirmation popup
  const popup = document.createElement("div");
  popup.id = "orderConfirmPopup";
  popup.innerHTML = `
    <div class="confirm-popup-box">
      <div class="confirm-popup-icon">🎉</div>
      <h2>Order Placed!</h2>
      <p>Your order has been received.</p>
      <p>We're preparing it now — track your progress below.</p>
      <button onclick="document.getElementById('orderConfirmPopup').remove()">Got it</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    const el = document.getElementById("orderConfirmPopup");
    if (el) el.remove();
  }, 4000);
}

async function handleTrackSubmit(e) {
  e.preventDefault();
  const orderNumber = document.getElementById("orderNumberInput").value.trim();
  const phone = document.getElementById("phoneInput").value.trim();

  currentLookup = { orderNumber, phone };
  await fetchAndRenderOrder();

  // Start auto-refresh every 20 seconds while the page stays open
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(fetchAndRenderOrder, 20000);
}

async function fetchAndRenderOrder() {
  if (!currentLookup) return;
  const errorEl = document.getElementById("trackError");
  const resultEl = document.getElementById("trackResult");
  const btn = document.getElementById("trackBtn");

  errorEl.textContent = "";
  btn.disabled = true;
  btn.textContent = "Looking up...";

  try {
    const params = new URLSearchParams({
      orderNumber: currentLookup.orderNumber,
      phone: currentLookup.phone,
    });
    const res = await fetch(`${API_BASE}/orders/track?${params.toString()}`);
    const data = await res.json();

    if (!data.success) {
      resultEl.classList.remove("show");
      if (refreshTimer) clearInterval(refreshTimer);
      throw new Error(data.message || "Order not found");
    }

    renderOrder(data.data);
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Track Order";
  }
}

function renderOrder(order) {
  const resultEl = document.getElementById("trackResult");
  resultEl.classList.add("show");

  const placedTime = new Date(order.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let statusHtml = "";
  if (order.status === "cancelled") {
    statusHtml = `<div class="cancelled-banner">This order has been cancelled.</div>`;
  } else {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    statusHtml = `
      <div class="status-tracker">
        ${STATUS_FLOW.map((step, i) => {
          let cls = "";
          if (i < currentIndex) cls = "completed";
          if (i === currentIndex) cls = "current";
          return `
            <div class="status-step ${cls}">
              <div class="status-dot">${i < currentIndex ? "✓" : i + 1}</div>
              <div class="status-step-label">${step}</div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  const itemsHtml = order.items
    .map(
      (i) => `
      <div class="track-item-row">
        <span>${i.quantity}× ${escapeHtml(i.name)}</span>
        <span>₦${(i.price * i.quantity).toLocaleString()}</span>
      </div>
    `
    )
    .join("");

  resultEl.innerHTML = `
    <div class="track-order-number">${order.orderNumber}</div>
    <div class="track-placed-time">Placed ${placedTime} · ${capitalize(order.type)}</div>
    ${statusHtml}
    <div class="track-items-list">${itemsHtml}</div>
    <div class="track-totals">
      <div class="cart-row"><span>Subtotal</span><span>₦${order.subtotal.toLocaleString()}</span></div>
      <div class="cart-row"><span>Tax</span><span>₦${order.tax.toLocaleString()}</span></div>
      <div class="cart-row cart-total"><span>Total</span><span>₦${order.total.toLocaleString()}</span></div>
    </div>
  `;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}
