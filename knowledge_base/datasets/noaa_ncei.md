# NOAA NCEI (National Centers for Environmental Information)

## Overview
NOAA NCEI hosts the world's most comprehensive archives of oceanic, atmospheric, and geophysical data. For climate trend detection, NCEI maintains global in-situ station networks and homogenized paleoclimate reconstructions.

## Key Climate Observational Networks
1. **GHCN-Daily (Global Historical Climatology Network - Daily)**:
   - Database of daily meteorological measurements from over 100,000 land surface stations across 180 countries and territories.
   - Core elements: maximum temperature (`TMAX`), minimum temperature (`TMIN`), precipitation (`PRCP`), snowfall (`SNOW`), snow depth (`SNWD`).
2. **GHCN-Monthly (Version 4)**:
   - Monthly average surface temperatures adjusted for station moves, instrument changes, and urbanization effects using the Pairwise Homogenization Algorithm (PHA).
3. **NOAAGlobalTemp**:
   - Gridded surface temperature anomaly dataset combining GHCN-M land data with Extended Reconstructed Sea Surface Temperature (ERSST v5).

## API & Data Access
- **NOAA Climate Data Online (CDO) API v2**: RESTful API providing JSON output.
- Endpoint: `https://www.ncei.noaa.gov/cdo-web/api/v2/`
- Requires a free user access token (`token` header).

## Citation
Menne, M. J., et al. (2012). "An Overview of the Global Historical Climatology Network-Daily Database." Journal of Atmospheric and Oceanic Technology, 29(7), 897-910. https://doi.org/10.1175/JTECH-D-11-00103.1.
