class DatabricksGenAIWidget extends HTMLElement {
  constructor() {
    super();

    this._shadow = this.attachShadow({ mode: "open" });

    // Internal state
    this._props = {
      proxyUrl: "",
      promptText: "",
      responseText: "",
      autoTriggerOnSelection: true
    };

    this._bindingData = null;

    // UI Elements
    const container = document.createElement("div");
    container.style.fontFamily = "Arial, sans-serif";
    container.style.padding = "8px";
    container.style.fontSize = "12px";

    const title = document.createElement("h4");
    title.innerText = "Databricks GenAI Widget";

    const promptLabel = document.createElement("div");
    promptLabel.innerText = "Prompt:";
    promptLabel.style.fontWeight = "bold";

    this.promptArea = document.createElement("textarea");
    this.promptArea.style.width = "100%";
    this.promptArea.style.height = "60px";
    this.promptArea.style.boxSizing = "border-box";

    this.button = document.createElement("button");
    this.button.innerText = "Call
