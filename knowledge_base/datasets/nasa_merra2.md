# NASA MERRA-2 (Modern-Era Retrospective analysis for Research and Applications, Version 2)

## Overview
MERRA-2 is NASA's atmospheric reanalysis for the satellite era using the Goddard Earth Observing System Model (GEOS-5 ADAS) version 5.12.4. Developed by the Global Modeling and Assimilation Office (GMAO), MERRA-2 is the first long-term global reanalysis to assimilate space-based aerosol observations and couple them with atmospheric circulation and radiation.

## Primary Variables & Diagnostics
- **Atmospheric Temperature**: 2-meter air temperature (`T2M`), skin temperature (`TS`), and 42 pressure levels up to 0.01 hPa.
- **Atmospheric Moisture & Fluxes**: Specific humidity at 2m (`QV2M`), total precipitable water vapor (`TQV`), surface evaporation (`EVAP`), and precipitation (`PRECTOT`).
- **Surface Wind Fields**: 2m wind speed (`WS2M`), 10m wind speed (`WS10M`), zonal ($U$) and meridional ($V$) wind vectors.
- **Aerosols**: Aerosol Optical Depth (AOD) at 550 nm, sea salt, dust, sulfate, and organic/black carbon.

## Spatial & Temporal Specifications
- **Grid Resolution**: 0.5° latitude x 0.625° longitude (approx. 50 km).
- **Vertical Levels**: 72 hybrid-eta levels from surface to 0.01 hPa.
- **Temporal Resolution**: 1-hourly, 3-hourly, and monthly means.
- **Temporal Coverage**: 1980-01-01 to present (updated continuously).

## Connection to NASA POWER
NASA POWER ingests MERRA-2 for all historical point meteorological parameters prior to near-real-time GEOS operational streams. When querying NASA POWER `T2M`, `PRECTOTCORR`, or `WS2M`, the underlying physics is derived directly from MERRA-2.

## Citation
Gelaro, R., et al. (2017). "The Modern-Era Retrospective Analysis for Research and Applications, Version 2 (MERRA-2)." Journal of Climate, 30(14), 5419–5454. https://doi.org/10.1175/JCLI-D-16-0758.1.

---
**Source Reference:** [https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/](https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/)
