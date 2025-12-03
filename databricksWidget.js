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
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #fafafa;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .title {
        font-weight: bold;
        font-size: 14px;
      }
      .body {
        font-size: 12px;
      }
    </style>

    <div class="wrapper">
      <div class="title" id="title">Databricks GEN AI</div>
      <div class="body" id="body">
        If you can see this text in SAC, the custom widget loaded successfully from the CDN.
      </div>
    </div>
  `;

  class RaghavDatabricksWidget extends HTMLElement {
    constructor() {
      super();
      this._props = {};
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));

      this._titleEl = this._shadowRoot.getElementById("title");
      this._bodyEl = this._shadowRoot.getElementById("body");
    }

    // ==== SAC lifecycle hooks (safe no-op style) ====
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props, changedProperties);
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      if ("title" in this._props && this._titleEl) {
        this._titleEl.textContent = this._props.title || "Databricks GEN AI";
      }
      if ("defaultPrompt" in this._props && this._bodyEl) {
        this._bodyEl.textContent =
          this._props.defaultPrompt ||
          "If you can see this text in SAC, the custom widget loaded successfully from the CDN.";
      }
    }

    onCustomWidgetResize(width, height) {
      // not needed for now
    }

    onCustomWidgetDestroy() {
      // not needed for now
    }

    // optional methods to match JSON (no harm)
    refresh() {
      // no-op for now
    }

    setPrompt(prompt) {
      if (this._bodyEl) {
        this._bodyEl.textContent = prompt || "";
      }
    }
  }

  // ==== CRITICAL: tag must match JSON exactly ====
  customElements.define("raghav-dbx-widget", RaghavDatabricksWidget);
})();
