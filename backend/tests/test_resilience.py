import os
import sys
import pytest
from unittest.mock import patch
import requests

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.nasa_service import (
    fetch_nasa_power_data,
    generate_demonstration_dataset,
    VARIABLES_REGISTRY
)

def test_coordinate_clamping_and_normalization():
    # Test that extreme coordinates are clamped without raising exceptions
    df, is_demo, source, meta = fetch_nasa_power_data(
        latitude=115.5,    # > 90
        longitude=195.0,   # > 180
        parameter="T2M",
        start_date="2015-01-01",
        end_date="2018-12-31",
        frequency="monthly"
    )
    assert df is not None
    assert len(df) > 0
    # Clamped latitude should be 90
    assert meta["latitude"] == 90.0
    # 195 normalized should be -165.0
    assert meta["longitude"] == -165.0

def test_negative_coordinate_clamping():
    df, is_demo, source, meta = fetch_nasa_power_data(
        latitude=-120.0,
        longitude=-200.0,
        parameter="T2M",
        start_date="2015-01-01",
        end_date="2018-12-31",
        frequency="monthly"
    )
    assert meta["latitude"] == -90.0
    assert meta["longitude"] == 160.0

def test_inverted_date_auto_swap():
    # Pass start_date after end_date
    df, is_demo, source, meta = fetch_nasa_power_data(
        latitude=28.6139,
        longitude=77.2090,
        parameter="T2M",
        start_date="2020-01-01",
        end_date="2015-01-01",
        frequency="monthly"
    )
    assert df is not None
    assert len(df) > 0
    # Start date in metadata should be normalized to the earlier year
    assert meta["start_date"].startswith("2015")
    assert meta["end_date"].startswith("2020")

def test_ocean_coordinate_detection():
    # Mid-Pacific point (0.0, -140.0) is clearly open ocean
    df_ocean, _, _, meta_ocean = fetch_nasa_power_data(
        latitude=0.0,
        longitude=-140.0,
        parameter="T2M",
        start_date="2018-01-01",
        end_date="2020-12-31",
        frequency="monthly"
    )
    assert meta_ocean.get("is_ocean") is True

    # Vienna, Austria (48.2, 16.37) is landlocked continental land
    df_land, _, _, meta_land = fetch_nasa_power_data(
        latitude=48.2082,
        longitude=16.3738,
        parameter="T2M",
        start_date="2018-01-01",
        end_date="2020-12-31",
        frequency="monthly"
    )
    assert meta_land.get("is_ocean") is False

def test_fallback_on_network_timeout():
    # Simulate a connection timeout exception from requests.get
    with patch("requests.get", side_effect=requests.exceptions.Timeout("NASA Gateway connection timed out")):
        df, is_demo, source, meta = fetch_nasa_power_data(
            latitude=51.5074,
            longitude=-0.1278,
            parameter="T2M",
            start_date="2010-01-01",
            end_date="2020-12-31",
            frequency="monthly"
        )
        assert df is not None
        assert len(df) > 0
        assert is_demo is True
        assert meta["is_demonstration"] is True
        assert "fallback" in source.lower() or "demonstration" in source.lower()
