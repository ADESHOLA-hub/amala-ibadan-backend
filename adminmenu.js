// adminmenu.js
const API_BASE = "https://amala-ibadan-backend.onrender.com/api";

let menuItems = [];
let activeCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  document.getElementById("itemForm").addEventListener("submit", handleSaveItem);
});

async function loadMenu() {
  try {
    const res = await fetch(`${API_BASE}/menu`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    menuItems = data.data;
    renderCategoryFilters();
    renderMenuGrid();
  } catch (err) {
    showToast("Couldn't load menu. Is the server running?", true);
    document.getElementById("menuGrid").innerHTML =
      `<p class="empty-state-text">Failed to load menu.</p>`;
  }
}

function renderCategoryFilters() {
  const categories = ["all", ...new Set(menuItems.map((i) => i.category))];
  const container = document.getElementById("categoryFilters");
  container.innerHTML = categories
    .map(
      (cat) =>
        `<button class="filter-pill ${cat === activeCategory ? "active-pill" : ""}" data-category="${cat}">${capitalize(cat)}</button>`
    )
    .join("");

  container.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      container.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active-pill"));
      btn.classList.add("active-pill");
      renderMenuGrid();
    });
  });
}

function renderMenuGrid() {
  const grid = document.getElementById("menuGrid");
  const filtered = activeCategory === "all" ? menuItems : menuItems.filter((i) => i.category === activeCategory);

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="empty-state-text">No items in this category.</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (item) => `
      <div class="menu-admin-card">
        <div class="item-name-row">
          <h3>${escapeHtml(item.name)}</h3>
        </div>
        <div class="item-category">${item.category}</div>
        <p class="item-desc">${escapeHtml(item.description || "No description")}</p>
        <div class="item-price">₦${item.price.toLocaleString()}</div>
        <div class="availability-toggle">
          <input type="checkbox" ${item.available ? "checked" : ""} onchange="toggleAvailability('${item._id}')">
          <span>${item.available ? "Available" : "Unavailable"}</span>
        </div>
        <div class="card-actions">
          <button class="btn-secondary" onclick='openEditModal(${JSON.stringify(item).replace(/'/g, "&#39;")})'>Edit</button>
          <button class="btn-danger" onclick="deleteItem('${item._id}', '${escapeHtml(item.name)}')">Delete</button>
        </div>
      </div>
    `
    )
    .join("");
}

function openAddModal() {
  document.getElementById("modalTitle").textContent = "Add Menu Item";
  document.getElementById("itemForm").reset();
  document.getElementById("itemId").value = "";
  document.getElementById("itemAvailable").checked = true;
  document.getElementById("formError").textContent = "";
  document.getElementById("itemModal").classList.add("show");
}

function openEditModal(item) {
  document.getElementById("modalTitle").textContent = "Edit Menu Item";
  document.getElementById("itemId").value = item._id;
  document.getElementById("itemName").value = item.name;
  document.getElementById("itemDescription").value = item.description || "";
  document.getElementById("itemPrice").value = item.price;
  document.getElementById("itemCategory").value = item.category;
  document.getElementById("itemImage").value = item.image || "";
  document.getElementById("itemAvailable").checked = item.available;
  document.getElementById("formError").textContent = "";
  document.getElementById("itemModal").classList.add("show");
}

function closeModal() {
  document.getElementById("itemModal").classList.remove("show");
}

async function handleSaveItem(e) {
  e.preventDefault();
  const errorEl = document.getElementById("formError");
  errorEl.textContent = "";

  const id = document.getElementById("itemId").value;
  const payload = {
    name: document.getElementById("itemName").value.trim(),
    description: document.getElementById("itemDescription").value.trim(),
    price: Number(document.getElementById("itemPrice").value),
    category: document.getElementById("itemCategory").value,
    image: document.getElementById("itemImage").value.trim(),
    available: document.getElementById("itemAvailable").checked,
  };

  const saveBtn = document.getElementById("saveItemBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    const url = id ? `${API_BASE}/menu/${id}` : `${API_BASE}/menu`;
    const method = id ? "PUT" : "POST";

    // ===== CHANGED: headers is now authHeaders() instead of a plain object,
    // and we check handleAuthError() right after reading the response =====
    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (handleAuthError(res)) return;
    // ===== END CHANGED =====

    if (!data.success) throw new Error(data.message);

    showToast(id ? "Item updated" : "Item added");
    closeModal();
    loadMenu();
  } catch (err) {
    errorEl.textContent = err.message || "Could not save item";
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
  }
}

async function toggleAvailability(id) {
  try {
    // ===== CHANGED: added headers: authHeaders(), and the handleAuthError check =====
    const res = await fetch(`${API_BASE}/menu/${id}/availability`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (handleAuthError(res)) return;
    // ===== END CHANGED =====

    if (!data.success) throw new Error(data.message);
    showToast("Availability updated");
    loadMenu();
  } catch (err) {
    showToast(err.message || "Could not update availability", true);
  }
}

async function deleteItem(id, name) {
  if (!confirm(`Delete "${name}" from the menu? This cannot be undone.`)) return;

  try {
    // ===== CHANGED: added headers: authHeaders(), and the handleAuthError check =====
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (handleAuthError(res)) return;
    // ===== END CHANGED =====

    if (!data.success) throw new Error(data.message);
    showToast("Item deleted");
    loadMenu();
  } catch (err) {
    showToast(err.message || "Could not delete item", true);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
