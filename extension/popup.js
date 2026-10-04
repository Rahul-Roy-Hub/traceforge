const views = {
  idle: document.getElementById("view-idle"),
  capturing: document.getElementById("view-capturing"),
  review: document.getElementById("view-review"),
  analyzing: document.getElementById("view-analyzing"),
  result: document.getElementById("view-result"),
  saved: document.getElementById("view-saved"),
};

const backBtn = document.getElementById("backBtn");
const settingsBtn = document.getElementById("settingsBtn");
const globalError = document.getElementById("globalError");

let capture = null;
let analysis = null;
let skill = null;
let analysisId = null;
let currentView = "idle";

function show(name) {
  currentView = name;
  Object.entries(views).forEach(([key, el]) => {
    el.classList.toggle("hidden", key !== name);
  });
  backBtn.classList.toggle("hidden", name === "idle" || name === "saved");
  globalError.classList.add("hidden");
}

function setError(el, message) {
  if (!message) {
    el.classList.add("hidden");
    el.textContent = "";
    return;
  }
  el.classList.remove("hidden");
  el.textContent = message;
}

function send(type, payload = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, ...payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (response?.error) {
        reject(new Error(response.error));
        return;
      }
      resolve(response);
    });
  });
}

function friendlyError(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (/Cannot capture /i.test(message)) return message;
  if (/cannot access a chrome/i.test(message) || /chrome:\/\//i.test(message)) {
    return "Cannot capture this Chrome page. Switch to a website tab (http/https), then click Trace This Issue.";
  }
  return message;
}

function markCapture(step, done) {
  const item = document.querySelector(`#captureList [data-step="${step}"] .check`);
  if (item) item.textContent = done ? "✓" : "○";
  if (item) item.classList.toggle("done", done);
}

function markAnalyze(step, spinning) {
  document.querySelectorAll("#analyzeList li").forEach((li) => {
    const active = li.dataset.step === step;
    const icon = li.querySelector(".spin, .check");
    if (!icon) return;
    if (active && spinning) {
      icon.className = "spin";
      icon.textContent = "";
    } else if (li.dataset.done === "true") {
      icon.className = "check done";
      icon.textContent = "✓";
    } else {
      icon.className = "check";
      icon.textContent = "○";
    }
  });
}

