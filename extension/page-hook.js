(() => {
  if (window.__TRACEFORGE_HOOKED__) return;
  window.__TRACEFORGE_HOOKED__ = true;

  const MAX = 80;
  const state = {
    console: [],
    network: [],
  };

  function push(list, item) {
    list.push({ ...item, at: Date.now() });
    if (list.length > MAX) list.shift();
    window.dispatchEvent(
      new CustomEvent("traceforge-update", { detail: { ...state } }),
    );
  }

  function serialize(value) {
    if (value instanceof Error) {
      return `${value.name}: ${value.message}${value.stack ? `\n${value.stack}` : ""}`;
    }
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);

  console.error = (...args) => {
    push(state.console, {
      level: "error",
      message: args.map(serialize).join(" "),
    });
    originalError(...args);
  };

  console.warn = (...args) => {
    push(state.console, {
      level: "warn",
      message: args.map(serialize).join(" "),
    });
    originalWarn(...args);
  };

  window.addEventListener("error", (event) => {
    push(state.console, {
      level: "error",
      message: event.error
        ? serialize(event.error)
        : `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    push(state.console, {
      level: "error",
      message: `Unhandled rejection: ${serialize(event.reason)}`,
    });
  });

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const input = args[0];
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : String(input);
    const method =
      args[1]?.method ||
      (input instanceof Request ? input.method : "GET") ||
      "GET";
    try {
      const response = await originalFetch(...args);
      if (response.status >= 400) {
        push(state.network, {
          method,
          url,
          status: response.status,
          statusText: response.statusText,
        });
      }
      return response;
    } catch (error) {
      push(state.network, {
        method,
        url,
        status: 0,
        statusText: serialize(error),
      });
      throw error;
    }
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__traceforge = { method, url: String(url) };
    return originalOpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (...rest) {
    this.addEventListener("loadend", () => {
      const meta = this.__traceforge || { method: "GET", url: "" };
      if (this.status >= 400 || this.status === 0) {
        push(state.network, {
          method: meta.method,
          url: meta.url,
          status: this.status,
          statusText: this.statusText || "failed",
        });
      }
    });
    return originalSend.apply(this, rest);
  };

  window.addEventListener("traceforge-request", () => {
    window.dispatchEvent(
      new CustomEvent("traceforge-update", { detail: { ...state } }),
    );
  });
})();
