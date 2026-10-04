const DEFAULT_API_BASE = "http://localhost:3000";
const networkByTab = new Map();
const MAX_NETWORK = 80;

function pushNetwork(tabId, entry) {
  if (typeof tabId !== "number" || tabId < 0) return;
  const list = networkByTab.get(tabId) || [];
  list.push({ ...entry, at: Date.now() });
  if (list.length > MAX_NETWORK) list.shift();
  networkByTab.set(tabId, list);
}

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.statusCode >= 400) {
      pushNetwork(details.tabId, {
        method: details.method,
        url: details.url,
        status: details.statusCode,
        statusText: "HTTP error",
      });
    }
  },
  { urls: ["<all_urls>"] },
);

chrome.webRequest.onErrorOccurred.addListener(
  (details) => {
    if (details.error === "net::ERR_ABORTED") return;
    pushNetwork(details.tabId, {
      method: details.method,
      url: details.url,
      status: 0,
      statusText: details.error,
    });
  },
  { urls: ["<all_urls>"] },
);

chrome.tabs.onRemoved.addListener((tabId) => {
  networkByTab.delete(tabId);
});

async function getApiBase() {
  const stored = await chrome.storage.sync.get(["apiBase"]);
  return (stored.apiBase || DEFAULT_API_BASE).replace(/\/$/, "");
}

function tabUrl(tab) {
  return tab?.url || tab?.pendingUrl || "";
}

function isCapturableUrl(url = "") {
  const lower = String(url).toLowerCase();
  return lower.startsWith("http://") || lower.startsWith("https://");
}

function restrictedPageError(url) {
  const shown = url || "this Chrome internal page";
  return new Error(
    `Cannot capture ${shown}. Switch to a normal website tab (http/https) — not chrome://extensions — then click Trace This Issue.`,
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCapturableTab() {
  const lastFocused = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const current = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const active = lastFocused[0] || current[0];
  if (active?.id && isCapturableUrl(tabUrl(active))) {
    return active;
  }

  const windowTabs = await chrome.tabs.query(
    active?.windowId ? { windowId: active.windowId } : { lastFocusedWindow: true },
  );
  const capturable = windowTabs
    .filter((tab) => tab.id && isCapturableUrl(tabUrl(tab)))
    .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));

  if (!capturable[0]) {
    throw restrictedPageError(tabUrl(active));
  }

  if (!capturable[0].active) {
    await chrome.tabs.update(capturable[0].id, { active: true });
    await delay(250);
  }

  return chrome.tabs.get(capturable[0].id);
}

async function captureTab(tabId) {
  const tab = await chrome.tabs.get(tabId);
  const windowId = tab.windowId;
  return chrome.tabs.captureVisibleTab(windowId, { format: "png" });
}

function dataUrlToBlob(dataUrl) {
  const [header, body] = dataUrl.split(",");
  const mime = header.match(/data:(.*);base64/)?.[1] || "image/png";
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function mergeNetwork(pageNetwork, tabId) {
  const fromWebRequest = networkByTab.get(tabId) || [];
  const combined = [...fromWebRequest, ...(pageNetwork || [])];
  const seen = new Set();
  const unique = [];
  for (const item of combined.reverse()) {
    const key = `${item.method}|${item.url}|${item.status}|${item.statusText}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique.slice(0, 40);
}

function formatLogs(context) {
  const consoleLines = (context.console || []).map(
    (item) => `[console.${item.level}] ${item.message}`,
  );
  const networkLines = (context.network || []).map(
    (item) =>
      `[network] ${item.method} ${item.status || "failed"} ${item.statusText || ""} ${item.url}`,
  );
  const parts = [];
  if (consoleLines.length) {
    parts.push("CONSOLE ERRORS", ...consoleLines);
  }
  if (networkLines.length) {
    parts.push("", "FAILED NETWORK REQUESTS", ...networkLines);
  }
  if (!parts.length) {
    parts.push("No console errors or failed network requests were captured.");
    parts.push(
      "Keep the page open after the failure, then click Trace This Issue again.",
    );
  }
  return parts.join("\n");
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "TRACEFORGE_CAPTURE") {
    captureContext()
      .then(sendResponse)
      .catch((error) =>
        sendResponse({ error: error instanceof Error ? error.message : String(error) }),
      );
    return true;
  }

  if (message?.type === "TRACEFORGE_ANALYZE") {
    analyzeCapture(message.capture)
      .then(sendResponse)
      .catch((error) =>
        sendResponse({ error: error instanceof Error ? error.message : String(error) }),
      );
    return true;
  }

  if (message?.type === "TRACEFORGE_SAVE_SKILL") {
    saveSkill(message.analysis)
      .then(sendResponse)
      .catch((error) =>
        sendResponse({ error: error instanceof Error ? error.message : String(error) }),
      );
    return true;
  }

  return false;
});

async function captureContext() {
  const tab = await getCapturableTab();
  if (!isCapturableUrl(tabUrl(tab))) {
    throw restrictedPageError(tabUrl(tab));
  }

  let page = {
    url: tab.url || "",
    title: tab.title || "",
    selectedText: "",
    console: [],
    network: [],
    pageContext: {},
  };

  try {
    page = await chrome.tabs.sendMessage(tab.id, {
      type: "TRACEFORGE_GET_CONTEXT",
    });
  } catch {
    if (!isCapturableUrl(tabUrl(tab))) {
      throw restrictedPageError(tabUrl(tab));
    }
    try {
      const injected = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          url: location.href,
          title: document.title,
          selectedText: (window.getSelection && window.getSelection().toString()) || "",
          console: [],
          network: [],
          pageContext: {
            readyState: document.readyState,
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
          },
        }),
      });
      page = injected[0]?.result || page;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/chrome:\/\//i.test(message) || /cannot access/i.test(message)) {
        throw restrictedPageError(tabUrl(tab));
      }
      throw error;
    }
  }

  page.network = mergeNetwork(page.network, tab.id);
  let screenshot;
  try {
    screenshot = await captureTab(tab.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/chrome:\/\//i.test(message) || /cannot access/i.test(message)) {
      throw restrictedPageError(tabUrl(tab));
    }
    throw error;
  }

  return {
    url: page.url,
    title: page.title,
    selectedText: page.selectedText,
    console: page.console,
    network: page.network,
    pageContext: page.pageContext,
    screenshot,
    capturedAt: Date.now(),
  };
}

async function analyzeCapture(capture) {
  const apiBase = await getApiBase();
  const blob = dataUrlToBlob(capture.screenshot);
  const formData = new FormData();
  formData.set("image", blob, "page-screenshot.png");
  formData.set(
    "userContext",
    [
      "A control or action on this page did not work. Identify the actual error from the screenshot, console, and failed network requests.",
      `Page title: ${capture.title || "(none)"}`,
      `URL: ${capture.url || "(unknown)"}`,
      capture.selectedText
        ? `Selected text:\n${capture.selectedText}`
        : "No text was selected.",
    ].join("\n"),
  );
  formData.set("logText", formatLogs(capture));
  formData.set(
    "projectContext",
    JSON.stringify(capture.pageContext || {}, null, 2),
  );

  const response = await fetch(`${apiBase}/api/analyze`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Analyze failed (${response.status})`);
  }
  return data;
}

async function saveSkill(analysis) {
  const apiBase = await getApiBase();
  const payload = { ...analysis };
  delete payload.meta;
  const response = await fetch(`${apiBase}/api/generate-skill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analysis: payload }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Skill generation failed (${response.status})`);
  }
  return data;
}
