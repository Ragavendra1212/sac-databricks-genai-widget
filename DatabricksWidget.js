(function () {
  console.log("DatabricksWidget.js (proxy version): script loaded");

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
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #fafafa;
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
        <div class="title" id="title">Databricks GENAI via Proxy</div>
        <div class="status" id="status">Idle</div>
      </div>

      <textarea id="promptInput" placeholder="Type your question for the Databricks model..."></textarea>

      <div>
        <button id="runButton">Invoke via Proxy</button>
      </div>

      <pre id="output">// Response will appear here</pre>
    </div>
  `;

  class DatabricksWidget extends HTMLElement {
    constructor() {
      super();
      this._props = {};

      // default values (can be overridden by SAC properties)
      this.title = "Databricks GENAI via Proxy";
      this.proxyUrl = "http://127.0.0.1:5000/invoke"; // local testing default
      this.defaultPrompt = "Hello from SAP Analytics Cloud";
      this.max_tokens = 1024;
      this.systemPrompt = "";

      const shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(template.content.cloneNode(true));

      this._titleEl = shadow.getElementById("title");
      this._statusEl = shadow.getElementById("status");
      this._promptInput = shadow.getElementById("promptInput");
      this._runButton = shadow.getElementById("runButton");
      this._outputEl = shadow.getElementById("output");

      this._onRunClick = this._onRunClick.bind(this);
    }

    // ===== SAC lifecycle hooks =====
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props, changedProperties);
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      if ("title" in this._props) {
        this.title = this._props.title || "Databricks GENAI via Proxy";
        if (this._titleEl) {
          this._titleEl.textContent = this.title;
        }
      }
      if ("proxyUrl" in this._props && this._props.proxyUrl) {
        this.proxyUrl = this._props.proxyUrl;
      }
      if ("defaultPrompt" in this._props) {
        this.defaultPrompt =
          this._props.defaultPrompt || "Hello from SAP Analytics Cloud";
      }
      if ("max_tokens" in this._props) {
        this.max_tokens = this._props.max_tokens;
      }
      if ("systemPrompt" in this._props) {
        this.systemPrompt = this._props.systemPrompt || "";
      }
    }

    onCustomWidgetResize(width, height) {}
    onCustomWidgetDestroy() {}

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

    // Optional scripting helpers
    refresh() {
      this._callDatabricks();
    }

    setPrompt(prompt) {
      if (this._promptInput) {
        this._promptInput.value = prompt || "";
      }
    }

    // ===== Internal helpers =====
    _setStatus(text) {
      if (this._statusEl) {
        this._statusEl.textContent = text;
      }
    }

    _onRunClick() {
      this._callDatabricks();
    }

    _callDatabricks() {
      // Use property from SAC if set, else fallback to this.proxyUrl
      const proxyUrl =
        (this._props && this._props.proxyUrl) ||
        this.proxyUrl ||
        "";

      const promptText =
        (this._promptInput && this._promptInput.value) ||
        (this._props && this._props.defaultPrompt) ||
        this.defaultPrompt ||
        "Hello from SAP Analytics Cloud";

      if (!proxyUrl) {
        this._outputEl.textContent =
          "proxyUrl property is not set. Please configure it in the widget properties.";
        return;
      }

      this._setStatus("Calling proxy...");
      this._outputEl.textContent = "// Calling proxy: " + proxyUrl;

      const body = {
        prompt: promptText,
        max_tokens: this.max_tokens
      };

      const self = this;

      fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
        .then(function (response) {
          return response.text().then(function (text) {
            let data;
            try {
              data = JSON.parse(text);
            } catch (e) {
              data = text;
            }

            if (!response.ok) {
              self._setStatus("Error");
              self._outputEl.textContent =
                "HTTP " + response.status + " from proxy:\n\n" + text;
              return;
            }

            self._setStatus("Done");
            self._outputEl.textContent = JSON.stringify(data, null, 2);
          });
        })
        .catch(function (err) {
          self._setStatus("Error");
          self._outputEl.textContent =
            "Error calling proxy:\n\n" +
            (err && err.message ? err.message : String(err));
        });
    }
  }

  // Tag MUST match JSON "tag"
  customElements.define(
    "com-raghavendra-sap-databrickswidget",
    DatabricksWidget
  );
})();
