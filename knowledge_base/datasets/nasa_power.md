# NASA POWER (Prediction Of Worldwide Energy Resources)

## Overview
The NASA POWER project provides solar and meteorological datasets derived from NASA satellite observations and global assimilation models. Initiated to support renewable energy (solar and wind), building energy efficiency, and sustainable agriculture, POWER has become a gold standard for point and regional environmental data globally.

## Data Sources & Synthesis Methodology
POWER datasets are synthesized from two primary NASA systems:
1. **Atmospheric Assimilation Models**:
   - **MERRA-2** (Modern-Era Retrospective analysis for Research and Applications, Version 2) produced by NASA's Global Modeling and Assimilation Office (GMAO).
   - **GEOS** (Goddard Earth Observing System 5.12.4 FP-IT) near real-time operational assimilation.
2. **Satellite Solar Irradiance**:
   - **CERES** (Clouds and the Earth's Radiant Energy System) SYN1deg and FLASHFlux (Fast Longwave and SHortwave Radiative Fluxes) algorithms providing all-sky and clear-sky solar fluxes.

## Technical Specifications
- **Spatial Coverage**: Global (Latitude: -90.0° to 90.0°, Longitude: -180.0° to 180.0°).
- **Spatial Resolution**:
  - Meteorological parameters: 0.5° latitude x 0.625° longitude (MERRA-2 native grid) interpolated to point coordinates.
  - Solar parameters: 1.0° latitude x 1.0° longitude (CERES native grid).
- **Temporal Coverage**: 1981-01-01 to near-real-time (typically lagged by 2 to 4 days for meteorological data).
- **Temporal Resolutions**: Hourly, Daily, Monthly, and Multi-Year Climatology.

## Key Core Variables
| Parameter Code | Description | Standard Units | Sensor / Model Source |
|---|---|---|---|
| `T2M` | Temperature at 2 Metres Above Earth Surface | °C (Celsius) | MERRA-2 / GEOS 5.12.4 |
| `PRECTOTCORR` | Corrected Total Precipitation (rain and snow water equivalent) | mm/day or mm/month | MERRA-2 / GEOS-IT with gauge correction |
| `RH2M` | Relative Humidity at 2 Metres | % | Computed from T2M and QV2M (specific humidity) |
| `WS2M` | Wind Speed at 2 Metres | m/s | MERRA-2 / GEOS aerodynamic roughness scaling |
| `ALLSKY_SFC_SW_DWN` | All-Sky Surface Shortwave Downward Irradiance | MJ/m²/day or kW-hr/m²/day | CERES / FLASHFlux satellite radiative transfer |

## Data Access Architecture
NASA POWER provides a REST API without requiring API keys for standard queries:
- **Daily Point API**: `https://power.larc.nasa.gov/api/temporal/daily/point`
- **Monthly Point API**: `https://power.larc.nasa.gov/api/temporal/monthly/point`
- **Climatology API**: `https://power.larc.nasa.gov/api/temporal/climatology/point`

### Required Query Parameters
- `latitude`: WGS-84 coordinate (-90 to 90)
- `longitude`: WGS-84 coordinate (-180 to 180)
- `parameters`: Comma-separated list of parameter codes (e.g., `T2M,PRECTOTCORR`)
- `community`: User application domain (`RE` = Renewable Energy, `AG` = Sustainable Agroclimatology, `SB` = Sustainable Buildings)
- `format`: Output encoding (`JSON`, `CSV`, `GeoJSON`, `NETCDF`)
- `start`: YYYYMMDD (Daily) or YYYY (Monthly)
- `end`: YYYYMMDD (Daily) or YYYY (Monthly)

## Data Quality & Fill Values
- NASA POWER utilizes `-999.0` (or `-999`) as the standard missing value / fill flag.
- Valid processing pipelines must filter or convert `-999.0` values to `NaN` before running statistical aggregations, regression, or non-parametric tests. Never substitute missing values with `0.0`.

## Limitations & Uncertainties
1. **Grid Interpolation vs. In-situ Microclimate**: Values represent grid-cell averages (approx. 50 km x 50 km). Local microclimates (e.g., urban street canyons, steep valleys) may exhibit localized variations from grid means.
2. **Lag in Release**: Final validated data has a ~2-month latency; near-real-time GEOS operational streams bridge recent weeks.
3. **Precipitation Partitioning**: Convective extreme precipitation can be smoothed compared to local high-frequency tipping bucket gauges.

## Official Citation
NASA Langley Research Center (LaRC) POWER Project. "Prediction of Worldwide Energy Resources: Surface Meteorology and Solar Energy." Funded by the NASA Earth Science Applied Sciences Program. URL: https://power.larc.nasa.gov.

---
**Source Reference:** [https://power.larc.nasa.gov/](https://power.larc.nasa.gov/)