async function loadRecent() {
  const stored = await chrome.storage.local.get(["recentIssues"]);
  const items = stored.recentIssues || [];
  const root = document.getElementById("recentList");
  root.innerHTML = "";
  if (!items.length) {
    root.innerHTML = '<p class="empty">No captured issues yet.</p>';
    return;
  }
  items.slice(0, 5).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-item";
    button.innerHTML = `<strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.when)}</small>`;
    button.addEventListener("click", () => {
      analysis = item.analysis;
      capture = item.capture;
      skill = item.skill || null;
      analysisId = item.analysisId || null;
      renderResult();
      show("result");
    });
    root.appendChild(button);
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function summarizeErrors(captureData) {
  const consoleCount = captureData.console?.length || 0;
  const networkCount = captureData.network?.length || 0;
  const first =
    captureData.console?.[0]?.message ||
    (captureData.network?.[0]
      ? `${captureData.network[0].method} ${captureData.network[0].status} ${captureData.network[0].url}`
      : "No console or network errors captured yet.");
  return `${first}\n\nConsole: ${consoleCount} · Network failures: ${networkCount}`;
}

function renderReview() {
  document.getElementById("reviewShot").src = capture.screenshot;
  document.getElementById("reviewUrl").textContent = capture.url || "(unknown)";
  document.getElementById("reviewText").textContent =
    capture.selectedText || "No text selected on the page.";
  document.getElementById("reviewErrors").textContent = summarizeErrors(capture);
}

function renderResult() {
  const cause = analysis.likelyCauses?.[0]?.cause || analysis.summary;
  const fix = analysis.fixSteps?.[0] || "Open the full analysis for the complete fix plan.";
  document.getElementById("resultCause").textContent = cause;
  document.getElementById("resultFix").textContent = fix;
}

async function saveRecent() {
  const stored = await chrome.storage.local.get(["recentIssues"]);
  const items = stored.recentIssues || [];
  const captureWithoutShot = { ...(capture || {}) };
  delete captureWithoutShot.screenshot;
  const next = [
    {
      title: (analysis.summary || capture?.title || "Untitled issue").slice(0, 72),
      when: new Date().toLocaleString(),
      analysisId,
      analysis,
      capture: captureWithoutShot,
      skill,
    },
    ...items,
  ].slice(0, 8);
  await chrome.storage.local.set({ recentIssues: next });
}

function stripMeta(value) {
  if (!value || typeof value !== "object") return value;
  const next = { ...value };
  delete next.meta;
  return next;
}

function importPayload(open) {
  return {
    id: analysisId || `analysis-${Date.now()}`,
    analysis: stripMeta(analysis),
    capture: capture
      ? {
          url: capture.url,
          title: capture.title,
          selectedText: capture.selectedText,
          console: capture.console,
          network: capture.network,
        }
      : undefined,
    skill: skill || undefined,
    open,
  };
}

async function getApiBase() {
  const stored = await chrome.storage.sync.get(["apiBase"]);
  return (stored.apiBase || "http://localhost:3000").replace(/\/$/, "");
}

function waitForTabComplete(tabId) {
  return new Promise((resolve) => {
    const listener = (id, info) => {
      if (id === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function openInApp(open) {
  if (!analysis) {
    throw new Error("No analysis to open yet.");
  }
  analysisId = analysisId || `analysis-${Date.now()}`;
  const payload = importPayload(open);
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const apiBase = await getApiBase();
  const importUrl = `${apiBase}/extension-import`;

  if (encoded.length < 90000) {
    await chrome.tabs.create({ url: `${importUrl}#${encoded}` });
    return;
  }

  const tab = await chrome.tabs.create({ url: importUrl });
  await waitForTabComplete(tab.id);
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (raw) => {
      sessionStorage.setItem("traceforge.extension-import", raw);
      location.reload();
    },
    args: [JSON.stringify(payload)],
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

document.getElementById("traceBtn").addEventListener("click", async () => {
  show("capturing");
  ["page", "shot", "text", "console", "context"].forEach((step) => markCapture(step, false));
  document.getElementById("captureStatus").textContent = "Collecting page information...";
  const capturePromise = send("TRACEFORGE_CAPTURE");
  try {
    const [, result] = await Promise.all([
      (async () => {
        markCapture("page", true);
        document.getElementById("captureStatus").textContent = "Capturing visible page...";
        await delay(180);
        markCapture("shot", true);
        document.getElementById("captureStatus").textContent = "Reading selected text...";
        await delay(180);
        markCapture("text", true);
        document.getElementById("captureStatus").textContent = "Collecting console errors...";
        await delay(180);
        markCapture("console", true);
        document.getElementById("captureStatus").textContent = "Collecting page context...";
      })(),
      capturePromise,
    ]);
    capture = result;
    markCapture("shot", Boolean(capture.screenshot));
    markCapture("context", true);
    document.getElementById("captureStatus").textContent = "Context ready.";
    renderReview();
    show("review");
  } catch (error) {
    show("idle");
    setError(globalError, friendlyError(error));
  }
});

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  show("analyzing");
  const order = ["understand", "cause", "fix", "similar", "prep"];
  order.forEach((step, index) => {
    const li = document.querySelector(`#analyzeList [data-step="${step}"]`);
    if (li) li.dataset.done = index === 0 ? "false" : "false";
  });
  let stepIndex = 0;
  markAnalyze(order[0], true);
  const timer = setInterval(() => {
    const li = document.querySelector(`#analyzeList [data-step="${order[stepIndex]}"]`);
    if (li) li.dataset.done = "true";
    stepIndex = Math.min(stepIndex + 1, order.length - 1);
    markAnalyze(order[stepIndex], true);
  }, 2500);

  try {
    analysis = await send("TRACEFORGE_ANALYZE", { capture });
    analysisId = `analysis-${Date.now()}`;
    clearInterval(timer);
    order.forEach((step) => {
      const li = document.querySelector(`#analyzeList [data-step="${step}"]`);
      if (li) li.dataset.done = "true";
    });
    await saveRecent();
    renderResult();
    show("result");
  } catch (error) {
    clearInterval(timer);
    show("review");
    setError(document.getElementById("reviewError"), error.message);
  }
});

document.getElementById("saveSkillBtn").addEventListener("click", async () => {
  setError(document.getElementById("resultError"), "");
  document.getElementById("saveSkillBtn").disabled = true;
  try {
    skill = await send("TRACEFORGE_SAVE_SKILL", { analysis });
    document.getElementById("savedSkillName").textContent = skill.skillName || "debug-skill";
    document.getElementById("savedSkillDesc").textContent =
      analysis.summary || "Reusable TraceForge skill";
    await saveRecent();
    show("saved");
  } catch (error) {
    setError(document.getElementById("resultError"), error.message);
  } finally {
    document.getElementById("saveSkillBtn").disabled = false;
  }
});

document.getElementById("fullAnalysisBtn").addEventListener("click", async () => {
  setError(document.getElementById("resultError"), "");
  try {
    await openInApp("analysis");
  } catch (error) {
    setError(document.getElementById("resultError"), friendlyError(error));
  }
});

document.getElementById("viewSkillBtn").addEventListener("click", async () => {
  try {
    await openInApp("skill");
  } catch (error) {
    setError(globalError, friendlyError(error));
  }
});

document.getElementById("anotherBtn").addEventListener("click", () => {
  capture = null;
  analysis = null;
  skill = null;
  analysisId = null;
  show("idle");
  void loadRecent();
});

backBtn.addEventListener("click", () => {
  if (currentView === "review" || currentView === "capturing") show("idle");
  else if (currentView === "analyzing") show("review");
  else if (currentView === "result") show("review");
});

settingsBtn.addEventListener("click", () => chrome.runtime.openOptionsPage());

show("idle");
void loadRecent();
