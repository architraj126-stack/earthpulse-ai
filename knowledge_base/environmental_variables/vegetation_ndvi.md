# Environmental Variable: Normalized Difference Vegetation Index (NDVI)

## Parameter Identification
- **Standard Code**: `NDVI`
- **Full Name**: Normalized Difference Vegetation Index
- **Unit of Measurement**: Unitless (Index bounded between -1.0 and +1.0)
- **Primary NASA Source**: NASA MODIS (MOD13A2 / MYD13A2), VIIRS, Landsat
- **Temporal Resolution**: 16-Day Composite, Monthly

## Scientific Definition & Formula
Healthy photosynthetic vegetation absorbs photosynthetically active radiation (PAR, red light ~0.66 µm) via chlorophyll $a$ and $b$, and strongly scatters near-infrared radiation (NIR ~0.86 µm) through the spongy mesophyll internal leaf structure:
$$NDVI = \frac{\rho_{\text{NIR}} - \rho_{\text{Red}}}{\rho_{\text{NIR}} + \rho_{\text{Red}}}$$
Where:
- $\rho_{\text{NIR}}$ is surface reflectance in the near-infrared band (MODIS Band 2).
- $\rho_{\text{Red}}$ is surface reflectance in the red band (MODIS Band 1).

## Scale & Interpretation
- **< 0.0**: Water bodies, snow, ice, and deep cloud cover.
- **0.0 to 0.15**: Bare soil, sand, rocks, and urban concrete impervious surfaces.
- **0.2 to 0.4**: Sparse shrublands, grasslands, and agricultural fallow.
- **0.5 to 0.7**: Moderate vegetation, cropland in peak growth, temperate forests.
- **0.8 to 0.9**: Dense canopy cover, tropical rainforests, dense agricultural monocultures.

## Environmental Trends & Applications
- **Global Greening vs. Browning**: Satellite time-series (1982–present) demonstrate significant greening across vast high-latitude and agricultural regions (driven by CO₂ fertilization, extended growing seasons, and intensive irrigation), contrasted with regional browning in drought-stricken biomes.
- **Drought Monitoring**: Vegetation Condition Index (VCI) anomalies identify agricultural drought onset before hydrological indicators react.

---
**Source Reference:** [https://lpdaac.usgs.gov/products/mod13a2v006/](https://lpdaac.usgs.gov/products/mod13a2v006/)
