# Environmental Variable: Relative Humidity at 2 Metres (RH2M)

## Parameter Identification
- **Standard Code**: `RH2M`
- **Full Name**: Relative Humidity at 2 Metres Above Surface
- **Unit of Measurement**: Percentage (%)
- **Primary NASA Source**: NASA POWER (derived from MERRA-2 T2M and QV2M)
- **Temporal Resolution**: Hourly, Daily, Monthly, Climatology

## Scientific Definition & Formula
Relative humidity is the ratio (expressed as a percentage) of the actual partial pressure of water vapor in the air ($e$) to the saturation vapor pressure ($e_s(T)$) at the same temperature and pressure:
$$RH = \frac{e}{e_s(T)} \times 100\%$$
Where saturation vapor pressure is described by the Tetens or Goff-Gratch formulations of the Clausius-Clapeyron equation:
$$e_s(T) \approx 0.61078 \exp\left(\frac{17.27 T}{T + 237.3}\right) \text{ kPa}$$

## Environmental Significance
- **Human Heat Stress & Wet-Bulb Temperature**: High temperature coupled with high relative humidity impairs human evaporative perspiration cooling, elevating the heat index and lethal wet-bulb temperature ($T_w$) thresholds.
- **Fire Weather & Evaporation**: Low relative humidity (< 30%) desiccates forest fuel loads and topsoil, escalating wildfire vulnerability.
- **Atmospheric Drying vs. Specific Humidity**: In many warming continental interiors, specific humidity (absolute water vapor mass) increases, yet relative humidity decreases because atmospheric warming increases $e_s(T)$ faster than moisture is replenished from dry land surfaces.

---
**Source Reference:** [https://power.larc.nasa.gov/docs/methodology/meteorology/humidity/](https://power.larc.nasa.gov/docs/methodology/meteorology/humidity/)
