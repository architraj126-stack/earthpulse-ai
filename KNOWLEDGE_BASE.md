# EarthPulse AI — Scientific Knowledge Base Architecture

EarthPulse AI incorporates an embedded, verified scientific knowledge base (`backend/knowledge_base/`) containing 28 structured research articles and reference documents. This ensures the platform's AI Assistant ("Ask EarthPulse AI") grounds all explanations, answers, and interpretations in curated summaries of NASA, NOAA, WMO and IPCC documentation rather than hallucinating facts.

---

## 1. Directory Structure & Document Taxonomy

```
backend/knowledge_base/
├── datasets/                       # Satellite missions and assimilation systems
│   ├── nasa_power.md              # NASA POWER technical architecture & endpoints
│   ├── nasa_modis.md              # MODIS NDVI, EVI, Land Surface Temperature
│   ├── nasa_gpm.md                # GPM IMERG calibrated precipitation
│   ├── nasa_gldas.md              # GLDAS land-surface models & soil moisture
│   ├── nasa_merra2.md             # MERRA-2 reanalysis & aerosol assimilation
│   ├── noaa_ncei.md               # NOAA GHCN in-situ ground station networks
│   ├── ipcc_ar6.md                # IPCC AR6 physical science basis & confidence
│   └── wmo_standards.md           # WMO observation conventions & climatologies
├── environmental_variables/        # Physical definitions, mechanisms, and units
│   ├── temperature_t2m.md         # 2-metre air temperature thermodynamics
│   ├── precipitation_prectotcorr.md # Bias-corrected precipitation & extreme rain
│   ├── relative_humidity_rh2m.md  # RH, Clausius-Clapeyron, and heat index
│   ├── wind_speed_ws2m.md         # Wind profile, roughness, terrestrial stilling
│   ├── solar_irradiance.md        # All-sky shortwave solar flux & dimming
│   ├── vegetation_ndvi.md         # NDVI mesophyll reflectance physics & greening
│   └── land_surface_temperature_lst.md # Skin temperature vs T2M & urban canyons
├── climate_science/               # Earth system dynamics & physical principles
│   ├── greenhouse_effect.md       # Radiative balance & greenhouse gas forcing
│   ├── urban_heat_islands.md      # Microclimate drivers & Bengaluru case study
│   ├── hydrological_cycle.md      # Clausius-Clapeyron 7%/°C moisture scaling
│   └── radiative_forcing.md       # Atmospheric energy imbalance & feedbacks
├── statistical_methods/           # Mathematical formulations of trend tests
│   ├── linear_regression.md       # OLS formulation, R², standard error, 95% CI
│   ├── mann_kendall_test.md       # Non-parametric rank test, S, Var(S), Z, p-value
│   ├── sens_slope.md              # Theil-Sen median pairwise slope estimator
│   ├── significance_and_pvalues.md # Hypothesis testing, α = 0.05, causality limits
│   └── seasonal_variation.md      # Seasonal Mann-Kendall (m=12) & de-seasoning
├── research_papers/               # Published literature and validation studies
│   ├── nasa_power_validation.md   # BSRN & WMO ground validation of NASA POWER
│   ├── ipcc_detection_attribution.md # Detection vs. attribution formal framework
│   └── environmental_trend_literature.md # Regional warming & Indian subcontinent
├── scientific_glossary/           # Standard environmental terms & definitions
│   └── glossary.md                # Albedo, Bowen ratio, Anomaly, Tau, P-value...
└── references/                    # Formal academic citations
    └── citations.md               # Complete bibliography with DOIs
```

---

## 2. Grounded RAG Assistant ("Ask EarthPulse AI")

When a user submits a query to the AI Data Detective:

1. **Query Parsing & Token Matching**: The index scans the document library, computing term frequency, category relevance, and title boosts.
2. **Context Binding**: The active dashboard analysis results (variable, coordinates, period, Sen's slope, Mann-Kendall p-value, significance) are injected into the reasoning prompt.
3. **Structured Synthesis**: The engine crafts a response cleanly segregated into:
   - **Direct Plain-Language Answer**: Answers the user's specific inquiry.
   - **Statistical Observation**: The calculated numerical proof (slopes, p-values, sample counts).
   - **Physical Climate Mechanism**: Explains why the variable behaves this way (e.g., sensible heat flux, Clausius-Clapeyron scaling, aerosol forcing).
   - **Verified Citations**: Exact sources from the knowledge base with DOI references.

---

## 3. Extending the Knowledge Base

To add a new dataset, research paper, or variable:
1. Create a standard Markdown document in the appropriate subfolder (`backend/knowledge_base/{category}/{name}.md`).
2. Include a top-level `# Title`, overview, formulas, and citations.
3. The backend `KnowledgeBaseIndex` automatically indexes the new file upon startup.
