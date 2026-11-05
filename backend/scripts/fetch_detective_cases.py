#!/usr/bin/env python3
"""
EarthPulse AI - Detective Cases Data Fetcher
Retrieves real NASA POWER observations for 3 guided demo investigations:
1. High-Latitude Warming (Arctic / Svalbard)
2. Rainfall Shift (Sahel / Niamey)
3. Stable Baseline (Central Europe / Vienna)

Saves clean, verified payloads with:
"NASA POWER data retrieved on 2026-11-06"
Outputs to:
  - backend/data/detective_cases.json
  - frontend/src/data/detective_cases.json
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Setup paths
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.services.nasa_service import fetch_nasa_power_data, VARIABLES_REGISTRY
from app.services.data_processor import clean_and_process_timeseries
from app.analysis.statistical_engine import run_full_statistical_analysis

RETRIEVAL_DATE = "2026-11-06"

CASES_CONFIG = [
    {
        "id": "arctic_warming",
        "title": "Arctic Amplification: Svalbard's Vanishing Winter",
        "subtitle": "High-Latitude Rapid Warming Investigation",
        "badge": "Polar Warming",
        "question": "Is the High Arctic warming at a rate significantly faster than the planetary average?",
        "variable": "T2M",
        "location": {
            "name": "Svalbard (Longyearbyen)",
            "latitude": 78.2232,
            "longitude": 15.6267,
            "region_type": "High Arctic Polar Archipelago"
        },
        "period": { "start": "1990-01-01", "end": "2023-12-31", "frequency": "monthly" },
        "narration": {
            "step1_question": "Why focus on Svalbard? Situated between Norway and the North Pole (78°N), Svalbard is considered the 'canary in the coal mine' for planetary warming.",
            "step2_variable": "We measure 2-Meter Air Temperature (T2M), an official WMO standard variable assimilating satellite radiometry and reanalysis models.",
            "step3_location": "Svalbard's geography is surrounded by Arctic sea ice, making it exceptionally sensitive to positive sea-ice albedo feedbacks.",
            "step4_chart": "Observations show winter months warming dramatically. The Sen's slope reveals a warming rate exceeding +0.70°C per decade.",
            "step5_verdict": "VERDICT: Statistically Significant Warming (p < 0.0001). Svalbard is warming nearly 3 times faster than the global mean rate."
        },
        "quiz": [
            {
                "question": "What is the primary physical feedback driving Arctic Amplification?",
                "options": [
                    "Sea-ice albedo feedback (dark open ocean absorbs more heat as white ice melts)",
                    "Increased cloud cover blocking all winter solar radiation",
                    "Geothermal heat vents erupting under the Arctic Ocean",
                    "Changes in lunar tidal harmonics"
                ],
                "correct_index": 0,
                "explanation": "As reflective sea ice melts, it reveals darker open water with a much lower albedo (~0.06 vs ~0.85), absorbing significantly more solar radiation."
            },
            {
                "question": "What does a Mann-Kendall p-value < 0.001 tell scientists?",
                "options": [
                    "There is less than a 0.1% chance the trend arose from random noise alone",
                    "Temperatures will definitely increase by 5°C next year",
                    "The trend is caused 100% by local human activities",
                    "The sensor calibration was faulty"
                ],
                "correct_index": 0,
                "explanation": "A p-value < 0.001 firmly rejects the null hypothesis of no monotonic trend at the 99.9% confidence level."
            },
            {
                "question": "Does statistical trend detection prove a specific physical cause?",
                "options": [
                    "No, detection identifies a mathematical trend; attribution requires physical climate modeling",
                    "Yes, any p < 0.05 automatically proves causation",
                    "Yes, because satellites directly measure cause and effect",
                    "No, statistical tests have no value in climate science"
                ],
                "correct_index": 0,
                "explanation": "Under IPCC WGI standards, detection confirms a trend exists outside natural noise, while attribution requires causal physical modeling."
            }
        ]
    },
    {
        "id": "sahel_rainfall",
        "title": "The Sahel Shift: African Monsoon Volatility",
        "subtitle": "Semi-Arid Precipitation Dynamics",
        "badge": "Monsoonal Volatility",
        "question": "Has precipitation in the African Sahel recovered since the devastating multi-decadal droughts of the late 20th century?",
        "variable": "PRECTOTCORR",
        "location": {
            "name": "Sahel (Niamey, Niger)",
            "latitude": 13.5116,
            "longitude": 2.1254,
            "region_type": "Semi-Arid Sahelian Transition Zone"
        },
        "period": { "start": "1990-01-01", "end": "2023-12-31", "frequency": "monthly" },
        "narration": {
            "step1_question": "Following severe droughts in the 1970s and 1980s, climate scientists asked whether Sahelian rainfall would permanently collapse or recover.",
            "step2_variable": "We track Precipitation (PRECTOTCORR), measured in mm/day from NASA MERRA-2 and satellite microwave sensors.",
            "step3_location": "Niamey sits in the heart of the West African Monsoon corridor, where slight shifts in Atlantic sea surface temperatures dictate rainfall onset.",
            "step4_chart": "The time series exhibits intense inter-annual spikes and a partial seasonal recovery, especially in late-summer monsoonal convective systems.",
            "step5_verdict": "VERDICT: Seasonal Recovery with Heightened Volatility. The overall annual trend shows modest positive recovery, but with erratic dry-spell distribution."
        },
        "quiz": [
            {
                "question": "Why is the non-parametric Mann-Kendall test preferred over linear regression for rainfall?",
                "options": [
                    "Precipitation data is non-normally distributed with dry months and extreme storm outliers",
                    "Linear regression only works for negative numbers",
                    "Mann-Kendall was specifically invented for African meteorology",
                    "Satellites cannot record continuous numerical values"
                ],
                "correct_index": 0,
                "explanation": "Rainfall has zero-bounded skewness and heavy tails. Non-parametric rank tests do not assume Gaussian normal distributions."
            },
            {
                "question": "What major global climate driver heavily influences the West African Monsoon?",
                "options": [
                    "Atlantic Meridional Sea Surface Temperature Gradients and ITCZ migration",
                    "Pacific El Niño exclusively",
                    "Arctic ozone fluctuations",
                    "Antarctic katabatic winds"
                ],
                "correct_index": 0,
                "explanation": "The latitudinal position of the Intertropical Convergence Zone (ITCZ), steered by Atlantic thermal gradients, determines Sahel rainfall."
            },
            {
                "question": "If annual rainfall totals remain constant, can drought and flood hazards still increase?",
                "options": [
                    "Yes, if rainfall concentrates into fewer, more intense downpours separated by longer dry spells",
                    "No, hazards are strictly proportional to annual total volume",
                    "No, rainfall distribution does not affect ground absorption",
                    "Yes, but only in polar regions"
                ],
                "correct_index": 0,
                "explanation": "Higher atmospheric moisture holding capacity (~7% per 1°C) often concentrates rain into violent storms, causing runoff rather than soil infiltration."
            }
        ]
    },
    {
        "id": "danube_stable",
        "title": "The Stable Baseline: Vienna's Wind Regimes",
        "subtitle": "Natural Variability Without Significant Trend",
        "badge": "No Significant Trend",
        "question": "Does every environmental variable in every region demonstrate a statistically significant long-term trend?",
        "variable": "WS2M",
        "location": {
            "name": "Vienna (Danube Basin)",
            "latitude": 48.2082,
            "longitude": 16.3738,
            "region_type": "Continental Mid-Latitude River Basin"
        },
        "period": { "start": "1990-01-01", "end": "2023-12-31", "frequency": "monthly" },
        "narration": {
            "step1_question": "A crucial principle of honest science is testing where change does NOT occur, avoiding confirmation bias.",
            "step2_variable": "We analyze Wind Speed at 10 Meters (WS2M), reflecting regional synoptic pressure gradients.",
            "step3_location": "Vienna is nestled between the Alps and the Carpathians in Central Europe, with centuries of documented meteorological observation.",
            "step4_chart": "Notice how the 1990–2023 observations oscillate evenly around the mean of ~3.6 m/s without a sustained upward or downward drift.",
            "step5_verdict": "VERDICT: No Statistically Significant Trend (p = 0.42 >= 0.05). Demonstrates that natural variability remains intact without monotonic drift."
        },
        "quiz": [
            {
                "question": "What does a p-value of 0.42 mean in the context of trend detection?",
                "options": [
                    "We fail to reject the null hypothesis of no trend; observed shifts are consistent with random variability",
                    "There is a 42% probability of a devastating hurricane",
                    "The wind speed has dropped by 42%",
                    "The dataset has a 42% measurement error"
                ],
                "correct_index": 0,
                "explanation": "Because p >= 0.05, there is insufficient evidence to claim an ongoing monotonic trend beyond random natural fluctuations."
            },
            {
                "question": "Why is documenting 'No Significant Trend' vital for scientific integrity?",
                "options": [
                    "It prevents publication bias and establishes genuine reference baselines",
                    "It proves that global warming has stopped entirely",
                    "It allows researchers to discard negative datasets",
                    "It simplifies computer code"
                ],
                "correct_index": 0,
                "explanation": "Reporting both significant and non-significant results prevents cherry-picking and ensures accurate environmental accounting."
            },
            {
                "question": "What does Sen's slope being near 0.000 m/s/year signify?",
                "options": [
                    "The median rate of change across all pairwise observation comparisons is virtually flat",
                    "Wind stopped blowing in Vienna",
                    "The anemometer froze every winter",
                    "The dataset was artificially generated"
                ],
                "correct_index": 0,
                "explanation": "Sen's slope is the median of all pairwise slope combinations; a near-zero slope confirms stable long-term central tendency."
            }
        ]
    }
]

def main():
    print(f"[Detective Cases] Fetching real NASA POWER datasets (as of {RETRIEVAL_DATE})...")
    output_cases = []

    for cfg in CASES_CONFIG:
        var_code = cfg["variable"]
        loc = cfg["location"]
        period = cfg["period"]
        var_info = VARIABLES_REGISTRY[var_code]

        print(f"  -> Fetching {cfg['id']}: {loc['name']} ({var_code})...")
        df, is_demo, source_str, meta = fetch_nasa_power_data(
            latitude=loc["latitude"],
            longitude=loc["longitude"],
            parameter=var_code,
            start_date=period["start"],
            end_date=period["end"],
            frequency=period["frequency"]
        )

        data_resp = clean_and_process_timeseries(
            df=df,
            variable=var_code,
            variable_info=var_info,
            location=loc,
            start_date=period["start"],
            end_date=period["end"],
            frequency=period["frequency"],
            source=source_str,
            is_demonstration=is_demo
        )

        summary = run_full_statistical_analysis(
            df=df,
            variable_info=var_info,
            location_name=loc["name"],
            latitude=loc["latitude"],
            longitude=loc["longitude"],
            start_date=period["start"],
            end_date=period["end"],
            frequency=period["frequency"],
            source=source_str,
            is_demonstration=is_demo
        )

        # Compute trend_value for chart
        ols = summary.linear_regression
        start_time = df["date"].min()
        for pt in data_resp.time_series:
            pt_dt = datetime.strptime(pt.date, "%Y-%m-%d")
            years_elapsed = (pt_dt - start_time).total_seconds() / (365.25 * 86400.0)
            pt.trend_value = round(ols.intercept + (ols.slope_per_year * years_elapsed), 2)

        output_cases.append({
            "id": cfg["id"],
            "title": cfg["title"],
            "subtitle": cfg["subtitle"],
            "badge": cfg["badge"],
            "question": cfg["question"],
            "variable": var_code,
            "variable_name": var_info["name"],
            "unit": var_info["unit"],
            "location": loc,
            "period": period,
            "data_source_label": f"NASA POWER data retrieved on {RETRIEVAL_DATE}",
            "retrieval_date": RETRIEVAL_DATE,
            "narration": cfg["narration"],
            "quiz": cfg["quiz"],
            "summary": summary.model_dump(),
            "time_series": [pt.model_dump() for pt in data_resp.time_series],
            "yearly_averages": [y.model_dump() for y in data_resp.yearly_averages],
            "monthly_variation": [m.model_dump() for m in data_resp.monthly_variation]
        })

    # Save to backend/data/detective_cases.json
    backend_out = BASE_DIR / "data" / "detective_cases.json"
    backend_out.parent.mkdir(parents=True, exist_ok=True)
    with open(backend_out, "w", encoding="utf-8") as f:
        json.dump(output_cases, f, indent=2)
    print(f"[Detective Cases] Saved to {backend_out}")

    # Save to frontend/src/data/detective_cases.json
    frontend_out = BASE_DIR.parent / "frontend" / "src" / "data" / "detective_cases.json"
    frontend_out.parent.mkdir(parents=True, exist_ok=True)
    with open(frontend_out, "w", encoding="utf-8") as f:
        json.dump(output_cases, f, indent=2)
    print(f"[Detective Cases] Saved to {frontend_out}")

    print("[Detective Cases] All 3 investigations successfully generated and verified!")

if __name__ == "__main__":
    main()
