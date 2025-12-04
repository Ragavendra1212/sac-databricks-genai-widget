(function () {
  console.log("DatabricksWidget.js: script loaded");

  // ==== HARD-CODED CONFIG (PoC ONLY) ====
  const DATABRICKS_ENDPOINT_DEFAULT =
    "https://dbc-05d89f38-ae70.cloud.databricks.com/serving-endpoints/Raghav_GENAI_new_endpoint_v1/invocations";

  // TODO: put your real PAT here for PoC only.
  // Example: const DATABRICKS_PAT = "dapiXXXXXXXXXXXXXXXXXXXXXXXX";
  const DATABRICKS_PAT = "dapi0ad1c5b54cc96ca836171a69f845811f"
  // ======================================

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
        <div class="title" id="title">Databricks GENAI</div>
        <div class="status" id="status">Idle</div>
      </div>

      <textarea id="promptInput" placeholder="Type your question for the Databricks model..."></textarea>

      <div>
        <button id="runButton">Invoke Databricks</button>
      </div>

      <pre id="output">// Response will appear here</pre>
    </div>
  `;

  class DatabricksWidget extends HTMLElement {
    constructor() {
      super();
      this._props = {};

      // mapped from JSON properties
      this.title = "Databricks GENAI";
      this.endpointUrl = DATABRICKS_ENDPOINT_DEFAULT;
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
        this.title = this._props.title || "Databricks GENAI";
        if (this._titleEl) {
          this._titleEl.textContent = this.title;
        }
      }
      if ("endpointUrl" in this._props && this._props.endpointUrl) {
        this.endpointUrl = this._props.endpointUrl;
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

    // ===== Methods referenced in JSON "methods" bodies (optional) =====
    setEndpointUrl(endpointUrl) {
      this.endpointUrl = endpointUrl;
    }
    getEndpointUrl() {
      return this.endpointUrl;
    }
    setMax_tokens(max_tokens) {
      this.max_tokens = max_tokens;
    }
    getMax_tokens() {
      return this.max_tokens;
    }

    // ===== Convenience methods for SAC scripting =====
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

    _fireOnClick() {
      const ev = new CustomEvent("onClick", {
        detail: { message: "Invoke button clicked" },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(ev);
    }

    _onRunClick() {
      this._fireOnClick();
      this._callDatabricks();
    }

    _callDatabricks() {
      const endpoint = this.endpointUrl || DATABRICKS_ENDPOINT_DEFAULT;
      const token = DATABRICKS_PAT;
      const self = this;

      if (!endpoint) {
        this._outputEl.textContent =
          "Endpoint URL is not set. Please configure 'endpointUrl' in the widget properties or in DATABRICKS_ENDPOINT_DEFAULT.";
        return;
      }

      if (!token || token.startsWith("<PUT_")) {
        this._outputEl.textContent =
          "DATABRICKS_PAT is not set in DatabricksWidget.js. Please set it for PoC.";
        return;
      }

      const userPrompt =
        (this._promptInput && this._promptInput.value) || "";

      const finalPrompt = this.systemPrompt
        ? this.systemPrompt + "\n\n" + userPrompt
        : userPrompt;

      if (!finalPrompt) {
        this._outputEl.textContent = "Please enter a prompt.";
        return;
      }

      this._setStatus("Calling...");
      this._outputEl.textContent = "// Calling Databricks endpoint...";

      const body = {
        prompt: finalPrompt,
        max_tokens: this.max_tokens
      };

      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
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
                "HTTP " + response.status + ":\n\n" + text;
              return;
            }

            self._setStatus("Done");
            self._outputEl.textContent = JSON.stringify(data, null, 2);
          });
        })
        .catch(function (err) {
          self._setStatus("Error");
          self._outputEl.textContent =
            "Error calling Databricks:\n\n" +
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
