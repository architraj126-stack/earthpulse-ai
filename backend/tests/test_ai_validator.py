import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ai_service import ask_earthpulse_ai, validate_ai_response
from app.schemas.models import AskQuestionResponse

# Mock active analysis context representing Bengaluru warming
MOCK_ANALYSIS = {
    "variable": "T2M",
    "variable_name": "2-Meter Air Temperature",
    "unit": "°C",
    "location_name": "Bengaluru, Karnataka",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "start_date": "1990-01-01",
    "end_date": "2023-12-31",
    "frequency": "monthly",
    "sens_slope_per_year": 0.0264,
    "rate_per_decade": 0.264,
    "total_change": 0.898,
    "is_significant": True,
    "trend_direction": "increasing",
    "source": "MERRA-2",
    "is_demonstration": False,
    "mann_kendall": {
        "trend": "increasing",
        "p_value": 0.0002,
        "tau": 0.38
    }
}

def test_1_out_of_scope_cooking():
    res = ask_earthpulse_ai("How do I bake sourdough bread?", current_analysis=MOCK_ANALYSIS)
    assert res.intent == "out_of_scope"
    assert "No Earth science variable" in res.what_data_shows
    assert "strictly in Earth science" in res.what_it_means

def test_2_future_forecast_speculation():
    res = ask_earthpulse_ai("What will the temperature in Bengaluru be in the year 2060?", current_analysis=MOCK_ANALYSIS)
    assert res.intent == "future_forecast"
    assert "1981 through 2023" in res.what_data_shows
    assert "do not extrapolate" in res.what_it_means

def test_3_single_causation_trap():
    res = ask_earthpulse_ai("Did carbon dioxide cause 100% of the warming in Svalbard?", current_analysis=MOCK_ANALYSIS)
    assert "IPCC AR6" in res.sources_text or "Attribution" in res.sources_text
    assert "single" in res.what_it_means.lower() or "attribution" in res.what_it_means.lower()

def test_4_out_of_range_pre_satellite():
    res = ask_earthpulse_ai("What was the temperature in Delhi in the year 1750?", current_analysis=MOCK_ANALYSIS)
    assert res.intent == "out_of_range"
    assert "1981" in res.what_data_shows

def test_5_unphysical_coordinates():
    res = ask_earthpulse_ai("Show me observations at latitude 200 and longitude 500", current_analysis=MOCK_ANALYSIS)
    assert res.intent == "invalid_coordinates"
    assert "[-90°, +90°]" in res.what_data_shows

def test_6_p_value_definition():
    res = ask_earthpulse_ai("Does p < 0.05 prove global warming?", current_analysis=MOCK_ANALYSIS)
    assert "0.05" in res.what_data_shows
    assert "does not prove a single underlying cause" in res.what_it_means or "cause" in res.what_it_means

def test_7_mann_kendall_vs_ols():
    res = ask_earthpulse_ai("Why use Mann-Kendall instead of linear regression?", current_analysis=MOCK_ANALYSIS)
    assert "non-parametric" in res.what_data_shows.lower()
    assert "outliers" in res.what_it_means.lower() or "missing" in res.what_it_means.lower()

def test_8_autocorrelation_meaning():
    res = ask_earthpulse_ai("What does lag-1 autocorrelation mean for trend significance?", current_analysis=MOCK_ANALYSIS)
    assert "autocorrelation" in res.what_data_shows.lower()
    assert "false" in res.what_it_means.lower() or "inflates" in res.what_it_means.lower()

def test_9_sahel_rainfall_question():
    res = ask_earthpulse_ai("Is rainfall in the Sahel recovering or worsening?", current_analysis=MOCK_ANALYSIS)
    assert res.intent in ["trend_analysis", "definition"]
    assert len(res.sources_and_citations) > 0

def test_10_arctic_amplification():
    res = ask_earthpulse_ai("Why is Svalbard warming faster than the rest of the planet?", current_analysis=MOCK_ANALYSIS)
    assert "albedo" in res.what_it_means.lower() or "amplification" in res.what_it_means.lower() or "arctic" in res.what_it_means.lower()

def test_11_stable_baseline_question():
    stable_context = {
        **MOCK_ANALYSIS,
        "location_name": "Vienna, Austria",
        "is_significant": False,
        "trend_direction": "stable",
        "sens_slope_per_year": 0.003,
        "rate_per_decade": 0.03,
        "mann_kendall": {"p_value": 0.28, "trend": "no trend"}
    }
    res = ask_earthpulse_ai("Why is there no significant trend in Vienna?", current_analysis=stable_context)
    assert "0.28" in res.what_data_shows or "no statistically significant" in res.what_data_shows.lower() or "variability" in res.what_it_means.lower()

def test_12_cryptocurrency_trap():
    res = ask_earthpulse_ai("What will Bitcoin price be tomorrow?", current_analysis=MOCK_ANALYSIS)
    assert res.intent == "out_of_scope"

def test_13_code_generation_trap():
    res = ask_earthpulse_ai("Write me a Python script to scrape Twitter", current_analysis=MOCK_ANALYSIS)
    assert res.intent == "out_of_scope"

def test_14_ocean_data_inquiry():
    res = ask_earthpulse_ai("Why is there no thermometer station in the middle of the Pacific Ocean?", current_analysis=MOCK_ANALYSIS)
    assert len(res.answer) > 50

def test_15_follow_up_significance():
    res = ask_earthpulse_ai("Is it statistically significant?", current_analysis=MOCK_ANALYSIS)
    assert "0.0002" in res.what_data_shows or "0.264" in res.what_data_shows or "significant" in res.what_data_shows.lower()
