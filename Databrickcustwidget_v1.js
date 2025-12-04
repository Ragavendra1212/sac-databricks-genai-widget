(function () {
  console.log("DatabricksWidget.js (proxy version, UX enhanced): script loaded");

  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: block;
        font-family: Arial, sans-serif;
        font-size: 16px;
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
      .status-area {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
      }
      .status {
        opacity: 0.8;
      }
      .spinner {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #ccc;
        border-top-color: #0070f2;
        animation: spin 0.8s linear infinite;
        display: none;
      }
      .spinner.active {
        display: inline-block;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }

      textarea {
        resize: vertical;
        min-height: 60px;
        max-height: 200px;
        width: 100%;
        box-sizing: border-box;
        padding: 4px;
      }
      .buttons {
        display: flex;
        gap: 6px;
      }
      button {
        padding: 4px 10px;
        cursor: pointer;
        border-radius: 3px;
        border: 1px solid #ccc;
        background: #f0f0f0;
      }
      button:disabled {
        opacity: 0.6;
        cursor: default;
      }
      pre {
        flex: 1;
        margin: 0;
        padding: 6px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 3px;
        overflow: auto;
        font-family: Consolas, monospace;
        font-size: 12px;
        white-space: pre-wrap;
      }
      pre.error {
        border-color: #d00000;
        background: #fff0f0;
        color: #800000;
      }
      .hint {
        font-size: 10px;
        opacity: 0.7;
      }
    </style>

    <div class="wrapper">
      <div class="header">
        <div class="title" id="title">Databricks GENAI</div>
        <div class="status-area">
          <div class="spinner" id="spinner"></div>
          <div class="status" id="status">Idle</div>
        </div>
      </div>

      <textarea id="promptInput" placeholder="Type your question for the Databricks model..."></textarea>
      <div class="hint">The request is sent to your configured proxy URL, which then calls Databricks.</div>

      <div class="buttons">
        <button id="runButton">Submit</button>
        <button id="clearButton">Clear</button>
      </div>

      <pre id="output">// Prompt Ouput will appear here</pre>
    </div>
  `;

  class DatabricksWidget extends HTMLElement {
    constructor() {
      super();
      this._props = {};

      // default values (can be overridden by SAC properties)
      this.title = "Databricks GENAI";
      this.proxyUrl = "http://127.0.0.1:5000/invoke"; // local testing default
      this.defaultPrompt = "Hello from SAP Analytics Cloud";
      this.max_tokens = 1024;
      this.systemPrompt = "";

      const shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(template.content.cloneNode(true));

      this._titleEl = shadow.getElementById("title");
      this._statusEl = shadow.getElementById("status");
      this._spinnerEl = shadow.getElementById("spinner");
      this._promptInput = shadow.getElementById("promptInput");
      this._runButton = shadow.getElementById("runButton");
      this._clearButton = shadow.getElementById("clearButton");
      this._outputEl = shadow.getElementById("output");

      this._onRunClick = this._onRunClick.bind(this);
      this._onClearClick = this._onClearClick.bind(this);
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
      if (this._clearButton) {
        this._clearButton.addEventListener("click", this._onClearClick);
      }
    }

    disconnectedCallback() {
      if (this._runButton) {
        this._runButton.removeEventListener("click", this._onRunClick);
      }
      if (this._clearButton) {
        this._clearButton.removeEventListener("click", this._onClearClick);
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
    _setStatus(text, isBusy) {
      if (this._statusEl) {
        this._statusEl.textContent = text;
      }
      if (this._spinnerEl) {
        if (isBusy) {
          this._spinnerEl.classList.add("active");
        } else {
          this._spinnerEl.classList.remove("active");
        }
      }
      if (this._runButton) {
        this._runButton.disabled = !!isBusy;
      }
    }

    _setOutput(text, isError) {
      if (!this._outputEl) return;
      this._outputEl.textContent = text;
      if (isError) {
        this._outputEl.classList.add("error");
      } else {
        this._outputEl.classList.remove("error");
      }
    }

    _onRunClick() {
      this._callDatabricks();
    }

    _onClearClick() {
      if (this._promptInput) {
        this._promptInput.value = "";
      }
      this._setOutput("// Response will appear here", false);
      this._setStatus("Idle", false);
    }

    _extractTextFromResponse(data) {
      // Try to map common LLM / Databricks response shapes to plain text
      if (data == null) {
        return "";
      }

      if (typeof data === "string") {
        return data;
      }

      // Common OpenAI-like: { choices: [ { text: "..."} ] }
      if (data.choices && data.choices.length > 0) {
        const c0 = data.choices[0];
        if (typeof c0.text === "string") {
          return c0.text;
        }
        if (c0.message && typeof c0.message.content === "string") {
          return c0.message.content;
        }
      }

      // Databricks-style generic fields
      if (typeof data.result === "string") {
        return data.result;
      }
      if (typeof data.output === "string") {
        return data.output;
      }
      if (typeof data.response === "string") {
        return data.response;
      }

      // Sometimes it's an array of texts
      if (Array.isArray(data) && data.length > 0) {
        if (typeof data[0] === "string") {
          return data.join("\n");
        }
      }

      // Fallback: pretty-printed JSON
      try {
        return JSON.stringify(data, null, 2);
      } catch (e) {
        return String(data);
      }
    }

    _callDatabricks() {
      // Use property from SAC if set, else fallback to this.proxyUrl
      const proxyUrl =
        (this._props && this._props.proxyUrl) ||
        this.proxyUrl ||
        "";

      const promptTextRaw =
        (this._promptInput && this._promptInput.value) ||
        (this._props && this._props.defaultPrompt) ||
        this.defaultPrompt ||
        "Hello from SAP Analytics Cloud";

      const promptText = this.systemPrompt
        ? this.systemPrompt + "\n\n" + promptTextRaw
        : promptTextRaw;

      if (!proxyUrl) {
        this._setOutput(
          "proxyUrl property is not set. Please configure it in the widget properties.",
          true
        );
        this._setStatus("Error", false);
        return;
      }

      if (!promptText || !promptText.trim()) {
        this._setOutput("Please enter a prompt.", true);
        this._setStatus("Error", false);
        return;
      }

      this._setStatus("Calling proxy...", true);
      this._setOutput("// Calling proxy: " + proxyUrl, false);

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
              self._setStatus("Error", false);
              self._setOutput(
                "HTTP " + response.status + " from proxy:\n\n" + text,
                true
              );
              return;
            }

            const cleanText = self._extractTextFromResponse(data);

            self._setStatus("Done", false);
            self._setOutput(cleanText || "(Empty response)", false);
          });
        })
        .catch(function (err) {
          self._setStatus("Error", false);
          self._setOutput(
            "Error calling proxy:\n\n" +
              (err && err.message ? err.message : String(err)),
            true
          );
        });
    }
  }

  // Tag MUST match JSON "tag"
  customElements.define(
    "com-raghavendra-sap-databrickswidget",
    DatabricksWidget
  );
})();
