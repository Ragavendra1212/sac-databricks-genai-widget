{
  "id": "com.databricks.sac.widget",
  "name": "Databricks GenAI Widget",
  "description": "Custom widget for calling Databricks Model Serving.",
  "version": "1.0.0",
  "newInstancePrefix": "DBW_",
  "properties": {
    "apiUrl": {
      "type": "string",
      "default": "https://dbc-05d89f38-ae70.cloud.databricks.com/serving-endpoints/Raghav_GENAI_new_endpoint_v1/invocations"
    },
    "token": {
      "type": "string",
      "default": ""
    }
  },
  "methods": {
    "callDatabricks": { "description": "Calls the Databricks endpoint" }
  },
  "events": {
    "onResponse": { "description": "Fired when Databricks returns output" }
  },
  "webcomponents": [
    {
      "kind": "main",
      "tag": "databricks-widget",
      "url": "widget.js",
      "integrity": "sha256-Vp8GEa2z0RZ3+q6Q2D8CD9rl3V3Ccl0xrmIqqRS0X/k="
    }
  ]
}
