# EarthPulse AI: 3-Minute Video Showcase Outline
### *Visual Storyboard, Camera & Audio Directions for Video Submission*

---

## 🎬 Video Overview
- **Total Duration**: 3:00 (180 seconds)
- **Target Audience**: Hackathon Grand Jury, NASA Space Apps judges, Climate Tech evaluators
- **Resolution**: 1080p 60fps (or 4K 30fps)
- **Audio Profile**: Clear studio voiceover, ambient modern electronic synth soundtrack (ducked to -18dB under speech)

---

## 📋 Storyboard Breakdown

### Act 1: The Climate Intelligence Gap (0:00 - 0:35)
- **Visuals (0:00 - 0:15)**: B-roll montage of NASA Earth-observing satellites (Terra, Aqua, Landsat), followed by a screen capture of intimidating raw NetCDF/HDF files and terminal code.
- **Visuals (0:15 - 0:35)**: Quick cut to EarthPulse AI landing page on a crisp dark-mode display with glowing orbital animations and live NASA status badge.
- **Voiceover**:
  > *"NASA collects petabytes of Earth observation data every single day. But between raw satellite radiometry and actionable local decisions lies a deep chasm of complex data pipelines, missing value cleaning, and subtle statistical traps like seasonal noise and autocorrelation. EarthPulse AI bridges that divide."*

### Act 2: Interactive 3-Step Scientific Flow (0:35 - 1:20)
- **Visuals (0:35 - 0:50)**: User enters `/investigate`. Selects **2-Meter Air Temperature (`T2M`)**. Clicks on the interactive Leaflet map to drop an optimistic pin on **Bengaluru, India**. Lat/lon fields update smoothly (<50ms).
- **Visuals (0:50 - 1:10)**: User clicks **"Analyze Environmental Trends"**. Loading spinner appears briefly, then the dashboard smoothly renders the executive headline banner, KPI metrics, and the publication-grade time-series chart.
- **Visuals (1:10 - 1:20)**: Mouse hovers over data points, highlighting the thin observation line, bold 12-month rolling average, and green dashed trendline with shaded 95% confidence bands.
- **Voiceover**:
  > *"With our 3-step scientific flow, anyone can investigate environmental trajectories. In under two seconds, the platform executes high-speed NASA POWER API queries, removes fill-value anomalies, and runs the non-parametric Mann-Kendall test and Sen's slope estimator. Here in Bengaluru, temperature has risen at +0.26 °C per decade with p < 0.001."*

### Act 3: Scientific Integrity & Detective Cases (1:20 - 2:05)
- **Visuals (1:20 - 1:40)**: Switch to **"Detective Cases"** (`/cases`). Tour **Case 1: Arctic Amplification** (Svalbard, Norway: rapid warming +0.95 °C/decade).
- **Visuals (1:40 - 2:05)**: Click to **Case 3: Danube River Basin** (Vienna: stable baseline, p = 0.28). Complete the interactive quiz on-screen, showing the instant green checkmark and scientific feedback.
- **Voiceover**:
  > *"True science must recognize when nothing is changing. Our Detective Cases module provides pre-computed, zero-latency benchmarks. In Svalbard, we see drastic warming. But in the Danube Basin, the slope is negligible and the p-value is 0.28 — proving that EarthPulse AI distinguishes genuine climatic shifts from multi-year natural variability."*

### Act 4: Grounded AI Assistant & Regional Comparison (2:05 - 2:35)
- **Visuals (2:05 - 2:20)**: Scroll down to **"Ask EarthPulse AI"**. Type: *"Could urban heat island effect explain the warming trend in Bengaluru?"* The BM25 RAG index retrieves relevant literature; the AI responds with IPCC AR6 Urban Chapter citations and exact quantitative comparisons.
- **Visuals (2:20 - 2:35)**: Quick cut to **Regional Comparison (`/compare`)**, comparing Bengaluru vs. Chennai in a dual-axis comparative graph.
- **Voiceover**:
  > *"Our embedded AI Data Detective is powered by a custom BM25 vector knowledge base of 28 peer-reviewed climate treatises. It never hallucinates numbers or invents trends. And with regional comparison, users can contrast microclimates across distinct geographic zones."*

### Act 5: Production Architecture & Call to Action (2:35 - 3:00)
- **Visuals (2:35 - 2:50)**: Click **"Download PDF"** to reveal a sleek 2-page publication-ready report generated on-the-fly by ReportLab. Click **"Share Analysis"** to show URL synchronization.
- **Visuals (2:50 - 3:00)**: Final screen displaying GitHub repository link, technology badges (FastAPI, React, Vite, NASA POWER), and closing title card: **"EarthPulse AI — Discover. Analyze. Understand Our Changing Earth."**
- **Voiceover**:
  > *"Built with FastAPI, React, and WMO-compliant statistical engines, EarthPulse AI empowers citizens, students, and scientists worldwide with instant, reproducible climate truth. Explore the live platform today."*
