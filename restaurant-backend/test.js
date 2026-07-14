// test.js — Luxury Catering Menu (data-driven, editable from admin panel)
const API_BASE = "http://localhost:5000/api";
const WHATSAPP_NUMBER = "2347047777521"; // same number used across the site

const categoryMeta = {
  breakfast:  { label: "Breakfast",     title: "Breakfast Spread",      subtitle: null },
  owambe:     { label: "Owambe",        title: "Owambe Packages",       subtitle: null },
  specials:   { label: "Specials",      title: "Chef's Specials",       subtitle: null },
  afterparty: { label: "After Party",   title: "After Party Menu",      subtitle: "Perfect for late-night celebrations" },
  starters:   { label: "Starters",      title: "Starters",              subtitle: "Begin your dining experience beautifully" },
  lunchpacks: { label: "Lunch Packs",   title: "Lunch Packs",           subtitle: "Perfect for office lunches, corporate meetings and everyday enjoyment." },
  foodbowls:  { label: "Food Bowls",    title: "Food Bowls",            subtitle: "Freshly prepared bowls of your favourite Nigerian dishes, perfect for sharing or personal enjoyment." },
};

let packages = [];
let activeCategory = "all";

window.addEventListener("load", () => {
  loadCatering();
});

async function loadCatering() {
  const container = document.querySelector(".premium-menu");
  try {
    const res = await fetch(`${API_BASE}/catering`);
    if (!res.ok) throw new Error("Failed to fetch catering menu");
    const data = await res.json();
    packages = (data.data || []).filter((p) => p.available);
    renderTabs();
    renderCategories();
  } catch (err) {
    const grid = document.querySelector(".menu-tabs");
    if (grid) grid.insertAdjacentHTML("afterend", `<p class="loading-text">Couldn't load the catering menu. Please make sure the server is running.</p>`);
  }
}

function renderTabs() {
  const categories = ["all", ...Object.keys(categoryMeta).filter((c) => packages.some((p) => p.category === c))];
  const tabsEl = document.querySelector(".menu-tabs");
  if (!tabsEl) return;

  tabsEl.innerHTML = categories
    .map((cat) => `<button data-category="${cat}" class="${cat === activeCategory ? "active" : ""}">${cat === "all" ? "All" : categoryMeta[cat].label}</button>`)
    .join("");

  tabsEl.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      tabsEl.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCategories();
    });
  });
}

function renderCategories() {
  // Remove any previously rendered category blocks
  document.querySelectorAll(".menu-category[data-generated]").forEach((el) => el.remove());

  const anchor = document.querySelector(".menu-tabs");
  const categoriesToShow = Object.keys(categoryMeta).filter((cat) => {
    if (activeCategory !== "all" && cat !== activeCategory) return false;
    return packages.some((p) => p.category === cat);
  });

  let lastEl = anchor;
  categoriesToShow.forEach((cat) => {
    const meta = categoryMeta[cat];
    const items = packages.filter((p) => p.category === cat);

    const block = document.createElement("div");
    block.className = "menu-category";
    block.dataset.category = cat;
    block.dataset.generated = "true";

    block.innerHTML = `
      <div class="category-title">
        <h3>${esc(meta.title)}</h3>
        ${meta.subtitle ? `<p>${esc(meta.subtitle)}</p>` : items[0]?.minGuests ? `<p>Minimum of ${items[0].minGuests} Guests</p>` : ""}
      </div>
      <div class="menu-grid">
        ${items.map(renderCard).join("")}
      </div>`;

    lastEl.insertAdjacentElement("afterend", block);
    lastEl = block;
  });
}

function renderCard(pkg) {
  const featuredClass = pkg.featured ? " featured" : "";
  const ribbonHtml = pkg.ribbon
    ? `<span class="ribbon${pkg.ribbonGold ? " gold" : ""}">${esc(pkg.ribbon)}</span>`
    : "";

  const bodyHtml = pkg.inclusions && pkg.inclusions.length > 0
    ? `<ul>${pkg.inclusions.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
    : `<p>${esc(pkg.description || "")}</p>`;

  const waMessage = encodeURIComponent(
    `Hi! I'd like to enquire about the *${pkg.name}* (${pkg.priceLabel})${pkg.minGuests ? ` for ${pkg.minGuests}+ guests` : ""} from your catering menu.`
  );

  return `
    <article class="menu-card${featuredClass}">
      <span class="price">${esc(pkg.priceLabel)}</span>
      ${ribbonHtml}
      <div class="menu-icon">${pkg.icon || "🍽️"}</div>
      <h4>${esc(pkg.name)}</h4>
      ${bodyHtml}
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}" target="_blank" class="menu-btn">Enquire on WhatsApp</a>
    </article>`;
}

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}
