#!/usr/bin/env python3
"""
EarthPulse AI - World Atlas Precomputation Script
Generates coarse-grid global Sen's slope and statistical significance datasets
(1990 - 2023) for global climate trend visualization.

Saves precomputed data to: backend/data/atlas/<variable>.json
Variables covered:
  - T2M (2-Meter Air Temperature)
  - PRECTOTCORR (Precipitation)
  - RH2M (Relative Humidity)
  - WS2M (Wind Speed)
  - ALLSKY_SFC_SW_DWN (Solar Irradiance)
"""

import os
import sys
import json
import math
import numpy as np
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "atlas"

VARIABLES = {
    "T2M": {
        "name": "2-Meter Air Temperature",
        "unit": "°C",
        "base_slope_range": (0.15, 0.75),  # warming per decade
        "arctic_amplification": 2.2,
        "land_ocean_contrast": 1.4,
    },
    "PRECTOTCORR": {
        "name": "Precipitation",
        "unit": "mm/day",
        "base_slope_range": (-0.12, 0.15),
    },
    "RH2M": {
        "name": "Relative Humidity at 2 Meters",
        "unit": "%",
        "base_slope_range": (-1.2, 0.8),
    },
    "WS2M": {
        "name": "Wind Speed at 10 Meters",
        "unit": "m/s",
        "base_slope_range": (-0.25, 0.15),
    },
    "ALLSKY_SFC_SW_DWN": {
        "name": "All Sky Surface Shortwave Downward Irradiance",
        "unit": "kW-hr/m²/day",
        "base_slope_range": (-0.15, 0.20),
    }
}

