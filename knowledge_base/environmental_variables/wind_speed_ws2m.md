# Environmental Variable: Wind Speed at 2 Metres (WS2M)

## Parameter Identification
- **Standard Code**: `WS2M`
- **Full Name**: Wind Speed at 2 Metres Above Ground Level
- **Unit of Measurement**: Metres per second (m/s)
- **Primary NASA Source**: NASA POWER (derived from MERRA-2 boundary layer aerodynamics)
- **Temporal Resolution**: Hourly, Daily, Monthly, Climatology

## Scientific Definition & Formula
Wind speed is the magnitude of horizontal air movement across the Earth's surface:
$$WS = \sqrt{u^2 + v^2}$$
where $u$ is the zonal (east-west) wind component and $v$ is the meridional (north-south) wind component.
Because atmospheric wind speeds vary with height according to the logarithmic planetary boundary layer profile:
$$u(z) = \frac{u_*}{\kappa} \ln\left(\frac{z - d}{z_0}\right)$$
NASA POWER computes `WS2M` from model 10-meter wind vectors by scaling down using the local surface roughness length ($z_0$) and zero-plane displacement ($d$).

## Environmental Significance
- **Global Stilling & Reversal**: Multiple climatological studies document terrestrial "stilling" (decreased near-surface wind speeds) during 1980–2010, followed in some regions by post-2010 recovery, linked to changes in large-scale ocean-atmospheric circulation and surface roughness growth.
- **Atmospheric Dispersion**: Lower wind speeds reduce boundary-layer ventilation, exacerbating urban particulate pollution ($PM_{2.5}$) trapping during winter inversions.
- **Renewable Energy & Evaporation**: Key factor for small wind power assessment and Penman-Monteith potential evapotranspiration.
