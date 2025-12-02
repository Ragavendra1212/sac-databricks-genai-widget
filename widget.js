class DatabricksWidget extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <style>
                .box { font-family: Arial; padding: 12px; border: 1px solid #ccc; }
                textarea { width: 100%; height: 70px; margin-top: 8px; }
                button { margin-top: 10px; padding: 8px; width: 100%; }
                .response {
                    margin-top: 12px; padding: 10px; 
                    background: #f9f9f9; border: 1px solid #ddd;
                    min-height: 60px;
                }
            </style>

            <div class="box">
                <label>Enter Databricks Prompt:</label>
                <textarea id="prompt"></textarea>

                <button id="btn">Send to Databricks</button>

                <div class="response" id="response">Response here...</div>
            </div>
        `;
    }

    // Called when widget loads
    connectedCallback() {
        this.shadowRoot.getElementById("btn")
            .addEventListener("click", () => this.callDatabricks());
    }

    async callDatabricks() {
        const prompt = this.shadowRoot.getElementById("prompt").value;
        const box = this.shadowRoot.getElementById("response");

        box.innerHTML = "Calling Databricks...";

        const url = this.apiUrl;
        const token = this.token;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "inputs": prompt
                })
            });

            const data = await res.json();

            box.innerHTML = data.outputs || JSON.stringify(data);

            // Dispatch to SAC application
            this.dispatchEvent(
                new CustomEvent("onResponse", {
                    detail: data,
                    bubbles: true,
                    composed: true
                })
            );

        } catch (err) {
            box.innerHTML = "Error: " + err.message;
        }
    }

    // SAC property setters
    set apiUrl(val) { this._apiUrl = val; }
    get apiUrl() { return this._apiUrl; }

    set token(val) { this._token = val; }
    get token() { return this._token; }
}

customElements.define("databricks-widget", DatabricksWidget);
