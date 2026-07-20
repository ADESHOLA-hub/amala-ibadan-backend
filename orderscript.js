const API_BASE = "https://amala-ibadan-backend.onrender.com/api";
const WHATSAPP_NUMBER = "2347047777521"; // no + sign for wa.me links

let menuItems = [];
let cart = {};
let activeCategory = "all";

const categoryLabels = {
  all: "All",
  starters: "Starters",
  mains: "Meals & Soups",
  sides: "Swallows & Extras",
  desserts: "Desserts",
  drinks: "Drinks",
  specials: "Proteins",
};

window.addEventListener("load", () => {
  loadMenu();

  document.getElementById("orderType").addEventListener("change", (e) => {
    document.getElementById("deliveryFields").style.display =
      e.target.value === "delivery" ? "block" : "none";
  });

  document.getElementById("placeOrderBtn").addEventListener("click", handleWhatsAppOrder);
});

// ─── Menu loading ─────────────────────────────────────────────
async function loadMenu() {
  const menuListEl = document.getElementById("menuList");
  try {
    const res = await fetch(`${API_BASE}/menu`);
    if (!res.ok) throw new Error("Failed to fetch menu");
    const data = await res.json();
    menuItems = data.data || [];
    if (menuItems.length === 0) {
      menuListEl.innerHTML = `<p class="loading-text">No menu items available.</p>`;
      return;
    }
    renderCategoryFilters();
    renderMenu();
  } catch (err) {
    menuListEl.innerHTML = `<p class="loading-text">Couldn't load the menu. Please make sure the server is running.</p>`;
  }
}

function renderCategoryFilters() {
  const categories = ["all", ...new Set(menuItems.map((i) => i.category))];
  const container = document.getElementById("categoryFilters");
  container.innerHTML = categories
    .map((cat) => `<a href="#" data-category="${cat}" class="${cat === activeCategory ? "active-filter" : ""}">${categoryLabels[cat] || cat}</a>`)
    .join("");

  container.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      activeCategory = link.dataset.category;
      container.querySelectorAll("a").forEach((a) => a.classList.remove("active-filter"));
      link.classList.add("active-filter");
      renderMenu();
    });
  });
}

function renderMenu() {
  const menuListEl = document.getElementById("menuList");
  const filtered = activeCategory === "all" ? menuItems : menuItems.filter((i) => i.category === activeCategory);

  if (filtered.length === 0) {
    menuListEl.innerHTML = `<p class="loading-text">No items in this category.</p>`;
    return;
  }

  menuListEl.innerHTML = filtered.map((item) => {
    const imgSrc = item.image && item.image.trim() !== "" ? item.image : "images/logo2.png";
    return `
      <div class="order-item-card">
        <img src="${imgSrc}" alt="${esc(item.name)}" onerror="this.src='images/logo2.png'">
        ${!item.available ? `<span class="unavailable-badge">Currently unavailable</span>` : ""}
        <div class="order-item-name">${esc(item.name)}</div>
        <div class="order-item-desc">${esc(item.description || "")}</div>
        <div class="order-item-footer">
          <span class="order-item-price">₦${item.price.toLocaleString()}</span>
          <button class="add-to-cart-btn" ${!item.available ? "disabled" : ""} onclick="addToCart('${item._id}')">Add</button>
        </div>
      </div>`;
  }).join("");
}

// ─── Cart ─────────────────────────────────────────────────────
function addToCart(itemId) {
  const item = menuItems.find((i) => i._id === itemId);
  if (!item || !item.available) return;
  if (cart[itemId]) {
    cart[itemId].quantity += 1;
  } else {
    cart[itemId] = { item, quantity: 1 };
  }
  renderCart();
}

function changeQuantity(itemId, delta) {
  if (!cart[itemId]) return;
  cart[itemId].quantity += delta;
  if (cart[itemId].quantity <= 0) delete cart[itemId];
  renderCart();
}

