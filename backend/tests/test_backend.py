import os
import sys
import pytest
import pandas as pd
import numpy as np

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.nasa_service import VARIABLES_REGISTRY, generate_demonstration_dataset
from app.services.data_processor import clean_and_process_timeseries
from app.analysis.statistical_engine import (
    compute_linear_regression,
    compute_mann_kendall,
    compute_sens_slope,
    compute_seasonal_mann_kendall,
    run_full_statistical_analysis
)
from app.services.report_service import generate_pdf_report
from app.services.ai_service import ask_earthpulse_ai, kb_index
from app.routes.api import get_health, get_variables

def test_health_check():
    health = get_health()
    assert health["status"] == "healthy"
    assert health["service"] == "EarthPulse AI Backend"
    assert "SQLite" in health["database"]
    assert health["knowledge_base_documents"] > 0

def test_variables_registry():
    vars_list = get_variables()
    assert len(vars_list) == 5
    codes = [v["parameter"] if isinstance(v, dict) else v.parameter for v in vars_list]
    assert "T2M" in codes
    assert "PRECTOTCORR" in codes
    assert "RH2M" in codes
    assert "WS2M" in codes
    assert "ALLSKY_SFC_SW_DWN" in codes

def test_demonstration_data_generator():
    df, meta = generate_demonstration_dataset(
        latitude=12.9716,
        longitude=77.5946,
        parameter="T2M",
        start_date="2010-01-01",
        end_date="2020-12-31",
        frequency="monthly"
    )
    assert len(df) == 132  # 11 years * 12 months
    assert "date" in df.columns
    assert "value" in df.columns
    assert meta["is_demonstration"] is True

def test_statistical_engine_linear_trend():
    # Construct a synthetic strictly increasing time series
    dates = pd.date_range("2000-01-01", periods=120, freq="MS")
    vals = np.linspace(20.0, 25.0, 120)  # +0.5°C per year over 10 years
    df = pd.DataFrame({"date": dates, "value": vals})

    ols = compute_linear_regression(df, frequency="monthly")
    assert round(ols.slope_per_year, 1) == 0.5
    assert ols.r_squared > 0.99
    assert ols.p_value < 0.001

    mk = compute_mann_kendall(df)
    assert mk.trend == "increasing"
    assert mk.p_value < 0.001
    assert mk.tau > 0.9

    sens = compute_sens_slope(df, frequency="monthly")
    assert round(sens, 1) == 0.5

def test_seasonal_mann_kendall():
    # 36 months (3 years) with periodic seasonality plus upward shift
    dates = pd.date_range("2010-01-01", periods=36, freq="MS")
    vals = [20 + (i % 12) * 0.5 + (i // 12) * 0.4 for i in range(36)]
    df = pd.DataFrame({"date": dates, "value": vals})

    smk = compute_seasonal_mann_kendall(df, frequency="monthly")
    assert smk is not None
    assert smk.trend in ["increasing", "no trend"]

def test_pdf_report_generation():
    df, meta = generate_demonstration_dataset(
        latitude=12.9716,
        longitude=77.5946,
        parameter="T2M",
        start_date="2015-01-01",
        end_date="2023-12-31",
        frequency="monthly"
    )
    summary = run_full_statistical_analysis(
        df=df,
        variable_info=VARIABLES_REGISTRY["T2M"],
        location_name="Bengaluru, Karnataka",
        latitude=12.9716,
        longitude=77.5946,
        start_date="2015-01-01",
        end_date="2023-12-31",
        frequency="monthly",
        source="NASA POWER",
        is_demonstration=True
    )
    pdf_buffer = generate_pdf_report(summary.model_dump())
    content = pdf_buffer.getvalue()
    assert len(content) > 2000
    assert content.startswith(b"%PDF")

def test_ai_knowledge_base_retrieval():
    assert len(kb_index.documents) >= 20
    res = ask_earthpulse_ai("What does the Mann-Kendall p-value mean?")
    assert "p-value" in res.answer.lower() or "hypothesis" in res.answer.lower()
    assert len(res.sources_and_citations) > 0
    assert "What the data shows:" in res.answer
    assert "What it means:" in res.answer
    assert "Sources:" in res.answer

def test_autocorrelation_and_pettitt():
    from app.analysis.statistical_engine import compute_autocorrelation, compute_pettitt_test
    # Time series with a shift at index 60
    dates = pd.date_range("2000-01-01", periods=120, freq="MS")
    vals = np.concatenate([np.random.normal(15.0, 0.5, 60), np.random.normal(18.0, 0.5, 60)])
    df = pd.DataFrame({"date": dates, "value": vals})

    ac = compute_autocorrelation(df)
    assert hasattr(ac, "lag1_autocorrelation")
    assert hasattr(ac, "is_significant")

    pet = compute_pettitt_test(df)
    assert pet is not None
    assert pet.change_point_index is not None
    assert pet.change_point_year is not None

def test_atlas_endpoint():
    from app.routes.api import get_atlas, get_top_atlas_cells
    atlas = get_atlas(variable="T2M")
    assert atlas.variable == "T2M"
    assert len(atlas.cells) > 100

    top_cells = get_top_atlas_cells(variable="T2M", n=5)
    assert len(top_cells) <= 5
    assert all(c.is_significant for c in top_cells)
