(function () {
  class DatabricksGenAIWidget extends HTMLElement {
    constructor() {
      super();

      // Create shadow root
      const shadow = this.attachShadow({ mode: "open" });

      // Simple container
      const container = document.createElement("div");
      container.style.fontFamily = "Arial, sans-serif";
      container.style.fontSize = "12px";
      container.style.padding = "8px";
      container.style.border = "1px solid #ccc";
      container.style.borderRadius = "4px";
      container.style.background = "#fafafa";

      const title = document.createElement("h4");
      title.textContent = "Databricks GenAI Widget";

      const info = document.createElement("div");
      info.textContent = "If you can see this, the custom widget JS loaded correctly.";
      info.style.fontSize = "11px";

      container.appendChild(title);
      container.appendChild(info);
      shadow.appendChild(container);
    }
  }

  // Register custom element
  customElements.define("databricks-genai-widget", DatabricksGenAIWidget);
})();
