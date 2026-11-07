# NASA MODIS (Moderate Resolution Imaging Spectroradiometer)

## Overview
MODIS is a key instrument aboard the Terra (EOS AM-1) and Aqua (EOS PM-1) satellite platforms. Terra passes north-to-south across the equator in the morning (10:30 AM local time), while Aqua passes south-to-north in the afternoon (1:30 PM local time). MODIS observes Earth's vital signs across 36 spectral bands spanning 0.4 µm to 14.4 µm.

## Core Environmental Products & Variables
1. **Vegetation Indices (MOD13A2 / MYD13A2)**:
   - `NDVI` (Normalized Difference Vegetation Index): Ratio $(NIR - Red) / (NIR + Red)$, scale -1.0 to 1.0 (vegetation typically 0.2 to 0.85).
   - `EVI` (Enhanced Vegetation Index): Minimizes canopy background variations and aerosol influences.
   - Resolution: 1 km spatial, 16-day composite period.
2. **Land Surface Temperature (MOD11A2 / MYD11A2)**:
   - `LST_Day_1km` & `LST_Night_1km`: Clear-sky land surface skin temperature in Kelvin (or °C).
   - Resolution: 1 km spatial, 8-day composite average.
3. **Surface Reflectance (MOD09A1)**:
   - 7 atmospheric-corrected bands for land observation.

## Data Access Methods
- **NASA Earthdata Cloud / LP DAAC** (Land Processes Distributed Active Archive Center): `https://lpdaac.usgs.gov/`
- **NASA AppEEARS API** (Application for Extracting and Exploring Analysis Ready Samples): Point and area extraction API requiring Earthdata Login (free authentication token).
- **CMR (Common Metadata Repository)**: Searchable spatial/temporal catalog.

## Limitations & Sensor Health
- Cloud contamination in persistent cloudy regions (e.g., tropical rainforests, monsoonal cloudy seasons).
- Terra and Aqua are operating past their primary mission life; data continuity transitions to VIIRS (Visible Infrared Imaging Radiometer Suite) aboard Suomi-NPP and NOAA-20/21.

## Citation
Didan, K. (2015). MOD13A2 MODIS/Terra Vegetation Indices 16-Day L3 Global 1km SIN Grid V006. NASA EOSDIS Land Processes DAAC. https://doi.org/10.5067/MODIS/MOD13A2.006.
Wan, Z., et al. (2015). MOD11A2 MODIS/Terra Land Surface Temperature/Emissivity 8-Day L3 Global 1km SIN Grid V006. NASA LP DAAC. https://doi.org/10.5067/MODIS/MOD11A2.006.

---
**Source Reference:** [https://modis.gsfc.nasa.gov/](https://modis.gsfc.nasa.gov/)
