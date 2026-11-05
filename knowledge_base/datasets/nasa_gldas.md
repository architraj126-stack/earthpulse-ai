# NASA GLDAS (Global Land Data Assimilation System)

## Overview
GLDAS is a joint project developed by NASA Goddard Space Flight Center (GSFC) and NOAA National Centers for Environmental Prediction (NCEP). It integrates satellite- and ground-based observational data within advanced land surface models (LSMs) to simulate terrestrial water and energy cycles.

## Land Surface Models Employed
- **Noah Model**: Widely used in weather forecasting and climate research; calculates four-layer soil hydrology (0-10 cm, 10-40 cm, 40-100 cm, 100-200 cm).
- **Catchment Model**: Topography-based hydrological modeling accounting for spatial water table variations.
- **Community Land Model (CLM)**: Focuses on biogeochemical cycles and vegetation dynamics.

## Key Environmental Variables
| Variable Code | Description | Units | Layer Depth |
|---|---|---|---|
| `SoilMoi0_10cm_inst` | Soil Moisture Content | kg/m² or m³/m³ | 0 to 10 cm (surface) |
| `SoilMoi10_40cm_inst` | Root Zone Soil Moisture | kg/m² | 10 to 40 cm |
| `Evap_tavg` | Total Evapotranspiration Rate | kg/m²/s | Total column |
| `Qs_acc` | Surface Runoff Accumulation | kg/m² | Surface |
| `SWE_inst` | Snow Water Equivalent | kg/m² | Surface |

## Spatial & Temporal Specifications
- **Spatial Resolution**: 0.25° x 0.25° (approx. 25 km) and 1.0° x 1.0°.
- **Temporal Resolution**: 3-hourly, daily averages, and monthly aggregations.
- **Coverage**: 1948 to present (GLDAS-2.0 provides climatology; GLDAS-2.1 provides near-real-time from 2000 to present).

## Access & Limitations
- Managed by NASA GES DISC (`https://disc.gsfc.nasa.gov/`).
- Because GLDAS blends model physics with observations, soil moisture trends reflect both model land-surface assumptions and precipitation inputs.

## Citation
Rodell, M., et al. (2004). "The Global Land Data Assimilation System." Bulletin of the American Meteorological Society, 85(3), 381-394. https://doi.org/10.1175/BAMS-85-3-381.

---
**Source Reference:** [https://ldas.gsfc.nasa.gov/gldas](https://ldas.gsfc.nasa.gov/gldas)
