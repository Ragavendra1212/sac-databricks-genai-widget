class DatabricksWidget extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <style>
                .box { font-family: Arial; padding: 12px; border: 1px solid #ccc; border-radius: 6px; }
                textarea { width: 100%; height: 70px; margin-top: 8px; }
                button { margin-top: 10px; padding: 8px; width: 100%; cursor: pointer; }
                .response {
                    margin-top: 12px; padding: 10px;
                    background: #f9f9f9; border: 1px solid #ddd;
                    min-height: 60px; white-space: pre-wrap;
                }
            </style>

            <div class="box">
                <label><b>Databricks Prompt:</b></label>
                <textarea id="prompt"></textarea>

                <button id="btn">Send to Databricks</button>

                <div class="response" id="response">Response will appear here…</div>
            </div>
        `;
    }

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
                body: JSON.stringify({ "inputs": prompt })
            });

            const data = await res.json();

            box.innerHTML = data.outputs || JSON.stringify(data, null, 2);

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

    set apiUrl(v) { this._apiUrl = v; }
    get apiUrl() { return this._apiUrl; }

    set token(v) { this._token = v; }
    get token() { return this._token; }
}

customElements.define("databricks-widget", DatabricksWidget);
