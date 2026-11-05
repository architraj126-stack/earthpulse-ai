# Environmental Variable: Temperature at 2 Metres (T2M)

## Parameter Identification
- **Standard Code**: `T2M`
- **Full Name**: Air Temperature at 2 Metres Above Earth Surface
- **Unit of Measurement**: Degrees Celsius (°C)
- **Primary NASA Source**: NASA POWER (derived from MERRA-2 and GEOS-5 FP-IT)
- **Temporal Resolution Available**: Hourly, Daily, Monthly, Climatology

## Scientific Definition & Physical Mechanism
`T2M` represents the ambient air temperature measured 2 metres above the ground surface, conforming to WMO screen exposure guidelines. It captures the thermodynamic equilibrium between net radiative energy flux, sensible heat exchange with the surface boundary layer, and synoptic advection of air masses.

## Environmental Significance
- **Climate Trend Indicator**: Surface air temperature is the primary direct indicator of global planetary warming and regional heat budget adjustments.
- **Urban Heat Island (UHI)**: Urban centers exhibit elevated temperatures relative to surrounding rural areas due to low albedo impervious materials, reduced evaporative cooling, and anthropogenic heat rejection.
- **Ecological Impact**: Governs plant phenology, growing season length, evapotranspiration rates, and biological metabolic rates.

## Typical Ranges & Behavior
- Global extremes: -89.2°C (Vostok, Antarctica) to +56.7°C (Death Valley, USA).
- Diurnal cycle: Peaks in early-to-mid afternoon (14:00–16:00 local solar time); minima occur immediately around dawn.
- Seasonality: Governed by axial tilt and solar declination; high seasonal amplitude at high continental latitudes, low seasonal amplitude near the equatorial maritime tropics.

## Statistical Analysis Recommendations
- Temperature distributions are generally Gaussian-like, making both Ordinary Least Squares (OLS) Linear Regression and non-parametric Mann-Kendall / Sen's slope tests appropriate.
- Serial correlation (lag-1 autocorrelation) is prevalent in daily temperature series; for strict daily trend testing, pre-whitening or monthly aggregation is recommended.
