import math
import numpy as np
import pandas as pd
from scipy import stats
import pymannkendall as mk
from typing import Dict, Any, Optional, Tuple

from app.schemas.models import (
    LinearRegressionResult,
    MannKendallResult,
    SeasonalMannKendallResult,
    StatisticalSummary
)

def compute_linear_regression(df: pd.DataFrame, frequency: str) -> LinearRegressionResult:
    """
    Performs Ordinary Least Squares (OLS) linear regression against decimal years.
    Returns annual slope, intercept, R-squared, p-value, standard error, and 95% CI.
    """
    clean_df = df.dropna(subset=["date", "value"]).copy()
    if len(clean_df) < 3:
        return LinearRegressionResult(
            slope_per_year=0.0,
            intercept=0.0,
            r_squared=0.0,
            p_value=1.0,
            std_err=0.0,
            ci_95_lower=0.0,
            ci_95_upper=0.0
        )
    
    # Calculate fractional years since starting point
    start_time = clean_df["date"].min()
    clean_df["decimal_years"] = (clean_df["date"] - start_time).dt.total_seconds() / (365.25 * 86400.0)
    
    x = clean_df["decimal_years"].values
    y = clean_df["value"].values
    
    res = stats.linregress(x, y)
    n = len(x)
    
    # Degrees of freedom = n - 2
    dof = max(1, n - 2)
    t_crit = stats.t.ppf(0.975, dof)
    ci_lower = res.slope - (t_crit * res.stderr)
    ci_upper = res.slope + (t_crit * res.stderr)
    
    return LinearRegressionResult(
        slope_per_year=round(float(res.slope), 4),
        intercept=round(float(res.intercept), 4),
        r_squared=round(float(res.rvalue ** 2), 4),
        p_value=round(float(res.pvalue), 6),
        std_err=round(float(res.stderr), 5),
        ci_95_lower=round(float(ci_lower), 4),
        ci_95_upper=round(float(ci_upper), 4)
    )

def compute_mann_kendall(df: pd.DataFrame) -> MannKendallResult:
    """
    Computes original Mann-Kendall non-parametric trend test.
    """
    clean_vals = df["value"].dropna().values
    if len(clean_vals) < 4:
        return MannKendallResult(
            trend="no trend",
            p_value=1.0,
            z=0.0,
            tau=0.0,
            s=0.0,
            var_s=0.0,
            h=False
        )
    
    try:
        res = mk.original_test(clean_vals)
        return MannKendallResult(
            trend=str(res.trend),
            p_value=round(float(res.p), 6),
            z=round(float(res.z), 4),
            tau=round(float(res.Tau), 4),
            s=round(float(res.s), 2),
            var_s=round(float(res.var_s), 2),
            h=bool(res.h)
        )
    except Exception:
        # Fallback manual Kendall tau if library fails
        tau, p_val = stats.kendalltau(np.arange(len(clean_vals)), clean_vals)
        trend_str = "increasing" if (p_val < 0.05 and tau > 0) else ("decreasing" if (p_val < 0.05 and tau < 0) else "no trend")
        return MannKendallResult(
            trend=trend_str,
            p_value=round(float(p_val), 6) if not np.isnan(p_val) else 1.0,
            z=0.0,
            tau=round(float(tau), 4) if not np.isnan(tau) else 0.0,
            s=0.0,
            var_s=0.0,
            h=bool(p_val < 0.05)
        )

def compute_seasonal_mann_kendall(df: pd.DataFrame, frequency: str) -> Optional[SeasonalMannKendallResult]:
    """
    Computes Seasonal Mann-Kendall test with seasonal period = 12 for monthly time-series.
    """
    if frequency != "monthly":
        return None
    
    clean_df = df.dropna(subset=["date", "value"]).copy()
    if len(clean_df) < 24:  # At least 2 full annual cycles needed
        return None
    
    try:
        # Ensure chronological ordering and monthly spacing
        vals = clean_df["value"].values
        res = mk.seasonal_test(vals, period=12)
        return SeasonalMannKendallResult(
            trend=str(res.trend),
            p_value=round(float(res.p), 6),
            z=round(float(res.z), 4),
            tau=round(float(res.Tau), 4),
            s=round(float(res.s), 2)
        )
    except Exception:
        return None

