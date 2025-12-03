(function () {
  // Simple log so we can see if SAC actually loads this file
  console.log("Raghav SAC widget script loaded");

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
        margin-bottom: 4px;
      }
      .body {
        font-size: 12px;
      }
    </style>

    <div class="wrapper">
      <div class="title">Databricks GEN AI (CDN)</div>
      <div class="body">
        If you see this in SAC, the custom widget loaded and the constructor worked.
      </div>
    </div>
  `;

  function RaghavDatabricksWidget() {
    const self = Reflect.construct(HTMLElement, [], RaghavDatabricksWidget);
    self._shadowRoot = self.attachShadow({ mode: "open" });
    self._shadowRoot.appendChild(template.content.cloneNode(true));
    return self;
  }

  RaghavDatabricksWidget.prototype = Object.create(HTMLElement.prototype);
  RaghavDatabricksWidget.prototype.constructor = RaghavDatabricksWidget;

  // SAC lifecycle hooks – safe no-ops
  RaghavDatabricksWidget.prototype.onCustomWidgetBeforeUpdate = function (changedProps) {};
  RaghavDatabricksWidget.prototype.onCustomWidgetAfterUpdate = function (changedProps) {};
  RaghavDatabricksWidget.prototype.onCustomWidgetResize = function (w, h) {};
  RaghavDatabricksWidget.prototype.onCustomWidgetDestroy = function () {};

  // CRITICAL: tag must match JSON exactly
  customElements.define("raghav-dbx-widget", RaghavDatabricksWidget);
})();
