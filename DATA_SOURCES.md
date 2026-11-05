# EarthPulse AI — Data Sources & Remote Sensing Catalog

EarthPulse AI integrates satellite observations and atmospheric reanalysis models to analyze historical environmental trends across our planet. This catalog documents all integrated and supported datasets, variable mappings, spatial/temporal resolutions, access mechanisms, calibration methods, and citations.

---

## 1. Primary Live Operational Source: NASA POWER

**Project Name**: NASA Prediction of Worldwide Energy Resources (POWER)  
**Host Organization**: NASA Langley Research Center (LaRC), Hampton, VA  
**Web Portal**: [https://power.larc.nasa.gov](https://power.larc.nasa.gov)  
**API Endpoints**:
- Daily Point: `https://power.larc.nasa.gov/api/temporal/daily/point`
- Monthly Point: `https://power.larc.nasa.gov/api/temporal/monthly/point`
- Climatology: `https://power.larc.nasa.gov/api/temporal/climatology/point`

### Core Environmental Variables
| Parameter Code | Full Name | Standard Units | Sensor / Model Source | Physical Description |
|---|---|---|---|---|
| `T2M` | Temperature at 2 Metres | °C | NASA GMAO MERRA-2 / GEOS 5.12.4 | Ambient air temperature at WMO standard screen height (2m). |
| `PRECTOTCORR` | Corrected Total Precipitation | mm/day or mm/month | MERRA-2 with GPCP v2.3 gauge bias correction | Total liquid and frozen precipitation reaching surface. |
| `RH2M` | Relative Humidity at 2 Metres | % | Computed from T2M and specific humidity (QV2M) | Saturation water vapor percentage. |
| `WS2M` | Wind Speed at 2 Metres | m/s | MERRA-2 boundary layer aerodynamics | 10m wind vector scaled to 2m using surface roughness $z_0$. |
| `ALLSKY_SFC_SW_DWN` | All-Sky Surface Shortwave Downward Irradiance | MJ/m²/day | CERES SYN1deg & FLASHFlux Radiometry | Direct and diffuse solar radiation reaching horizontal ground. |

### Technical Specifications
- **Spatial Resolution**: 0.5° latitude × 0.625° longitude (~50 km) interpolated to query coordinates.
- **Temporal Coverage**: 1981-01-01 to near-present (lagged by 2 to 4 days).
- **Coordinate System**: WGS-84 (EPSG:4326).
- **Missing Value Convention**: `-999.0` (automatically filtered to `NaN` in EarthPulse AI pipelines; never converted to zero).

---

## 2. NASA MODIS (Moderate Resolution Imaging Spectroradiometer)

**Sensors**: MODIS onboard Terra (morning orbit) and Aqua (afternoon orbit) platforms.  
**Archive**: NASA Land Processes Distributed Active Archive Center (LP DAAC) / Earthdata.  
**Web Portal**: [https://modis.gsfc.nasa.gov](https://modis.gsfc.nasa.gov)

### Key Supported Products
1. **MOD13A2 / MYD13A2 (Vegetation Indices)**:
   - `NDVI` (Normalized Difference Vegetation Index): $(NIR - Red) / (NIR + Red)$.
   - `EVI` (Enhanced Vegetation Index): High-canopy aerosol-stabilized vegetation density.
   - Resolution: 1 km spatial, 16-day composite interval.
2. **MOD11A2 / MYD11A2 (Land Surface Temperature)**:
   - `LST_Day_1km` & `LST_Night_1km`: Surface thermal radiant skin temperature in Kelvin / °C.
   - Resolution: 1 km spatial, 8-day composite average.

---

## 3. NASA GPM / IMERG (Global Precipitation Measurement)

**Mission**: NASA / JAXA Global Precipitation Measurement (GPM) Core Observatory and TRMM Constellation.  
**Archive**: NASA Goddard Earth Sciences Data and Information Services Center (GES DISC).  
**Web Portal**: [https://gpm.nasa.gov/data](https://gpm.nasa.gov/data)

### Technical Details
- **Product**: Integrated Multi-satellitE Retrievals for GPM (IMERG Final Run V06B/V07).
- **Resolution**: 0.1° × 0.1° (~10 km × 10 km) gridded global coverage.
- **Coverage**: June 2000 to present (TRMM retrospective processing through current GPM).
- **Scientific Role**: Gold standard for spaceborne rainfall accumulation and extreme precipitation event frequency analysis.

---

## 4. NASA GLDAS (Global Land Data Assimilation System)

**Partners**: NASA GSFC and NOAA NCEP.  
**Archive**: NASA GES DISC.  
**Web Portal**: [https://ldas.gsfc.nasa.gov/gldas](https://ldas.gsfc.nasa.gov/gldas)

### Key Hydrological Variables
- `SoilMoi0_10cm_inst`: Surface layer soil moisture content (0–10 cm depth) in kg/m² or volumetric %.
- `Evap_tavg`: Total terrestrial evapotranspiration rate (kg/m²/s).
- `SWE_inst`: Snow Water Equivalent accumulation.
- **Resolution**: 0.25° × 0.25° (~25 km), 3-hourly, daily, and monthly series from 1948 to present.

---

## 5. NASA MERRA-2 (Modern-Era Retrospective analysis for Research and Applications, Version 2)

**Organization**: NASA Global Modeling and Assimilation Office (GMAO).  
**Web Portal**: [https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/](https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/)

### Role in EarthPulse AI
MERRA-2 provides the core thermodynamic assimilation backbone behind NASA POWER point meteorological streams. It is the first long-term global reanalysis to assimilate satellite aerosol optical depth (AOD) and couple atmospheric aerosol absorption/scattering with radiation and cloud dynamics.

---

## 6. Official Citation Standards

1. **NASA POWER**:
   > NASA Langley Research Center (LaRC) POWER Project. "Prediction of Worldwide Energy Resources: Surface Meteorology and Solar Energy." Funded by the NASA Earth Science Applied Sciences Program. URL: https://power.larc.nasa.gov.
2. **NASA MERRA-2**:
   > Gelaro, R., et al. (2017). "The Modern-Era Retrospective Analysis for Research and Applications, Version 2 (MERRA-2)." *Journal of Climate*, 30(14), 5419–5454.
3. **NASA GPM / IMERG**:
   > Huffman, G. J., et al. (2020). "The Integrated Multi-satellitE Retrievals for GPM (IMERG)." In: *Satellite Precipitation Measurement*, Advances in Global Change Research, vol 67. Springer.
4. **WMO Guidelines**:
   > World Meteorological Organization (2020). *Guidelines on the Calculation of Climate Extremes and Indices (WMO-No. 1100).* Geneva.
