// adminSettings.js — lets the admin change how many items fit on a plate
const SETTINGS_API_BASE = "https://amala-ibadan-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  loadCurrentSetting();
  document.getElementById("settingsForm").addEventListener("submit", handleSaveSettings);
});

async function loadCurrentSetting() {
  try {
    const res = await fetch(`${SETTINGS_API_BASE}/settings`);
    const data = await res.json();
    if (data.success) {
      document.getElementById("maxPortionsInput").value = data.data.maxPortionsPerPlate;
    }
  } catch (err) {
    document.getElementById("settingsMsg").textContent = "Could not load current setting.";
  }
}

async function handleSaveSettings(e) {
  e.preventDefault();
  const msgEl = document.getElementById("settingsMsg");
  msgEl.textContent = "";

  const value = Number(document.getElementById("maxPortionsInput").value);
  if (!value || value < 1) {
    msgEl.textContent = "Enter a number of at least 1.";
    return;
  }

  const saveBtn = document.getElementById("saveSettingsBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    const res = await fetch(`${SETTINGS_API_BASE}/settings`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ maxPortionsPerPlate: value }),
    });
    const data = await res.json();
    if (handleAuthError(res)) return;

    if (!data.success) throw new Error(data.message || "Could not save");
    msgEl.style.color = "#4c7a4c";
    msgEl.textContent = "Saved! New orders will use this limit.";
  } catch (err) {
    msgEl.style.color = "#b5342d";
    msgEl.textContent = err.message || "Could not save setting.";
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
  }
}