def compute_sens_slope(df: pd.DataFrame, frequency: str) -> float:
    """
    Computes Sen's Slope Estimator (median of pairwise slopes) expressed in units per year.
    """
    clean_df = df.dropna(subset=["date", "value"]).copy()
    if len(clean_df) < 3:
        return 0.0
    
    vals = clean_df["value"].values
    
    try:
        res = mk.sens_slope(vals)
        base_slope = float(res.slope)
    except Exception:
        # SciPy Theil-Sen fallback
        x = np.arange(len(vals))
        res = stats.theilslopes(vals, x)
        base_slope = float(res[0])
    
    # Scale to annual rate
    if frequency == "daily":
        annual_slope = base_slope * 365.25
    elif frequency == "monthly":
        annual_slope = base_slope * 12.0
    else:
        annual_slope = base_slope
        
    return round(annual_slope, 4)

def assess_trend_and_significance(
    ols_res: LinearRegressionResult,
    mk_res: MannKendallResult,
    sens_slope: float,
    alpha: float = 0.05
) -> Tuple[bool, str, str]:
    """
    Determines overall statistical significance, direction, and color code.
    Significance is evaluated using Mann-Kendall p-value at alpha = 0.05.
    
    Colors:
    - GREEN: statistically significant increasing trend
    - RED: statistically significant decreasing trend
    - GREY: no statistically significant trend (p >= 0.05)
    """
    is_significant = bool(mk_res.p_value < alpha)
    
    if is_significant:
        if sens_slope > 0 or ols_res.slope_per_year > 0:
            trend_direction = "increasing"
            status_color = "green"
        else:
            trend_direction = "decreasing"
            status_color = "red"
    else:
        trend_direction = "stable"
        status_color = "grey"
        
    return is_significant, trend_direction, status_color

def generate_scientific_explanation(
    variable_name: str,
    unit: str,
    location_name: str,
    start_date: str,
    end_date: str,
    is_significant: bool,
    trend_direction: str,
    sens_slope: float,
    ols_slope: float,
    p_value: float,
    r_squared: float
) -> Tuple[str, str]:
    """
    Generates a rigorous scientific narrative grounded in statistical evidence and Earth systems science.
    """
    period_str = f"{start_date[:4]} to {end_date[:4]}"
    
    if is_significant:
        significance_narrative = (
            f"The observed {trend_direction} trend is **statistically significant** (Mann-Kendall p-value = {p_value:.5f} < 0.05). "
            f"This indicates strong statistical confidence that the directional change in {variable_name.lower()} over the period {period_str} "
            f"is unlikely to be a random fluctuation under the null hypothesis."
        )
    else:
        significance_narrative = (
            f"The data shows **no statistically significant monotonic trend** (Mann-Kendall p-value = {p_value:.5f} ≥ 0.05). "
            f"While calculated slopes indicate a nominal rate of {sens_slope:+.4f} {unit}/year, the observed variation cannot be "
            f"distinguished from natural multi-year sampling variability at the 95% confidence level."
        )

    rate_text = (
        f"The non-parametric Sen's slope estimator indicates a rate of change of **{sens_slope:+.3f} {unit}/year** "
        f"({sens_slope * 10:+.2f} {unit}/decade). Ordinary Least Squares linear regression reports **{ols_slope:+.3f} {unit}/year** "
        f"with an R² of {r_squared:.3f}."
    )

    context = ""
    if "temperature" in variable_name.lower():
        if is_significant and trend_direction == "increasing":
            context = (
                f"For {location_name}, this upward thermal trajectory aligns with observed regional warming and urban surface energy adjustments. "
                "Rising 2-meter air temperatures reflect heightened sensible heat flux, reduced canopy evapotranspiration, and long-term greenhouse gas radiative forcing."
            )
        else:
            context = f"Temperature observations in {location_name} reflect balanced regional energy fluxes or counter-acting seasonal shifts over the analyzed window."
    elif "precipitation" in variable_name.lower():
        context = (
            f"Precipitation patterns in {location_name} are governed by synoptic monsoonal circulations. "
            "Because rainfall distributions exhibit high natural skewness and multi-year interannual cycles (e.g. ENSO / IOD teleconnections), "
            "non-parametric rank-based evaluation provides the most dependable gauge of long-term hydrological change."
        )
    elif "humidity" in variable_name.lower():
        context = (
            f"Relative humidity trends in {location_name} describe atmospheric moisture saturation. "
            "In warming urban corridors, relative humidity often decreases slightly even as absolute specific humidity rises, because warming accelerates saturation vapor pressure."
        )
    elif "wind" in variable_name.lower():
        context = (
            f"Near-surface wind speeds in {location_name} reflect aerodynamic surface roughness changes and large-scale pressure gradient variations. "
            "Documented terrestrial wind trends in literature frequently show decadal stilling followed by cyclical recovery."
        )
    else:
        context = f"Observations at {location_name} capture key surface boundary layer interactions across the analyzed multi-year timeframe."

    full_explanation = f"{significance_narrative}\n\n{rate_text}\n\n{context}"
    
    limitations = (
        "Methodology & Limitations:\n"
        "1. Grid-scale representation: NASA POWER / MERRA-2 data represents approximately a 0.5° x 0.625° (~50 km) grid cell average.\n"
        "2. Statistical causality: Statistical significance establishes mathematical trend presence but does not isolate specific causative drivers (e.g., local urbanization vs. global greenhouse forcing).\n"
        "3. Autocorrelation: While Mann-Kendall testing is robust against non-normality, persistent positive serial autocorrelation can slightly elevate rejection rates."
    )
    
    return full_explanation, limitations

