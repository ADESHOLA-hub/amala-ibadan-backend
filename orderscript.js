// orderscript.js — plate-based WhatsApp ordering flow
const API_BASE = "https://amala-ibadan-backend.onrender.com/api";
const WHATSAPP_NUMBER = "2347077170411";

let menuItems = [];
let activeCategory = "all";
let maxPortionsPerPlate = 4; // fetched from /api/settings, this is just a fallback
let plateCount = 0;
let plates = [];        // array of { items: { itemId: quantity } }
let activePlateIndex = 0;

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
  loadSettings();
  loadMenu();

  document.getElementById("orderType").addEventListener("change", (e) => {
    document.getElementById("deliveryFields").style.display =
      e.target.value === "delivery" ? "block" : "none";
  });

  document.getElementById("placeOrderBtn").addEventListener("click", handleWhatsAppOrder);
  document.getElementById("plateCountInput").addEventListener("change", handlePlateCountChange);
  document.getElementById("increasePlateBtn").addEventListener("click", () => changePlateCount(1));
  document.getElementById("decreasePlateBtn").addEventListener("click", () => changePlateCount(-1));
});

// ─── Settings ─────────────────────────────────────────────────
async function loadSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    const data = await res.json();
    if (data.success) {
      maxPortionsPerPlate = data.data.maxPortionsPerPlate;
    }
  } catch (err) {
    // silently fall back to the default of 4
  }
  document.getElementById("maxPortionsLabel").textContent = maxPortionsPerPlate;
}

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
    menuListEl.innerHTML = `<p class="loading-text">Couldn't load the menu. Please try again shortly.</p>`;
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

  const plateFull = plateCount > 0 && getPlatePortionCount(activePlateIndex) >= maxPortionsPerPlate;

  menuListEl.innerHTML = filtered.map((item) => {
    const imgSrc = item.image && item.image.trim() !== "" ? item.image : "images/logo2.png";
    const itemQtyOnActivePlate = getItemQuantityOnPlate(activePlateIndex, item._id);
    const itemLimitReached = item.maxPerPlate && itemQtyOnActivePlate >= item.maxPerPlate;
    const disabled = !item.available || plateCount === 0 || plateFull || itemLimitReached;
    const limitHint = item.maxPerPlate ? `<div class="item-limit-hint">Max ${item.maxPerPlate} per plate</div>` : "";
    return `
      <div class="order-item-card">
        <img src="${imgSrc}" alt="${esc(item.name)}" onerror="this.src='images/logo2.png'">
        ${!item.available ? `<span class="unavailable-badge">Currently unavailable</span>` : ""}
        <div class="order-item-name">${esc(item.name)}</div>
        <div class="order-item-desc">${esc(item.description || "")}</div>
        ${limitHint}
        <div class="order-item-footer">
          <span class="order-item-price">₦${item.price.toLocaleString()}</span>
          <button class="add-to-cart-btn" ${disabled ? "disabled" : ""} onclick="addToPlate('${item._id}')">
            ${itemLimitReached ? "Limit reached" : "Add"}
          </button>
        </div>
      </div>`;
  }).join("");
}

function getItemQuantityOnPlate(plateIndex, itemId) {
  const plate = plates[plateIndex];
  if (!plate) return 0;
  return plate.items[itemId] || 0;
}

// ─── Plates ───────────────────────────────────────────────────
function handlePlateCountChange(e) {
  const val = Math.max(0, parseInt(e.target.value, 10) || 0);
  setPlateCount(val);
}

function changePlateCount(delta) {
  setPlateCount(plateCount + delta);
}

function setPlateCount(count) {
  count = Math.max(0, count);
  plateCount = count;
  document.getElementById("plateCountInput").value = count;

  // Grow or shrink the plates array, keeping existing plate contents where possible
  while (plates.length < count) plates.push({ items: {} });
  while (plates.length > count) plates.pop();

  if (activePlateIndex >= count) activePlateIndex = Math.max(0, count - 1);

  renderPlateTabs();
  renderMenu();
  renderCart();
}

function getPlatePortionCount(plateIndex) {
  const plate = plates[plateIndex];
  if (!plate) return 0;
  return Object.values(plate.items).reduce((sum, qty) => sum + qty, 0);
}

function renderPlateTabs() {
  const container = document.getElementById("plateTabs");
  if (plateCount === 0) {
    container.innerHTML = `<p class="plate-hint">Choose how many plates you'd like above, then start adding items to each one.</p>`;
    return;
  }

  container.innerHTML = plates.map((plate, i) => {
    const portionCount = getPlatePortionCount(i);
    const isFull = portionCount >= maxPortionsPerPlate;
    return `
      <button class="plate-tab ${i === activePlateIndex ? "active-plate-tab" : ""} ${isFull ? "full-plate-tab" : ""}"
              onclick="switchPlate(${i})">
        Plate ${i + 1}
        <span class="plate-tab-count">${portionCount}/${maxPortionsPerPlate}</span>
      </button>`;
  }).join("");
}

