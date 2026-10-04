const buffer = {
  console: [],
  network: [],
};

window.addEventListener("traceforge-update", (event) => {
  const detail = event.detail || {};
  buffer.console = Array.isArray(detail.console) ? detail.console : [];
  buffer.network = Array.isArray(detail.network) ? detail.network : [];
});

function collectPageContext() {
  window.dispatchEvent(new Event("traceforge-request"));
  const selection = (window.getSelection && window.getSelection().toString()) || "";
  return {
    url: location.href,
    title: document.title,
    selectedText: selection.trim().slice(0, 2000),
    console: buffer.console.slice(-40),
    network: buffer.network.slice(-40),
    pageContext: {
      readyState: document.readyState,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    },
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "TRACEFORGE_GET_CONTEXT") {
    sendResponse(collectPageContext());
  }
  return false;
});
