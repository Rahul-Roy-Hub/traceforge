const input = document.getElementById("apiBase");
const status = document.getElementById("status");

chrome.storage.sync.get(["apiBase"], (stored) => {
  input.value = stored.apiBase || "http://localhost:3000";
});

document.getElementById("save").addEventListener("click", () => {
  const apiBase = input.value.trim().replace(/\/$/, "") || "http://localhost:3000";
  chrome.storage.sync.set({ apiBase }, () => {
    status.textContent = "Saved. Trace This Issue will call this origin.";
  });
});