function switchPlate(index) {
  activePlateIndex = index;
  renderPlateTabs();
  renderMenu();
}

function addToPlate(itemId) {
  if (plateCount === 0) return;
  const item = menuItems.find((i) => i._id === itemId);
  if (!item || !item.available) return;

  const plate = plates[activePlateIndex];
  const currentCount = getPlatePortionCount(activePlateIndex);
  if (currentCount >= maxPortionsPerPlate) return; // plate is full overall

  const currentItemQty = plate.items[itemId] || 0;
  if (item.maxPerPlate && currentItemQty >= item.maxPerPlate) return; // this dish's own limit reached

  plate.items[itemId] = currentItemQty + 1;
  renderPlateTabs();
  renderMenu();
  renderCart();
}

function removeFromPlate(plateIndex, itemId) {
  const plate = plates[plateIndex];
  if (!plate || !plate.items[itemId]) return;
  plate.items[itemId] -= 1;
  if (plate.items[itemId] <= 0) delete plate.items[itemId];
  renderPlateTabs();
  renderMenu();
  renderCart();
}

// ─── Cart / order summary ───────────────────────────────────────
function renderCart() {
  const cartItemsEl = document.getElementById("cartItems");

  const hasAnyItems = plates.some((p) => Object.keys(p.items).length > 0);
  if (!hasAnyItems) {
    cartItemsEl.innerHTML = `<p class="empty-cart-text">Your plates are empty</p>`;
  } else {
    cartItemsEl.innerHTML = plates.map((plate, plateIndex) => {
      const entries = Object.entries(plate.items);
      if (entries.length === 0) return "";
      const lines = entries.map(([itemId, qty]) => {
        const item = menuItems.find((i) => i._id === itemId);
        if (!item) return "";
        return `
          <div class="cart-line">
            <div class="cart-line-info">
              <div class="cart-line-name">${esc(item.name)}</div>
              <div class="cart-line-price">₦${item.price.toLocaleString()} each</div>
            </div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="removeFromPlate(${plateIndex}, '${itemId}')">−</button>
              <span>${qty}</span>
              <button class="qty-btn" onclick="switchPlate(${plateIndex}); addToPlate('${itemId}')">+</button>
            </div>
          </div>`;
      }).join("");
      return `<div class="cart-plate-group"><div class="cart-plate-label">Plate ${plateIndex + 1}</div>${lines}</div>`;
    }).join("");
  }

  const subtotal = getOrderSubtotal();
  document.getElementById("subtotalDisplay").textContent = `₦${subtotal.toLocaleString()}`;
  document.getElementById("taxDisplay").textContent = `—`;
  document.getElementById("totalDisplay").textContent = `₦${subtotal.toLocaleString()}`;

  syncMobileCart();
}

function getOrderSubtotal() {
  let subtotal = 0;
  plates.forEach((plate) => {
    Object.entries(plate.items).forEach(([itemId, qty]) => {
      const item = menuItems.find((i) => i._id === itemId);
      if (item) subtotal += item.price * qty;
    });
  });
  return subtotal;
}

// ─── WhatsApp order ───────────────────────────────────────────
function handleWhatsAppOrder() {
  const hasAnyItems = plates.some((p) => Object.keys(p.items).length > 0);
  if (plateCount === 0 || !hasAnyItems) {
    document.getElementById("formError").textContent = "Choose your plates and add at least one item first.";
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

  const plateLines = plates.map((plate, i) => {
    const entries = Object.entries(plate.items);
    if (entries.length === 0) return "";
    const items = entries.map(([itemId, qty]) => {
      const item = menuItems.find((it) => it._id === itemId);
      if (!item) return "";
      return `    • ${qty}× ${item.name} — ₦${(item.price * qty).toLocaleString()}`;
    }).join("\n");
    return `*Plate ${i + 1}:*\n${items}`;
  }).filter(Boolean).join("\n\n");

  const subtotal = getOrderSubtotal();

  let message = `🍽️ *New Order from Amala Ibadan Website*\n\n`;
  message += `*Customer:* ${name}\n`;
  message += `*Phone:* ${phone}\n`;
  message += `*Number of Plates:* ${plateCount}\n`;
  message += `*Order Type:* ${orderType === "takeaway" ? "Takeaway / Pickup" : "Delivery"}\n`;
  if (orderType === "delivery" && deliveryAddress) {
    message += `*Delivery Address:* ${deliveryAddress}\n`;
  }
  message += `\n${plateLines}\n`;
  message += `\n*Total: ₦${subtotal.toLocaleString()}*`;
  if (notes) message += `\n\n*Notes:* ${notes}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
}

// ─── Mobile sync ──────────────────────────────────────────────
function syncMobileCart() {
  const bar = document.getElementById("mobileCartBar");
  if (!bar) return;

  const totalItems = plates.reduce((sum, p) => sum + Object.values(p.items).reduce((s, q) => s + q, 0), 0);
  const subtotal = getOrderSubtotal();
  const isEmpty = totalItems === 0;

  bar.style.display = isEmpty ? "none" : "flex";
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
