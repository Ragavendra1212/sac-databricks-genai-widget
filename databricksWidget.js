(function () {
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
      this.apiKey = "";      // patToken mapping
      this.max_tokens = 1024;
      this.endpointUrl = "";
      this.systemPrompt = "";

      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));

      this._titleEl = this._shadowRoot.getElementById("title");
      this._statusEl = this._shadowRoot.getElementById("status");
      this._promptInput = this._shadowRoot.getElementById("promptInput");
      this._runButton = this._shadowRoot.getElementById("runButton");
      this._outputEl = this._shadowRoot.getElementById("output");

      this._onRunClick = this._onRunClick.bind(this);
    }

    // === SAC lifecycle hooks ===
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props, changedProperties);
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      if ("title" in this._props && this._titleEl) {
        this._titleEl.textContent = this._props.title || "Databricks GENAI";
      }

      if ("endpointUrl" in this._props) {
        this.endpointUrl = this._props.endpointUrl;
      }

      if ("patToken" in this._props) {
        this.apiKey = this._props.patToken;
      }

      if ("max_tokens" in this._props) {
        this.max_tokens = this._props.max_tokens;
      }

      if ("systemPrompt" in this._props) {
        this.systemPrompt = this._props.systemPrompt || "";
      }
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

    // === Methods called from JSON "methods" bodies (optional) ===
    setEndpointUrl(endpointUrl) {
      this.endpointUrl = endpointUrl;
    }

    getEndpointUrl() {
      return this.endpointUrl;
    }

    setPatToken(patToken) {
      this.apiKey = patToken;
    }

    getPatToken() {
      return this.apiKey;
    }

    setMax_tokens(max_tokens) {
      this.max_tokens = max_tokens;
    }

    getMax_tokens() {
      return this.max_tokens;
    }

    // === Public methods for SAC scripting (if needed) ===
    refresh() {
      this._callDatabricks();
    }

    setPrompt(prompt) {
      if (this._promptInput) {
        this._promptInput.value = prompt || "";
      }
    }

    // === Internal helpers ===
    _setStatus(text) {
      if (this._statusEl) {
        this._statusEl.textContent = text;
      }
    }

    _onRunClick() {
      this._fireOnClick();
      this._callDatabricks();
    }

    _fireOnClick() {
      // To match "onClick" event in JSON
      const event = new CustomEvent("onClick", {
        detail: { message: "Invoke button clicked" },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    }

    async _callDatabricks() {
      const endpoint = this.endpointUrl || (this._props && this._props.endpointUrl);
      const token = this.apiKey || (this._props && this._props.patToken);

      if (!endpoint) {
        this._outputEl.textContent =
          "Endpoint URL is not set. Please configure 'endpointUrl' in the widget properties.";
        return;
      }

      if (!token) {
        this._outputEl.textContent =
          "PAT token is not set. Please configure 'patToken' in the widget properties.";
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

      try {
        // Adjust the body to what your Databricks endpoint expects.
        // Here we send { prompt, max_tokens } like your earlier proxy.
        const body = {
          prompt: finalPrompt,
          max_tokens: this.max_tokens
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify(body)
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
          return;
        }

        this._setStatus("Done");
        this._outputEl.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        this._setStatus("Error");
        this._outputEl.textContent =
          "Error calling Databricks:\n\n" +
          (err && err.message ? err.message : String(err));
      }
    }
  }

  // TAG MUST MATCH JSON "tag"
  customElements.define(
    "com-raghavendra-sap-databrickswidget",
    DatabricksWidget
  );
})();
