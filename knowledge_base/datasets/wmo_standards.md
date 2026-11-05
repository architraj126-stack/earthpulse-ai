# World Meteorological Organization (WMO) Standards

## Overview
The World Meteorological Organization (WMO) establishes international standards for environmental observation, meteorological instrument exposure, data exchange, and climate calculation practices.

## Standard Observation Conventions
1. **Air Temperature & Humidity Measurement Height**:
   - Standard sensor height is **1.25 to 2.0 metres** above ground level over an open, level grass or natural terrain area.
   - Screened by a ventilated radiation shield (Stevenson screen) to eliminate direct solar radiation errors.
2. **Wind Speed Measurement Height**:
   - Standard exposure height is **10.0 metres** above open, flat ground.
   - 2-meter wind speeds (`WS2M`) in models such as MERRA-2 and NASA POWER are calculated from logarithmic boundary layer profiles using surface roughness length ($z_0$).
3. **Precipitation**:
   - Recorded as equivalent liquid depth in millimeters ($1 \text{ mm} = 1 \text{ kg/m}^2 = 1 \text{ L/m}^2$).
   - Corrected for wind undercatch, wetting loss, and evaporation.

## Climatological Normal Periods
- WMO defines standard reference normals as consecutive 30-year blocks updated every decade.
- Current active normal: **1991–2020**.
- Long-term historic baseline for climate change comparison: **1961–1990**.

## Trend Analysis Guidelines
- WMO Guidelines on the Calculation of Climate Extremes and Indices (WMO-No. 1100) recommend using non-parametric estimators (such as Sen's slope and Mann-Kendall test) for hydrological series because rainfall and wind distributions are strongly skewed and non-Gaussian.
- Missing data criteria: In monthly climate series, a month is considered invalid if more than 10 daily observations are missing, or more than 5 consecutive daily values are absent.
