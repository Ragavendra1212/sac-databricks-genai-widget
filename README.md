# Databricks GenAI SAC Custom Widget

This repository contains a ready-to-use **SAP Analytics Cloud Custom Widget**
that connects to a **Databricks Model Serving Endpoint** through  
the **SAC HTTP API Connection**.

---

## 🚀 Features

- Custom UI inside SAC (textarea + button + output box)
- Calls Databricks Serving Endpoint:
  `/serving-endpoints/Raghav_GENAI_new_endpoint/invocations`
- Uses SAC HTTP API connection (OAuth2 Client Credentials)
- Emits "onResponse" event when data returns

---

## 📂 Files

| File            | Description |
|-----------------|-------------|
| `manifest.json` | SAC widget metadata & structure |
| `widget.js`     | Web component logic |
| `icon.png`      | Widget icon (add any 128×128 PNG) |
| `README.md`     | Documentation |

---

## 🔧 How to Use in SAP Analytics Cloud

### 1. Create HTTP API Connection  
Go to:  
**System → Administration → App Integration → Connections**

- Type: **HTTP API**
- Auth: **OAuth 2.0 Client Credentials**
- Data Service URL:  
  `https://dbc-05d89f38-ae70.cloud.databricks.com`
- Token URL:  
  `https://dbc-05d89f38-ae70.cloud.databricks.com/oauth2/token`
- Scope: *leave empty*

### 2. Import Custom Widget ZIP  
Go to:  
**System → Administration → App Integration → Custom Widgets → Import**

Upload the ZIP made from this repository.

### 3. Use in Analytic Application  
Add widget → Set properties:

- `connectionName`: your SAC connection (e.g. `gen_ai`)
- `endpointPath`: keep default

Then use:

```js
YOUR_WIDGET.callBackend();
