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

  class DatabricksWidget extends HTMLElement {
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

    // === SAC lifecycle hooks ===

    // Called by SAC before updating properties
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props, changedProperties);
    }

    // Called by SAC after properties change
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

    // === Public methods usable from SAC scripting ===

    // In SAC scripting: widget.refresh();
    refresh() {
      this._callDatabricks();
    }

    // In SAC scripting: widget.setPrompt("some text");
    setPrompt(prompt) {
      if (this._promptInput) {
        this._promptInput.value = prompt || "";
      }
    }

    // === Internal helpers ===

    _onRunClick() {
      this._callDatabricks();
    }

    _setStatus(text) {
      if (this._statusEl) {
        this._statusEl.textContent = text;
      }
    }

    _fireEvent(name, detail) {
      // SAC listens to DOM CustomEvent with the same name as defined in JSON
      const event = new CustomEvent(name, {
        detail: detail,
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    }

    async _callDatabricks() {
      // Default proxy URL:
      //  - For local index.html testing → http://127.0.0.1:5000/invoke
      //  - For SAC in production → CHANGE THIS to your HTTPS proxy URL
      const proxyUrl =
        (this._props && this._props.proxyUrl) ||
        "http://127.0.0.1:5000/invoke";

      const promptText =
        (this._promptInput && this._promptInput.value) ||
        (this._props && this._props.defaultPrompt) ||
        "Hello from SAP Analytics Cloud";

      if (!proxyUrl) {
        this._outputEl.textContent =
          "proxyUrl property is not set. Please configure it in the Builder panel.";
        this._fireEvent("onError", { message: "proxyUrl not configured" });
        return;
      }

      this._setStatus("Calling...");
      this._outputEl.textContent = "// Calling Databricks via proxy...";

      try {
        // IMPORTANT: match your Flask proxy's expectation:
        // it wants JSON body: { "prompt": "<text>" }
        const requestBody = {
          prompt: promptText
        };

        const response = await fetch(proxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = text; // if response is plain text
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
          "Error calling proxy:\n\n" + (err && err.message ? err.message : err);
        this._fireEvent("onError", {
          message: err && err.message ? err.message : String(err)
        });
      }
    }
  }

  customElements.define("raghav-dbx-widget", DatabricksWidget);
})();
