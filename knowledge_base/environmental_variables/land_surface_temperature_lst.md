# Environmental Variable: Land Surface Temperature (LST)

## Parameter Identification
- **Standard Code**: `LST` / `TS`
- **Full Name**: Land Surface Skin Temperature
- **Unit of Measurement**: Degrees Celsius (°C) or Kelvin (K)
- **Primary NASA Sources**: MODIS (MOD11A2 / MYD11A2), VIIRS, MERRA-2 (`TS`)
- **Temporal Resolution**: Daily, 8-Day, Monthly

## Scientific Definition vs. Air Temperature (T2M)
Land Surface Temperature represents the thermodynamic temperature of the outermost skin layer of the Earth's surface (the top millimeters of bare soil, vegetation canopy top, or asphalt rooftop) radiating thermal infrared energy upward. It is governed by the surface energy balance:
$$R_n = H + \lambda E + G$$
where $R_n$ is net radiation, $H$ is sensible heat flux, $\lambda E$ is latent heat flux, and $G$ is ground soil heat flux.

In contrast, **T2M** is the temperature of the air mixed by turbulence at 2 metres above the surface. During sunny summer days, LST over asphalt or bare dry soil can exceed T2M by 10°C to 25°C. At night under clear skies, radiative cooling can cause LST to drop below T2M (surface temperature inversion).

## Environmental Significance
- **Surface Urban Heat Island (SUHI)**: Satellite thermal sensors map thermal anomalies across metropolitan areas, exposing heat vulnerability disparities.
- **Evapotranspiration Estimation**: Used in energy balance models (such as SEBAL and METRIC) to estimate field-scale agricultural water consumption.
