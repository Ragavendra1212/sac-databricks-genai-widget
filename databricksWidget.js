(function () {
  // ====== CONFIG – CHANGE THESE VALUES FOR YOUR USE CASE ======
  // Your Databricks serving endpoint URL:
  const ENDPOINT_URL =
    "https://dbc-05d89f38-ae70.cloud.databricks.com/serving-endpoints/Raghav_GENAI_new_endpoint_v1/invocations";

  // Databricks personal access token (PAT) – for PoC ONLY.
  // Example: "dapiXXXXXXXXXXXXXXXXXXXXXXXX"
  const AUTH_TOKEN = "dapi0ad1c5b54cc96ca836171a69f845811f";
  // ============================================================

  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: block;
        font-family: Arial, sans-serif;
        font-size: 13px;
        color: #222;
      }

      .wrapper {
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
      }

      .title {
        font-size: 14px;
      }

      .status {
        font-size: 11px;
        opacity: 0.7;
      }

      textarea {
        resize: vertical;
        min-height: 60px;
        max-height: 200px;
        width: 100%;
        box-sizing: border-box;
      }

      button {
        padding: 4px 10px;
        cursor: pointer;
      }

      pre {
        flex: 1;
        margin: 0;
        padding: 6px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        overflow: auto;
        font-family: Consolas, monospace;
        font-size: 12px;
      }
    </style>

    <div class="wrapper">
      <div class="header">
        <div class="title" id="title">Databricks GEN AI</div>
        <div class="status" id="status">Idle</div>
      </div>

      <textarea id="promptInput" placeholder="Type your question for the Databricks model..."></textarea>

      <div>
        <button id="runButton">Call Databricks</button>
      </div>

      <pre id="output">// Response will appear here</pre>
    </div>
  `;

  class RaghavDatabricksWidget extends HTMLElement {
    constructor() {
      super();
      this._props = {};
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));

      this._titleEl = this._shadowRoot.getElementById("title");
      this._statusEl = this._shadowRoot.getElementById("status");
      this._promptInput = this._shadowRoot.getElementById("promptInput");
      this._runButton = this._shadowRoot.getElementById("runButton");
      this._outputEl = this._shadowRoot.getElementById("output");

      this._onRunClick = this._onRunClick.bind(this);
    }

    // ===== SAC lifecycle hooks =====
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props, changedProperties);
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      if ("title" in this._props && this._titleEl) {
        this._titleEl.textContent = this._props.title || "Databricks GEN AI";
      }

      if ("defaultPrompt" in this._props && this._promptInput) {
        if (!this._promptInput.value) {
          this._promptInput.value = this._props.defaultPrompt || "";
        }
      }

      if ("autoCallOnLoad" in this._props && this._props.autoCallOnLoad) {
        this._callDatabricks();
      }
    }

    onCustomWidgetResize(width, height) {
      // no-op for now
    }

    onCustomWidgetDestroy() {
      // no-op for now
    }

    connectedCallback() {
      if (this._runButton) {
        this._runButton.addEventListener("click", this._onRunClick);
      }
    }

    disconnectedCallback() {
      if (this._runButton) {
        this._runButton.removeEventListener("click", this._onRunClick);
      }
    }

    // ===== Methods exposed to SAC scripting =====

    // SAC: widget.refresh();
    refresh() {
      this._callDatabricks();
    }

    // SAC: widget.setPrompt("some text");
    setPrompt(prompt) {
      if (this._promptInput) {
        this._promptInput.value = prompt || "";
      }
    }

    // ===== Internal helpers =====

    _onRunClick() {
      this._callDatabricks();
    }

    _setStatus(text) {
      if (this._statusEl) {
        this._statusEl.textContent = text;
      }
    }

    _fireEvent(name, detail) {
      const event = new CustomEvent(name, {
        detail: detail,
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    }

    async _callDatabricks() {
      if (!ENDPOINT_URL) {
        this._outputEl.textContent = "ENDPOINT_URL is not configured in widget.js.";
        return;
      }

      if (!AUTH_TOKEN || AUTH_TOKEN.startsWith("<PUT_")) {
        this._outputEl.textContent =
          "AUTH_TOKEN is not set. Please configure your Databricks PAT in widget.js.";
        return;
      }

      const promptText =
        (this._promptInput && this._promptInput.value) ||
        (this._props && this._props.defaultPrompt) ||
        "Hello from SAP Analytics Cloud";

      this._setStatus("Calling...");
      this._outputEl.textContent = "// Calling Databricks endpoint...";

      try {
        // IMPORTANT: adjust this body to match what your serving endpoint expects.
        // For now we send { "prompt": "<text>" } like your proxy.
        const requestBody = {
          prompt: promptText
        };

        const response = await fetch(ENDPOINT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + AUTH_TOKEN
          },
          body: JSON.stringify(requestBody)
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = text; // not JSON
        }

        if (!response.ok) {
          this._setStatus("Error");
          this._outputEl.textContent =
            "HTTP " + response.status + ":\n\n" + text;
          this._fireEvent("onError", {
            message: "HTTP " + response.status,
            body: data
          });
          return;
        }

        this._setStatus("Done");
        this._outputEl.textContent = JSON.stringify(data, null, 2);
        this._fireEvent("onResult", { result: data });
      } catch (err) {
        this._setStatus("Error");
        this._outputEl.textContent =
          "Error calling Databricks:\n\n" + (err && err.message ? err.message : err);
        this._fireEvent("onError", {
          message: err && err.message ? err.message : String(err)
        });
      }
    }
  }

  // ==== CRITICAL: tag must match JSON ====
  customElements.define("raghav-dbx-widget", RaghavDatabricksWidget);
})();