HOTSPOTS = [
    {"name": "Amazon Basin", "lat": -3.4653, "lon": -62.2159},
    {"name": "Sahel Region", "lat": 14.4974, "lon": 14.4524},
    {"name": "Greenland Ice Sheet", "lat": 72.0, "lon": -40.0},
    {"name": "Aral Sea Basin", "lat": 45.0, "lon": 60.0},
    {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
    {"name": "Delhi NCR", "lat": 28.6139, "lon": 77.2090},
    {"name": "Chennai", "lat": 13.0827, "lon": 80.2707},
    {"name": "Siberian Arctic", "lat": 68.0, "lon": 100.0},
    {"name": "Mediterranean Basin", "lat": 38.0, "lon": 18.0},
    {"name": "Australian Outback", "lat": -25.0, "lon": 135.0},
    {"name": "Tibetan Plateau", "lat": 32.0, "lon": 86.0},
    {"name": "Congo Rainforest", "lat": -0.5, "lon": 22.0},
    {"name": "Californian Central Valley", "lat": 36.5, "lon": -119.5},
]

def is_land_approx(lat: float, lon: float) -> bool:
    """
    Fast, coarse approximation to identify land/continental points
    vs deep oceanic points for environmental visualization.
    """
    # Polar bounds
    if lat > 80 or lat < -65:
        return lat < -60  # Antarctica
    # North America
    if 15 <= lat <= 70 and -165 <= lon <= -55:
        return True
    # South America
    if -55 <= lat <= 12 and -80 <= lon <= -35:
        return True
    # Europe & Africa
    if -35 <= lat <= 70 and -18 <= lon <= 50:
        return True
    # Asia
    if 5 <= lat <= 75 and 50 <= lon <= 170:
        return True
    # Australia & NZ
    if -45 <= lat <= -10 and 112 <= lon <= 178:
        return True
    return False

def generate_atlas_for_variable(var_code: str, var_meta: dict) -> dict:
    np.random.seed(42 + sum(ord(c) for c in var_code))
    
    start_year = 1990
    end_year = 2023
    grid_res = 5.0  # 5-degree grid
    
    lats = np.arange(-60.0, 75.1, grid_res)
    lons = np.arange(-180.0, 180.0, grid_res)
    
    cells = []
    
    # 1. Regular grid cells over land
    for lat in lats:
        for lon in lons:
            if not is_land_approx(lat, lon):
                continue
            
            # Physics-based / empirical trend approximation
            lat_rad = math.radians(lat)
            abs_lat = abs(lat)
            
            if var_code == "T2M":
                # Arctic amplification: polar regions warm faster
                polar_factor = 1.0 + 1.2 * (abs_lat / 90.0)**2
                # Land warming rate: ~0.25 to 0.55 C/decade
                noise = np.random.normal(0, 0.05)
                slope_decade = round(float(0.32 * polar_factor + noise), 3)
                p_val = round(float(max(0.0001, np.random.exponential(0.008))), 4)
                mean_val = round(float(28.0 - 0.55 * abs_lat + np.random.normal(0, 2.0)), 1)
            elif var_code == "PRECTOTCORR":
                # Wet-gets-wetter / dry-gets-drier pattern (Held-Soden)
                subtropical_dry = 15 <= abs_lat <= 35
                sign = -1 if subtropical_dry else 1
                base = 0.04 * sign + np.random.normal(0, 0.03)
                slope_decade = round(float(base), 3)
                p_val = round(float(min(0.85, max(0.001, np.random.beta(1.5, 4.0)))), 4)
                mean_val = round(float(max(0.2, 3.5 - 0.03 * abs_lat + np.random.normal(0, 0.8))), 2)
            elif var_code == "RH2M":
                # Decreasing relative humidity over warming continents
                slope_decade = round(float(-0.35 + np.random.normal(0, 0.25)), 2)
                p_val = round(float(max(0.001, np.random.exponential(0.04))), 4)
                mean_val = round(float(min(90.0, max(30.0, 65.0 + np.random.normal(0, 10.0)))), 1)
            elif var_code == "WS2M":
                # Global terrestrial stilling vs recovery
                slope_decade = round(float(-0.06 + np.random.normal(0, 0.05)), 3)
                p_val = round(float(min(0.9, max(0.002, np.random.beta(2, 3)))), 4)
                mean_val = round(float(max(1.0, 3.8 + np.random.normal(0, 0.7))), 2)
            else:  # ALLSKY_SFC_SW_DWN
                # Solar dimming and brightening
                slope_decade = round(float(0.04 + np.random.normal(0, 0.05)), 3)
                p_val = round(float(min(0.8, max(0.005, np.random.beta(2, 4)))), 4)
                mean_val = round(float(max(2.5, 5.2 - 0.03 * abs_lat + np.random.normal(0, 0.5))), 2)
            
            is_sig = bool(p_val < 0.05)
            if is_sig:
                trend_dir = "increasing" if slope_decade > 0 else "decreasing"
            else:
                trend_dir = "stable"
                
            cells.append({
                "latitude": round(float(lat), 1),
                "longitude": round(float(lon), 1),
                "location_name": f"{abs(lat):.0f}°{'N' if lat>=0 else 'S'}, {abs(lon):.0f}°{'E' if lon>=0 else 'W'}",
                "sens_slope_per_decade": slope_decade,
                "sen_slope_per_decade": slope_decade,
                "p_value": p_val,
                "is_significant": is_sig,
                "trend_direction": trend_dir,
                "mean_value": mean_val
            })

    # 2. Add high-interest hotspots specifically
    for spot in HOTSPOTS:
        lat, lon = spot["lat"], spot["lon"]
        if var_code == "T2M":
            # Arctic/Greenland/Aral warming fast
            rate = 0.68 if "Greenland" in spot["name"] or "Arctic" in spot["name"] else (
                0.48 if "Aral" in spot["name"] or "Delhi" in spot["name"] else 0.36
            )
            p_val = 0.0002
            mean_val = -10.0 if "Greenland" in spot["name"] else 26.5
        elif var_code == "PRECTOTCORR":
            rate = -0.18 if "Aral" in spot["name"] or "Sahel" in spot["name"] else 0.12
            p_val = 0.004
            mean_val = 1.8
        elif var_code == "RH2M":
            rate = -0.85 if "Aral" in spot["name"] or "Amazon" in spot["name"] else -0.3
            p_val = 0.012
            mean_val = 55.0
        elif var_code == "WS2M":
            rate = -0.09
            p_val = 0.03
            mean_val = 3.2
        else:
            rate = 0.07
            p_val = 0.02
            mean_val = 4.8
            
        cells.append({
            "latitude": round(lat, 4),
            "longitude": round(lon, 4),
            "location_name": spot["name"],
            "sens_slope_per_decade": rate,
            "sen_slope_per_decade": rate,
            "p_value": p_val,
            "is_significant": True,
            "trend_direction": "increasing" if rate > 0 else "decreasing",
            "mean_value": mean_val
        })

    return {
        "variable": var_code,
        "variable_name": var_meta["name"],
        "unit": var_meta["unit"],
        "start_year": start_year,
        "end_year": end_year,
        "grid_resolution_deg": grid_res,
        "cell_count": len(cells),
        "is_simulated": True,
        "source": "Illustrative simulated grid (not observed data)",
        "cells": cells
    }

def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[Atlas] Generating World Atlas data to {DATA_DIR}...")
    
    for var_code, var_meta in VARIABLES.items():
        data = generate_atlas_for_variable(var_code, var_meta)
        target_path = DATA_DIR / f"{var_code}.json"
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"  -> Generated {var_code}: {data['cell_count']} grid cells saved to {target_path.name}")
        
    print("[Atlas] Generation complete successfully!")

if __name__ == "__main__":
    main()
