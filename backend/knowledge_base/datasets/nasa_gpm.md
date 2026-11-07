# NASA GPM (Global Precipitation Measurement) & IMERG

## Overview
The Global Precipitation Measurement (GPM) mission is an international satellite mission initiated by NASA and JAXA (Japan Aerospace Exploration Agency) to set the global standard for space-borne precipitation measurements. Building upon the Tropical Rainfall Measuring Mission (TRMM), GPM features a Core Observatory with a Dual-frequency Precipitation Radar (DPR) and the GPM Microwave Imager (GMI).

## IMERG Algorithm (Integrated Multi-satellitE Retrievals for GPM)
IMERG intercalibrates, merges, and interpolates:
- Satellite passive microwave precipitation estimates from the GPM constellation.
- Microwave-calibrated infrared (IR) satellite estimates from geosynchronous satellites.
- Global surface precipitation gauge analyses (GPCC - Global Precipitation Climatology Centre) for monthly bias corrections.

## Key Products & Variables
- **Variable**: `precipitationCal` (Calibrated precipitation rate in mm/hr or accumulation in mm).
- **Spatial Resolution**: 0.1° x 0.1° latitude/longitude grid (approximately 10 km x 10 km at the equator).
- **Temporal Resolution**: Half-hourly, 1-day daily accumulation, and monthly calibrated totals.
- **Temporal Coverage**: 2000-06-01 to present (retrospectively processed TRMM era through current GPM).

## Release Runs
1. **Early Run** (~4 hours latency): For disaster management and flash flood tracking.
2. **Late Run** (~14 hours latency): Incorporates multi-pass microwave retrievals.
3. **Final Run** (~3.5 months latency): Calibrated against monthly GPCC surface gauge observations for rigorous climate trend analysis.

## Data Access
- **NASA GES DISC** (Goddard Earth Sciences Data and Information Services Center): `https://disc.gsfc.nasa.gov/`
- **OPeNDAP / Earthdata HTTPS**: Downloadable as HDF5/NetCDF4 and GeoTIFF.
- Requires free NASA Earthdata login credentials (`urs.earthdata.nasa.gov`).

## Citation
Huffman, G. J., et al. (2020). "The Integrated Multi-satellitE Retrievals for GPM (IMERG)." In: Satellite Precipitation Measurement, Advances in Global Change Research, vol 67. Springer, Cham.

---
**Source Reference:** [https://gpm.nasa.gov/](https://gpm.nasa.gov/)
