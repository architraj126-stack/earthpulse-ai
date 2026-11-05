# EarthPulse AI — Backend REST API Documentation

The EarthPulse AI backend is powered by FastAPI, offering high-performance, asynchronous endpoints for retrieving NASA observations, executing statistical trend tests, querying the AI knowledge assistant, and downloading PDF reports.

- **Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **OpenAPI JSON**: `http://127.0.0.1:8000/openapi.json`

---

## 1. System Health

### `GET /api/health`
Returns runtime status, database connection state, and indexed document count.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "EarthPulse AI Backend",
  "version": "1.0.0",
  "timestamp": "2026-11-05T18:12:10.420513",
  "database": "SQLite Connected",
  "knowledge_base_documents": 28
}
```

---

## 2. Variables Registry

### `GET /api/variables`
Returns the catalogue of supported NASA environmental variables.

**Response `200 OK`**:
```json
[
  {
    "parameter": "T2M",
    "name": "Temperature at 2 Metres",
    "short_name": "Air Temperature",
    "unit": "°C",
    "definition": "Average ambient air temperature measured 2 metres above the surface...",
    "source": "NASA POWER / MERRA-2 Reanalysis & GEOS-5",
    "temporal_resolutions": ["daily", "monthly"],
    "category": "Thermal & Atmosphere",
    "scientific_context": "Direct indicator of thermodynamic planetary warming..."
  }
]
```

---

## 3. Data Retrieval & Processing

### `GET /api/data`
Fetches and cleans NASA POWER observations for a specific coordinate and time window.

**Query Parameters**:
- `latitude` (float, required): -90.0 to 90.0
- `longitude` (float, required): -180.0 to 180.0
- `variable` (string, default: `T2M`): `T2M`, `PRECTOTCORR`, `RH2M`, `WS2M`, `ALLSKY_SFC_SW_DWN`
- `start_date` (string, default: `2000-01-01`): `YYYY-MM-DD`
- `end_date` (string, default: `2023-12-31`): `YYYY-MM-DD`
- `frequency` (string, default: `monthly`): `monthly` or `daily`
- `location_name` (string): Human-readable region label

---

## 4. Statistical Trend Analysis

### `POST /api/analyze`
Executes Ordinary Least Squares linear regression, Mann-Kendall test, Sen's slope estimator, Seasonal MK, and scientific narrative generation. Stores record in SQLite history.

**Request Body**:
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "location_name": "Bengaluru, Karnataka",
  "variable": "T2M",
  "start_date": "2000-01-01",
  "end_date": "2023-12-31",
  "frequency": "monthly"
}
```

**Response `200 OK`**:
```json
{
  "summary": {
    "variable": "T2M",
    "variable_name": "Temperature at 2 Metres",
    "unit": "°C",
    "location_name": "Bengaluru, Karnataka",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "start_date": "2000-01-01",
    "end_date": "2023-12-31",
    "frequency": "monthly",
    "observation_count": 288,
    "valid_count": 288,
    "missing_percentage": 0.0,
    "linear_regression": {
      "slope_per_year": 0.0264,
      "intercept": 24.12,
      "r_squared": 0.142,
      "p_value": 0.000045,
      "std_err": 0.0064,
      "ci_95_lower": 0.0138,
      "ci_95_upper": 0.0390
    },
    "mann_kendall": {
      "trend": "increasing",
      "p_value": 0.00012,
      "z": 3.84,
      "tau": 0.158,
      "s": 6520.0,
      "var_s": 288000.0,
      "h": true
    },
    "seasonal_mann_kendall": {
      "trend": "increasing",
      "p_value": 0.00021,
      "z": 3.71,
      "tau": 0.162,
      "s": 420.0
    },
    "sens_slope_per_year": 0.0271,
    "is_significant": true,
    "trend_direction": "increasing",
    "status_color": "green",
    "scientific_explanation": "The observed increasing trend is statistically significant (Mann-Kendall p-value = 0.00012 < 0.05)...",
    "source": "NASA POWER / MERRA-2 Reanalysis",
    "is_demonstration": false
  },
  "data": { ... }
}
```

---

## 5. Regional Comparison

### `POST /api/compare`
Compares environmental rates of change between two geographical regions.

**Request Body**:
```json
{
  "location_a": { "name": "Bengaluru, Karnataka", "latitude": 12.9716, "longitude": 77.5946 },
  "location_b": { "name": "Chennai, Tamil Nadu", "latitude": 13.0827, "longitude": 80.2707 },
  "variable": "T2M",
  "start_date": "2000-01-01",
  "end_date": "2023-12-31",
  "frequency": "monthly"
}
```

---

## 6. Scientific Report Downloads

### `GET /api/report`
Generates a downloadable, publication-grade PDF report compiled with ReportLab.
- **Content-Type**: `application/pdf`
- **Header**: `Content-Disposition: attachment; filename=EarthPulse_Report_T2M_Bengaluru.pdf`

### `GET /api/export/csv`
Downloads raw time series observations with metadata comments.
- **Content-Type**: `text/csv`

---

## 7. AI Knowledge Assistant ("Ask EarthPulse AI")

### `POST /api/ai/ask`
Submits a scientific query to the grounded RAG assistant.

**Request Body**:
```json
{
  "question": "Is temperature increasing in Bengaluru?",
  "current_analysis": { ... }
}
```

---

## 8. Knowledge Base Catalog

- `GET /api/knowledge`: Returns list of all 28 articles with categories.
- `GET /api/knowledge/{category}/{doc_name}`: Returns markdown content of specific document.
- `GET /api/history`: Returns previous analysis runs saved in SQLite.
