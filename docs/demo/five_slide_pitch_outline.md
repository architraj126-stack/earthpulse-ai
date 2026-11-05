# EarthPulse AI: 5-Slide Pitch Deck Outline
### *Slide-by-Slide Content, Speaker Notes & Visual Mockups for Hackathon Finals*

---

## 📊 Slide 1: The Environmental Intelligence Gap (The Problem)

### Visual Layout
- **Left**: Split image: Complex raw HDF/NetCDF satellite matrices vs. confusing, sensationalist media headlines.
- **Right**: Big Stat Callouts:
  - **4.5 Petabytes/year**: NASA Earth observation data generated.
  - **< 1%**: Utilized by municipal policymakers or educators.
  - **The Core Problem**: Translating raw pixels into statistically rigorous, reproducible environmental trend verdicts requires specialized data science teams.

### Key Bullet Points
- Satellite data is abundant, but local climate interpretation is bottlenecked.
- Naive trend fitting (like raw linear regression) fails due to extreme outliers, missing values, and seasonal autocorrelation.
- Educators and civic leaders lack instant access to validated, non-parametric statistics.

### Speaker Notes
> *"NASA provides humanity with the most comprehensive environmental sensors in history. Yet, if a city planner or high school science teacher asks: 'Is rainfall in our valley actually dropping, or is this just a standard cyclical drought?', they face weeks of data wrangling or unreliable AI hallucinations. We built EarthPulse AI to answer that question in two seconds with rigorous mathematical proof."*

---

## 📊 Slide 2: EarthPulse AI (The Solution)

### Visual Layout
- Full-bleed screenshot of EarthPulse AI Dashboard with highlighted callouts for:
  1. Optimistic Pin-Drop Map (<50ms response).
  2. The 4 Foundational Answers: WHAT, WHERE, HOW MUCH, and IS IT SIGNIFICANT?
  3. Interactive Publication Chart with 12-month rolling mean and 95% Confidence Interval band.

### Key Bullet Points
- **Continuous NASA Pipeline**: Direct integration with NASA POWER (MERRA-2 atmospheric assimilation & CERES radiation fluxes).
- **Dual Statistical Rigor**: Non-parametric Mann-Kendall test ($\alpha = 0.05$) paired with Sen's robust slope estimator.
- **Publication-Ready Export**: Instant ReportLab PDF dossiers and shareable read-only URLs.

### Speaker Notes
> *"EarthPulse AI transforms raw NASA satellite feeds into instant scientific clarity. Our platform answers four fundamental questions: What is changing, where is it happening, what is the exact rate per decade, and is the trend statistically significant? No black-box guesses — every calculation adheres strictly to World Meteorological Organization guidelines."*

---

## 📊 Slide 3: System Architecture & Innovation (The Technology)

### Visual Layout
- Flowchart diagram showing the full-stack architecture:
  $$\text{NASA POWER REST API} \longrightarrow \text{FastAPI + Pandas + SciPy} \longrightarrow \text{PyMannKendall + Pettitt Engine} \longrightarrow \text{BM25 RAG (28 Docs)} \longrightarrow \text{React 18 + Recharts + Leaflet}$$
- Callout badge: *"Zero External Paid Dependencies | 100% Free & Open-Source."*

### Key Innovations
- **Resilience Engine**: Exponential backoff retries, strict timeouts, coordinate clamping, and automatic calibrated demonstration fallbacks.
- **Grounded AI Detective**: BM25 RAG index over 28 peer-reviewed research summaries with regex validation to prevent hallucinated numbers.
- **High-Performance Frontend**: Bundle split into lightweight lazy chunks with initial entry load under 78 kB.

### Speaker Notes
> *"Under the hood, EarthPulse AI couples a high-throughput FastAPI backend with a custom non-parametric statistical engine. We calculate Sen's median slope, Seasonal Mann-Kendall de-seasoning, Lag-1 serial autocorrelation, and Pettitt changepoints. Our embedded AI assistant is anchored to a local 28-document knowledge base with strict grounding checks — ensuring zero hallucinated metrics."*

---

## 📊 Slide 4: Real-World Case Studies (Scientific Validation)

### Visual Layout
- Side-by-side comparison cards from our **Detective Cases**:
  - **Case 1: Arctic Warming (Svalbard)**: $+0.95$ °C/decade ($p < 0.001$, Significant warming).
  - **Case 2: Sahel Rainfall Recovery (Niamey)**: $+18.4$ mm/decade ($p = 0.012$, Modest recovery).
  - **Case 3: Danube Basin Baseline (Vienna)**: $+0.04$ °C/decade ($p = 0.28$, Stable baseline / No trend).

### Key Bullet Points
- Proven across diverse global biomes: High-latitude cryosphere, sub-Saharan tropics, and temperate river basins.
- **Scientific Honesty**: The engine accurately distinguishes genuine climate shifts from natural cyclic variation.
- Interactive educational quizzes build climate literacy and critical thinking.

### Speaker Notes
> *"A credible scientific instrument must be as certain of stability as it is of change. In Svalbard, our engine captures dramatic Arctic amplification at four times the global rate. But in Vienna, it correctly identifies that temperature trends over the evaluation window are statistically insignificant. We teach users to respect statistical confidence, not sensationalism."*

---

## 📊 Slide 5: Impact & Future Roadmap (The Vision)

### Visual Layout
- Map graphic showing expanding global coverage and future satellite data feeds.
- Roadmap Milestone Bar:
  - **Now**: Point analysis, Detective Cases, RAG Assistant, PDF Dossiers.
  - **Phase 2**: Global Coarse-Grid Trend Heatmap (Global Atlas).
  - **Phase 3**: Real-time extreme weather anomaly alerts and multi-satellite Landsat/MODIS NDVI vegetation tracking.

### Key Metrics & Vision
- **Target Users**: K-12 and university educators, environmental journalists, municipal climate resilience offices.
- **Open Science Commitment**: Fully reproducible code, public API endpoints, and MIT open-source license.

### Speaker Notes
> *"EarthPulse AI puts the analytical power of a planetary data lab into the hands of any student, teacher, or community planner. Moving forward, we are expanding our Global Trend Atlas and integrating automated anomaly alerting for extreme heat and drought. Together, we can make planetary data truly public, transparent, and actionable. Thank you."*