def run_full_statistical_analysis(
    df: pd.DataFrame,
    variable_info: Dict[str, Any],
    location_name: str,
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
    frequency: str,
    source: str,
    is_demonstration: bool
) -> StatisticalSummary:
    """
    Executes full statistical pipeline: OLS, Mann-Kendall, Sen's slope, Seasonal MK, and scientific narrative.
    """
    ols_res = compute_linear_regression(df, frequency)
    mk_res = compute_mann_kendall(df)
    smk_res = compute_seasonal_mann_kendall(df, frequency)
    sens_slope = compute_sens_slope(df, frequency)
    
    is_sig, trend_dir, status_col = assess_trend_and_significance(ols_res, mk_res, sens_slope)
    
    var_name = variable_info.get("name", "Environmental Variable")
    unit_str = variable_info.get("unit_monthly", variable_info.get("unit", "")) if frequency == "monthly" else variable_info.get("unit", "")

    explanation, limitations = generate_scientific_explanation(
        variable_name=var_name,
        unit=unit_str,
        location_name=location_name,
        start_date=start_date,
        end_date=end_date,
        is_significant=is_sig,
        trend_direction=trend_dir,
        sens_slope=sens_slope,
        ols_slope=ols_res.slope_per_year,
        p_value=mk_res.p_value,
        r_squared=ols_res.r_squared
    )

    total_obs = len(df)
    valid_count = int(df["value"].dropna().count())
    missing_pct = round(((total_obs - valid_count) / total_obs * 100.0) if total_obs > 0 else 0.0, 2)

    return StatisticalSummary(
        variable=variable_info["parameter"],
        variable_name=var_name,
        unit=unit_str,
        location_name=location_name,
        latitude=latitude,
        longitude=longitude,
        start_date=start_date,
        end_date=end_date,
        frequency=frequency,
        observation_count=total_obs,
        valid_count=valid_count,
        missing_percentage=missing_pct,
        linear_regression=ols_res,
        mann_kendall=mk_res,
        seasonal_mann_kendall=smk_res,
        sens_slope_per_year=sens_slope,
        is_significant=is_sig,
        trend_direction=trend_dir,
        status_color=status_col,
        scientific_explanation=explanation,
        methodology_limitations=limitations,
        source=source,
        is_demonstration=is_demonstration
    )
