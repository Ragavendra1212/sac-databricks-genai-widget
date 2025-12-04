(function () {
  console.log("RaghavTestWidget.js: script loaded");

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
      }
      .title {
        font-weight: bold;
        font-size: 14px;
      }
      .body {
        margin-top: 4px;
        font-size: 12px;
      }
    </style>
    <div class="wrapper">
      <div class="title" id="title">Hello from Raghav</div>
      <div class="body">
        If you see this in SAC, jsDelivr + your repo are working with this widget.
      </div>
    </div>
  `;

  class RaghavTestWidget extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(template.content.cloneNode(true));
      this._titleEl = shadow.getElementById("title");
    }

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props || {}, changedProperties);
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      if (this._props && "title" in this._props && this._titleEl) {
        this._titleEl.textContent = this._props.title || "Hello from Raghav";
      }
    }
  }

  // Tag MUST match JSON exactly
  customElements.define("com-raghavendra-sap-testwidget", RaghavTestWidget);
})();
