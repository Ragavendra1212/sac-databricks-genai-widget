class DatabricksGenAIWidget extends HTMLElement {
  constructor() {
    super();

    // Shadow DOM
    const shadow = this.attachShadow({ mode: "open" });

    // Container
    const container = document.createElement("div");
    container.style.fontFamily = "Arial, sans-serif";
    container.style.padding = "8px";
    container.style.fontSize = "12px";
    container.style.border = "1px solid #ccc";
    container.style.borderRadius = "4px";
    container.style.background = "#fafafa";

    const title = document.createElement("h4");
    title.textContent = "Databricks GenAI Widget";

    const info = document.createElement("div");
    info.textContent = "Local HTML test – if you see this, the widget is defined correctly.";
    info.style.fontSize = "11px";
    info.style.marginBottom = "8px";

    const promptLabel = document.createElement("div");
    promptLabel.textContent = "Prompt:";
    promptLabel.style.fontWeight = "bold";

    this._promptArea = document.createElement("textarea");
    this._promptArea.style.width = "100%";
    this._promptArea.style.height = "60px";
    this._promptArea.style.boxSizing = "border-box";

    this._button = document.createElement("button");
    this._button.textContent = "Call Databricks (dummy)";
    this._button.style.marginTop = "8px";
    this._button.style.padding = "6px 12px";
    this._button.style.cursor = "pointer";

    this._status = document.createElement("div");
    this._status.style.marginTop = "6px";
    this._status.style.fontSize = "11px";
    this._status.style.color = "#555";

    const responseLabel = document.createElement("div");
    responseLabel.textContent = "Response:";
    responseLabel.style.marginTop = "8px";
    responseLabel.style.fontWeight = "bold";

    this._responsePre = document.createElement("pre");
    this._responsePre.style.background = "#f7f7f7";
    this._responsePre.style.padding = "6px";
    this._responsePre.style.minHeight = "80px";
    this._responsePre.style.whiteSpace = "pre-wrap";
    this._responsePre.style.border = "1px solid #ddd";

    container.appendChild(title);
    container.appendChild(info);
    container.appendChild(promptLabel);
    container.appendChild(this._promptArea);
    container.appendChild(this._button);
    container.appendChild(this._status);
    container.appendChild(responseLabel);
    container.appendChild(this._responsePre);

    shadow.appendChild(container);

    // Button handler – no real call yet, just test UI works
    this._button.addEventListener("click", () => {
      const prompt = this._promptArea.value.trim() || "(empty prompt)";
      this._status.textContent = "Button clicked in local test.";
      this._responsePre.textContent = `You entered: ${prompt}`;
    });
  }
}

customElements.define("databricks-genai-widget", DatabricksGenAIWidget);
