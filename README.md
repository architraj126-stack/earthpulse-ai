# EarthPulse AI
### *Discover. Analyze. Understand Our Changing Earth.*

[![NASA POWER](https://img.shields.io/badge/NASA-POWER%20API-00D4FF?logo=nasa)](https://power.larc.nasa.gov)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite)](https://vitejs.dev)
[![WMO & IPCC](https://img.shields.io/badge/Standard-WMO%20%26%20IPCC%20AR6-35D07F)](https://wmo.int)

EarthPulse AI is a full-stack, AI-powered Earth Science trend detection and visualization platform designed for students, researchers, scientists, and the general public to understand environmental changes using NASA satellite observations and global model datasets.

---

## 🎯 The Four Foundational Questions

The platform answers four questions for every geographic point on Earth:

1. **WHAT is changing?** — Multi-variable environmental metrics: 2m Temperature (`T2M`), Corrected Precipitation (`PRECTOTCORR`), Relative Humidity (`RH2M`), Wind Speed (`WS2M`), and All-Sky Solar Irradiance (`ALLSKY_SFC_SW_DWN`).
2. **WHERE is it changing?** — Point and regional analysis across any WGS-84 coordinate (-90° to +90° lat), with initial demonstration set to **Bengaluru, Karnataka (Lat: 12.9716, Lon: 77.5946)**.
3. **HOW MUCH is it changing?** — Quantified via **Sen’s slope robust rate of change** (per year and decade) and **Ordinary Least Squares (OLS) regression** with 95% confidence intervals.
4. **IS the trend statistically significant?** — Evaluated via the non-parametric **Mann-Kendall test** ($\alpha = 0.05$) and **Seasonal Mann-Kendall** ($m=12$), distinguishing real monotonic trends from random multi-year weather noise.

---

## 🌟 Key Features

- **Real NASA POWER API Integration**: Direct point endpoint queries for daily and monthly meteorological and solar fluxes. Includes intelligent SQLite caching, timeout handling, and automatic missing-value filtering (`-999.0` $\rightarrow$ `NaN`).
- **Interactive Global Mapping**: React Leaflet and OpenStreetMap integration with free geocoding search, click-to-pick point selection, manual coordinate entry, and global city presets.
- **Interactive Time-Series Charts**: Recharts visualizations displaying actual observations against calculated linear regression trendlines, annual aggregates (mean, min, max), and monthly seasonal climatology profiles.
- **Statistical Significance Engine**:
  - **OLS Linear Regression**: Annual slope, intercept, $R^2$, p-value, standard error, 95% confidence intervals.
  - **Mann-Kendall Test**: Non-parametric $S$ statistic, Kendall's Tau ($\tau$), standardized $Z$ score, and exact two-tailed p-value.
  - **Sen's Slope Estimator**: Robust median of pairwise slopes, resistant to outliers and missing gaps.
  - **Seasonal Mann-Kendall**: Climatological de-seasoning across recurring calendar months ($m=12$).
  - **Status Badge System**: Green (significant increase), Red (significant decrease), Grey (no trend).
- **"Ask EarthPulse AI" (AI Data Detective)**: Grounded RAG assistant backed by 28 structured research documents in `knowledge_base/`. Answers user questions with statistical proofs, physical climate mechanisms, and verified academic citations.
- **Regional Comparison**: Compare trends between two locations (e.g., Bengaluru vs. Chennai) with combined dual-line charts and side-by-side slope/significance metrics.
- **Automated Report Generation**: Downloadable publication-grade PDF reports compiled via ReportLab and raw data CSV downloads.
- **Local SQLite Database**: Stores analysis history and cached NASA queries.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, React Leaflet, Leaflet, Axios, Lucide React, React Router |
| **Backend** | Python 3.10–3.13, FastAPI, Uvicorn, Pandas, NumPy, SciPy, PyMannKendall, Requests, Pydantic |
| **Database** | SQLite3 (`earthpulse.db`) |
| **Reports** | ReportLab PDF Engine, Pandas CSV Exporter |
| **Data Sources** | NASA POWER (MERRA-2 Reanalysis, GEOS-5 FP-IT, CERES FLASHFlux), OpenStreetMap |

---

## 🚀 Quick Start Guide

### 1. Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Launch Both Servers

**Terminal 1 (Backend API)**:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API is live at `http://127.0.0.1:8000` | Swagger docs at `http://127.0.0.1:8000/docs`*

**Terminal 2 (Frontend UI)**:
```bash
cd frontend
npm run dev
```
*Web application is live at `http://localhost:5173`*

---

## 📁 Project Architecture

```
python csv/
├── backend/
│   ├── app/
│   │   ├── analysis/
│   │   │   └── statistical_engine.py  # OLS, Mann-Kendall, Sen's slope, Seasonal MK
│   │   ├── database/
│   │   │   └── db.py                  # SQLite history & NASA query cache
│   │   ├── routes/
│   │   │   └── api.py                 # FastAPI endpoints (/health, /data, /analyze, /report...)
│   │   ├── schemas/
│   │   │   └── models.py              # Pydantic v2 validation models
│   │   ├── services/
│   │   │   ├── ai_service.py          # Grounded RAG AI Assistant
│   │   │   ├── data_processor.py      # Missing stats & climatological grouping
│   │   │   ├── nasa_service.py        # Real NASA POWER API integration & cache
│   │   │   └── report_service.py      # ReportLab PDF report generator
│   │   └── main.py                    # FastAPI application entrypoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/                # Map, Charts, MetricCard, Selectors, AI Chat
│   │   ├── pages/                     # Landing, Dashboard, Compare, Knowledge, About
│   │   ├── services/                  # Axios API connectors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── knowledge_base/                    # 28 Curated summaries of NASA, NOAA, WMO and IPCC documentation
│   ├── datasets/                      # NASA POWER, MODIS, GPM, GLDAS, MERRA-2, NOAA, IPCC
│   ├── environmental_variables/       # T2M, PRECTOTCORR, RH2M, WS2M, Solar, NDVI, LST
│   ├── climate_science/               # Greenhouse effect, UHI, Hydrological scaling
│   ├── statistical_methods/           # OLS, Mann-Kendall, Sen's slope, Seasonal MK
│   ├── research_papers/               # Literature on regional trends and validation
│   ├── scientific_glossary/           # Albedo, Bowen ratio, Tau, Anomaly, p-value...
│   └── references/                    # Bibliography with DOIs
├── DATA_SOURCES.md                    # In-depth satellite & model documentation
├── KNOWLEDGE_BASE.md                  # Taxonomy & RAG architecture guide
├── STATISTICAL_METHODS.md             # Mathematical derivations & formulas
├── API_DOCUMENTATION.md               # Endpoints, payloads, and response schemas
├── SETUP_GUIDE.md                     # Step-by-step setup & live demo script
└── README.md
```

---

## 🏆 Live Hackathon Demonstration Flow

1. **Landing Page (`/`)**: Show the Earth observation mission, 4 core questions, and active engine status.
2. **Dashboard (`/dashboard`)**: Showcase default demonstration on **Bengaluru, Karnataka**:
   - Status badge shows warming trend with exact Sen's slope (+0.026 °C/yr) and Mann-Kendall p-value.
   - Interactive Recharts: Actual observations (cyan) + linear trendline (green dashed line).
   - Monthly seasonal climatology and annual aggregates.
3. **Interactive Map**: Search any world city or click on the map to re-evaluate coordinates.
4. **"Ask EarthPulse AI"**: Ask *"Is temperature increasing in Bengaluru?"* to see grounded RAG response citing urban heat islands and verified scientific papers.
5. **Regional Comparison (`/compare`)**: Compare Bengaluru vs. Chennai side-by-side.
6. **Download Reports**: Click "Download PDF" to generate and inspect the ReportLab publication report.

---

## 📜 Scientific Attribution & License

- Meteorological and solar data provided by the **NASA Langley Research Center (LaRC) POWER Project** and **NASA GMAO MERRA-2**.
- Statistical tests designed in compliance with the **World Meteorological Organization (WMO)** and **IPCC AR6**.
- Open-source licensed under the MIT License.
