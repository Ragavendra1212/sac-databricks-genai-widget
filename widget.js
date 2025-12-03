(function () {
  // Very simple custom element, no modern JS features
  function DatabricksGenAIWidget() {
    return Reflect.construct(HTMLElement, [], DatabricksGenAIWidget);
  }

  DatabricksGenAIWidget.prototype = Object.create(HTMLElement.prototype);
  DatabricksGenAIWidget.prototype.constructor = DatabricksGenAIWidget;

  DatabricksGenAIWidget.prototype.connectedCallback = function () {
    var shadow = this.attachShadow({ mode: "open" });

    var container = document.createElement("div");
    container.style.fontFamily = "Arial, sans-serif";
    container.style.fontSize = "12px";
    container.style.padding = "8px";
    container.style.border = "1px solid #ccc";
    container.style.borderRadius = "4px";
    container.style.background = "#fafafa";

    var title = document.createElement("h4");
    title.textContent = "Databricks GenAI Widget";

    var info = document.createElement("div");
    info.textContent =
      "If you can see this box, the widget JS loaded correctly.";
    info.style.fontSize = "11px";

    container.appendChild(title);
    container.appendChild(info);
    shadow.appendChild(container);
  };

  customElements.define("databricks-genai-widget", DatabricksGenAIWidget);
})();
