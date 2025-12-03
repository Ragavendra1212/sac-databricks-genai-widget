(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: block;
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: #222;
      }
      .builder-wrapper {
        padding: 6px;
      }
      .title {
        font-weight: bold;
        margin-bottom: 4px;
      }
      .text {
        font-size: 11px;
      }
    </style>
    <div class="builder-wrapper">
      <div class="title">Databricks GENAI Widget (Builder)</div>
      <div class="text">
        Configure properties like <b>endpointUrl</b>, <b>patToken</b>, <b>max_tokens</b>, and <b>systemPrompt</b> from the right-side Builder panel.
      </div>
    </div>
  `;

  class DatabricksWidgetBuilder extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // No special builder logic needed; SAC uses JSON properties
    onCustomWidgetBeforeUpdate(changedProperties) {}
    onCustomWidgetAfterUpdate(changedProperties) {}
    onCustomWidgetResize(width, height) {}
    onCustomWidgetDestroy() {}
  }

  customElements.define(
    "com-raghavendra-sap-databrickswidget-builder",
    DatabricksWidgetBuilder
  );
})();
