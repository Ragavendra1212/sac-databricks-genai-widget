(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: block;
        font-family: Arial, sans-serif;
        font-size: 14px;
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
      }
      .title {
        font-weight: bold;
        margin-bottom: 4px;
      }
      .body {
        font-size: 13px;
      }
    </style>
    <div class="wrapper">
      <div class="title" id="title">Hello from Custom Widget</div>
      <div class="body" id="body">If you see this in SAC, the widget loaded correctly.</div>
    </div>
  `;

  class HelloWidget extends HTMLElement {
    constructor() {
      super();
      this._props = {};
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));

      this._titleEl = this._shadowRoot.getElementById("title");
      this._bodyEl = this._shadowRoot.getElementById("body");
    }

    // SAC lifecycle – safe, minimal
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props, changedProperties);
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      if ("title" in this._props && this._titleEl) {
        this._titleEl.textContent = this._props.title || "Hello from Custom Widget";
      }
      if ("message" in this._props && this._bodyEl) {
        this._bodyEl.textContent = this._props.message;
      }
    }

    // optional but harmless
    onCustomWidgetResize(width, height) {
      // no-op for now
    }

    onCustomWidgetDestroy() {
      // no-op for now
    }
  }

  // IMPORTANT: tag must match JSON
  customElements.define("com-raghav-hello", HelloWidget);
})();
