# Environmental Variable: Corrected Precipitation (PRECTOTCORR)

## Parameter Identification
- **Standard Code**: `PRECTOTCORR`
- **Full Name**: Bias-Corrected Total Surface Precipitation
- **Unit of Measurement**: Millimetres per day (mm/day) or Millimetres per month (mm/month)
- **Primary NASA Source**: NASA POWER (MERRA-2 atmospheric assimilation adjusted against GPCP v2.3 / CPC gauge networks)
- **Temporal Resolution**: Daily, Monthly, Climatology

## Scientific Definition & Physical Mechanism
`PRECTOTCORR` quantifies the total depth of water reaching the Earth's surface in liquid and frozen forms (rain, snow, graupel, drizzle) per unit area. "Corrected" denotes that model-generated reanalysis precipitation has undergone statistical bias correction using satellite and rain gauge observations (GPCP and CPC) to rectify convective parameterization biases.

## Environmental Significance
- **Hydrological Balance**: Direct input driving river basin discharge, soil water recharge, reservoir storage, and agricultural yield.
- **Climate Change Fingerprint**: Thermodynamic scaling via the Clausius-Clapeyron relation implies an increase in atmospheric moisture holding capacity (~7% per 1°C of warming). While global mean precipitation increases moderately (1-3% per °C), extreme convective precipitation events intensify substantially.
- **Monsoonal Systems**: Crucial for monitoring variations in the South Asian Southwest and Northeast monsoons, Sahelian rainbands, and El Niño-Southern Oscillation (ENSO) teleconnections.

## Typical Characteristics & Statistical Caveats
- **Non-Gaussian Skewed Distribution**: Precipitation features a high frequency of zero-rain days followed by extreme positive skewness on wet days (well described by Gamma or Tweedie distributions).
- **Trend Detection Rules**: Because precipitation is non-normally distributed and prone to extreme outliers, **Ordinary Least Squares (OLS) linear regression can produce misleading slopes**. Non-parametric tests (**Mann-Kendall test** and **Sen's slope estimator**) are the scientifically rigorous standard for precipitation trend analysis.