function renderCart() {
  const cartItemsEl = document.getElementById("cartItems");
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    cartItemsEl.innerHTML = `<p class="empty-cart-text">Your cart is empty</p>`;
  } else {
    cartItemsEl.innerHTML = entries.map(([id, { item, quantity }]) => `
      <div class="cart-line">
        <div class="cart-line-info">
          <div class="cart-line-name">${esc(item.name)}</div>
          <div class="cart-line-price">₦${item.price.toLocaleString()} each</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQuantity('${id}', -1)">−</button>
          <span>${quantity}</span>
          <button class="qty-btn" onclick="changeQuantity('${id}', 1)">+</button>
        </div>
      </div>`).join("");
  }

  const subtotal = entries.reduce((sum, [, { item, quantity }]) => sum + item.price * quantity, 0);
  const total = subtotal; // no tax for WhatsApp orders — keep it simple

  document.getElementById("subtotalDisplay").textContent = `₦${subtotal.toLocaleString()}`;
  document.getElementById("taxDisplay").textContent = `—`;
  document.getElementById("totalDisplay").textContent = `₦${total.toLocaleString()}`;

  // Sync mobile cart bar
  syncMobileCart();
}

// ─── WhatsApp order ───────────────────────────────────────────
function handleWhatsAppOrder() {
  const entries = Object.entries(cart);
  if (entries.length === 0) {
    document.getElementById("formError").textContent = "Your cart is empty. Add at least one item first.";
    return;
  }

  document.getElementById("formError").textContent = "";

  const orderType = document.getElementById("orderType").value;
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const deliveryAddress = document.getElementById("deliveryAddress").value.trim();
  const notes = document.getElementById("orderNotes").value.trim();

  if (!name) { document.getElementById("formError").textContent = "Please enter your name."; return; }
  if (!phone) { document.getElementById("formError").textContent = "Please enter your phone number."; return; }
  if (orderType === "delivery" && !deliveryAddress) {
    document.getElementById("formError").textContent = "Please enter your delivery address.";
    return;
  }

  // Build WhatsApp message
  const itemLines = entries
    .map(([, { item, quantity }]) => `  • ${quantity}× ${item.name} — ₦${(item.price * quantity).toLocaleString()}`)
    .join("\n");

  const subtotal = entries.reduce((sum, [, { item, quantity }]) => sum + item.price * quantity, 0);

  let message = `🍽️ *New Order from Amala Ibadan Website*\n\n`;
  message += `*Customer:* ${name}\n`;
  message += `*Phone:* ${phone}\n`;
  message += `*Order Type:* ${orderType === "takeaway" ? "Takeaway / Pickup" : "Delivery"}\n`;
  if (orderType === "delivery" && deliveryAddress) {
    message += `*Delivery Address:* ${deliveryAddress}\n`;
  }
  message += `\n*Order Items:*\n${itemLines}\n`;
  message += `\n*Total: ₦${subtotal.toLocaleString()}*`;
  if (notes) message += `\n\n*Notes:* ${notes}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
}

// ─── Mobile sync ──────────────────────────────────────────────
function syncMobileCart() {
  const entries = Object.entries(cart);
  const isEmpty = entries.length === 0;
  const bar = document.getElementById("mobileCartBar");
  if (!bar) return;

  bar.style.display = isEmpty ? "none" : "flex";
  const totalItems = entries.reduce((s, [, { quantity }]) => s + quantity, 0);
  const subtotal = entries.reduce((s, [, { item, quantity }]) => s + item.price * quantity, 0);
  document.getElementById("mobileCartCount").textContent = totalItems;
  document.getElementById("mobileCartTotal").textContent = `₦${subtotal.toLocaleString()}`;
  document.getElementById("mobileCartItems").innerHTML = document.getElementById("cartItems").innerHTML;

  const drawerSummary = document.getElementById("mobileCartSummary");
  drawerSummary.style.display = isEmpty ? "none" : "block";
  if (!isEmpty) {
    document.getElementById("mobileSubtotal").textContent = `₦${subtotal.toLocaleString()}`;
    document.getElementById("mobileTax").textContent = `—`;
    document.getElementById("mobileTotal").textContent = `₦${subtotal.toLocaleString()}`;
  }

  document.getElementById("mobileCheckoutForm").style.display = isEmpty ? "none" : "block";
}

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}
