# EarthPulse AI: 2-Minute Hackathon Demo Script
### *High-Impact, Second-by-Second Presentation Guide for Judges*

---

## ⏱️ Timeline Overview

| Time | Phase | On-Screen Action | Spoken Cue / Narration | Key Takeaway |
|---|---|---|---|---|
| **0:00 - 0:20** | **The Hook** | Landing Page (`/`) with live NASA gateway badge | *"Every year, NASA satellites record billions of data points. Yet for local leaders and researchers, answering a simple question — 'Is our climate actually changing, and is it statistically significant?' — requires weeks of specialized data science. We built EarthPulse AI to eliminate that barrier."* | Real problem: Data richness vs. statistical accessibility. |
| **0:20 - 0:55** | **The 4 Questions in Action** | Navigate to `/investigate`. Select **2-Meter Air Temperature (`T2M`)**, click map on **Bengaluru**, click **"Analyze Environmental Trends"** | *"EarthPulse AI answers four fundamental scientific questions in under two seconds: What is changing? Temperature. Where? Bengaluru. How much? +0.26 °C per decade via robust Sen's Slope. And is it statistically significant? Yes, the Mann-Kendall test yields p < 0.001. Notice the dashed trendline with shaded 95% confidence intervals and 12-month rolling mean."* | Non-parametric rigor, not just a naive line fit. |
| **0:55 - 1:25** | **Detective Cases (Zero-Fail Demo)** | Click **"Detective Cases"** in top nav. Select **Case 1: Arctic Amplification (Svalbard)**, then toggle to **Case 3: Danube Basin Stable Baseline** | *"A critical scientific platform must be as honest about non-trends as it is about warming. In Case 1, we see Arctic warming at four times the global average. But in Case 3 along the Danube Basin, the engine reports p = 0.28 — no statistically significant trend detected. We teach users that natural variability is real, backed by instant interactive quizzes."* | Scientific honesty: Not every place has a trend. |
| **1:25 - 1:45** | **Grounded AI Detective** | Scroll to **"Ask EarthPulse AI"** on `/investigate`. Ask: *"Why is the Sen's slope different from the OLS slope?"* | *"Our AI assistant isn't a generic chatbot. It is a strictly grounded RAG system with 28 peer-reviewed knowledge documents. It explains mathematically that Sen's slope uses the median of pairwise slopes to resist extreme weather outliers, while citing specific IPCC AR6 chapters."* | Zero hallucinations, peer-reviewed citations. |
| **1:45 - 2:00** | **Export & Shareability** | Click **"Share Analysis"** (copy link toast), then click **"Download PDF"** to open ReportLab report | *"Every analysis produces a permanent, shareable URL for collaboration, and a publication-ready PDF report with full methodology disclaimers, WMO compliance, and NASA data citations. EarthPulse AI turns raw space observations into actionable climate intelligence."* | Production-ready, reproducible science. |

---

## 🎯 Presenter Contingency Protocols

### Protocol A: WiFi or NASA API Gateway Goes Down
- **Action**: Do not panic. The application automatically triggers the **Calibrated Demonstration Engine** or links to **Detective Cases**.
- **Presenter Line**: *"Notice how the app seamlessly flags cached reference data retrieved directly from NASA POWER, keeping our session live even if the space agency gateway experiences latency."*

### Protocol B: Judge Asks About Autocorrelation (Persistence)
- **Action**: Click "Detailed Scientific Breakdown" under the summary card.
- **Presenter Line**: *"We calculate Lag-1 serial autocorrelation and run Pettitt's test for abrupt changepoint detection. If serial correlation is significant, our engine applies the Yue-Wang variance correction to prevent false-positive trend detection."*
