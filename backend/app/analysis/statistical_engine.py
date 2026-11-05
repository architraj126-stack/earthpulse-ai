import math
import numpy as np
import pandas as pd
from scipy import stats
import pymannkendall as mk
from typing import Dict, Any, Optional, Tuple, List

from app.schemas.models import (
    LinearRegressionResult,
    MannKendallResult,
    SeasonalMannKendallResult,
    AutocorrelationResult,
    PettittResult,
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
    
    start_time = clean_df["date"].min()
    clean_df["decimal_years"] = (clean_df["date"] - start_time).dt.total_seconds() / (365.25 * 86400.0)
    
    x = clean_df["decimal_years"].values
    y = clean_df["value"].values
    
    res = stats.linregress(x, y)
    n = len(x)
    
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
    if len(clean_df) < 24:
        return None
    
    try:
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
        x = np.arange(len(vals))
        res = stats.theilslopes(vals, x)
        base_slope = float(res[0])
    
    if frequency == "daily":
        annual_slope = base_slope * 365.25
    elif frequency == "monthly":
        annual_slope = base_slope * 12.0
    else:
        annual_slope = base_slope
        
    return round(annual_slope, 4)

def compute_autocorrelation(vals_or_df: Any, base_mk: Optional[MannKendallResult] = None) -> AutocorrelationResult:
    """
    Computes lag-1 autocorrelation (r1) and performs autocorrelation-adjusted Mann-Kendall test (Hamed-Rao / Yue-Pilon).
    Accepts either (vals, base_mk) or a pandas DataFrame.
    """
    if isinstance(vals_or_df, pd.DataFrame):
        vals = vals_or_df["value"].values.astype(float)
        if base_mk is None:
            base_mk = compute_mann_kendall(vals_or_df)
    elif isinstance(vals_or_df, pd.Series):
        vals = vals_or_df.values.astype(float)
        if base_mk is None:
            tau, p_val = stats.kendalltau(np.arange(len(vals)), vals)
            base_mk = MannKendallResult(trend="increasing" if (p_val < 0.05 and tau > 0) else "no trend", p_value=float(p_val), z=0.0, tau=float(tau), s=0.0, var_s=0.0, h=bool(p_val < 0.05))
    else:
        vals = np.asarray(vals_or_df, dtype=float)
        if base_mk is None:
            clean_v = vals[~np.isnan(vals)]
            tau, p_val = stats.kendalltau(np.arange(len(clean_v)), clean_v)
            base_mk = MannKendallResult(trend="increasing" if (p_val < 0.05 and tau > 0) else "no trend", p_value=float(p_val), z=0.0, tau=float(tau), s=0.0, var_s=0.0, h=bool(p_val < 0.05))

    clean_vals = vals[~np.isnan(vals)]
    n = len(clean_vals)
    if n < 8:
        return AutocorrelationResult(
            lag1=0.0,
            is_significant=False,
            critical_value=0.5,
            adjusted_mk_p_value=base_mk.p_value,
            adjusted_mk_trend=base_mk.trend,
            explanation="Record too short to evaluate serial autocorrelation."
        )

    # Standard Pearson lag-1 correlation
    x_mean = np.mean(clean_vals)
    diff = clean_vals - x_mean
    denominator = np.sum(diff ** 2)
    if denominator <= 1e-12:
        return AutocorrelationResult(
            lag1=0.0,
            is_significant=False,
            critical_value=round(1.96 / np.sqrt(n), 3),
            adjusted_mk_p_value=base_mk.p_value,
            adjusted_mk_trend=base_mk.trend,
            explanation="Zero variance detected in time-series."
        )

    r1 = float(np.sum(diff[:-1] * diff[1:]) / denominator)
    crit_val = float(1.96 / np.sqrt(n))
    is_sig = bool(abs(r1) > crit_val)

    adj_p = base_mk.p_value
    adj_trend = base_mk.trend

    if is_sig:
        try:
            # Attempt pymannkendall Hamed-Rao or Yue-Pilon correlated test
            res = mk.hamed_rao_modification_test(clean_vals)
            adj_p = round(float(res.p), 6)
            adj_trend = str(res.trend)
        except Exception:
            try:
                res = mk.yue_pilon_modification_test(clean_vals)
                adj_p = round(float(res.p), 6)
                adj_trend = str(res.trend)
            except Exception:
                # Analytical variance inflation factor
                eta = max(1.0, 1.0 + (2.0 / n) * (n - 1) * max(0.0, r1))
                adj_var = base_mk.var_s * eta if base_mk.var_s > 0 else 1.0
                adj_z = base_mk.s / np.sqrt(adj_var)
                adj_p = round(float(2.0 * (1.0 - stats.norm.cdf(abs(adj_z)))), 6)
                adj_trend = "increasing" if (adj_p < 0.05 and base_mk.s > 0) else ("decreasing" if (adj_p < 0.05 and base_mk.s < 0) else "no trend")

    explanation = (
        f"Lag-1 serial correlation is {r1:+.3f} (critical threshold: ±{crit_val:.3f}). "
        + ("Significant autocorrelation detected; adjusted MK p-value accounts for persistence."
           if is_sig else "No significant autocorrelation detected; standard Mann-Kendall test is valid.")
    )

    return AutocorrelationResult(
        lag1=round(r1, 4),
        is_significant=is_sig,
        critical_value=round(crit_val, 4),
        adjusted_mk_p_value=adj_p,
        adjusted_mk_trend=adj_trend,
        explanation=explanation
    )

def compute_pettitt_test(dates_or_df: Any, vals: Optional[np.ndarray] = None) -> Optional[PettittResult]:
    """
    Implements Pettitt's non-parametric rank test (Pettitt, 1979) for single change-point detection in central tendency.
    Accepts either (dates, vals) or a pandas DataFrame.
    """
    if isinstance(dates_or_df, pd.DataFrame):
        clean_df = dates_or_df.dropna(subset=["date", "value"]).copy()
        dates = pd.to_datetime(clean_df["date"]).reset_index(drop=True)
        vals = clean_df["value"].values.astype(float)
    else:
        dates = pd.to_datetime(dates_or_df).reset_index(drop=True) if isinstance(dates_or_df, pd.Series) else pd.to_datetime(pd.Series(dates_or_df))
        if vals is None:
            vals = dates.values.astype(float)

    clean_mask = ~np.isnan(vals)
    clean_vals = vals[clean_mask]
    clean_dates = dates[clean_mask].reset_index(drop=True)
    n = len(clean_vals)
    if n < 10:
        return None

    # Calculate ranks
    ranked = stats.rankdata(clean_vals)
    # U_t = 2 * sum(ranked[:t]) - t * (n + 1)
    cum_ranks = np.cumsum(ranked)
    t_vals = np.arange(1, n + 1)
    u_vals = 2 * cum_ranks - t_vals * (n + 1)

    # Change point is at max absolute U
    k_stat = np.max(np.abs(u_vals[:-1]))
    tau_idx = int(np.argmax(np.abs(u_vals[:-1])))

    # Approximate two-tailed p-value: p = 2 * exp(-6 * K^2 / (n^3 + n^2))
    exponent = -6.0 * (k_stat ** 2) / (float(n) ** 3 + float(n) ** 2)
    p_val = float(2.0 * np.exp(exponent))
    p_val = min(1.0, max(0.0, p_val))

    cp_date = clean_dates.iloc[tau_idx].strftime("%Y-%m-%d")
    cp_year = int(clean_dates.iloc[tau_idx].year)

    return PettittResult(
        change_point_index=tau_idx,
        change_point_date=cp_date,
        change_point_year=cp_year,
        k_statistic=round(float(k_stat), 2),
        p_value=round(p_val, 5),
        is_significant=bool(p_val < 0.05)
    )

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

def build_executive_headline(
    variable_name: str,
    location_name: str,
    start_year: str,
    end_year: str,
    trend_dir: str,
    is_sig: bool,
    slope_per_decade: float,
    unit: str,
    p_val: float
) -> str:
    """
    Constructs a crisp, one-sentence plain English executive headline.
    """
    if is_sig:
        action = "increased" if trend_dir == "increasing" else "decreased"
        return (
            f"Between {start_year} and {end_year}, {variable_name} in {location_name} {action} "
            f"at a statistically significant rate of {slope_per_decade:+.2f} {unit}/decade (Mann-Kendall p = {p_val:.4f})."
        )
    else:
        return (
            f"Between {start_year} and {end_year}, {variable_name} in {location_name} showed no statistically significant "
            f"monotonic trend (rate: {slope_per_decade:+.2f} {unit}/decade, p = {p_val:.4f} ≥ 0.05)."
        )

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
    Generates a scientific narrative grounded in statistical evidence and Earth systems science.
    """
    period_str = f"{start_date[:4]} to {end_date[:4]}"
    
    if is_significant:
        significance_narrative = (
            f"The observed {trend_direction} trend was **detected as statistically significant** (Mann-Kendall p-value = {p_value:.5f} < 0.05). "
            f"This indicates that the directional shift in {variable_name.lower()} over {period_str} "
            f"is unlikely to be explained solely by random multi-year weather noise under the null hypothesis."
        )
    else:
        significance_narrative = (
            f"The data shows **no statistically significant monotonic trend** (Mann-Kendall p-value = {p_value:.5f} ≥ 0.05). "
            f"While calculated slopes indicate a nominal rate of {sens_slope:+.4f} {unit}/year, the observed variation cannot be "
            f"distinguished from natural multi-year sampling variability at the 95% confidence level."
        )

    rate_text = (
        f"The non-parametric Sen's slope estimator calculates a rate of change of **{sens_slope * 10:+.3f} {unit}/decade** "
        f"({sens_slope:+.4f} {unit}/year). Ordinary Least Squares linear regression indicates {ols_slope * 10:+.3f} {unit}/decade "
        f"with an R² of {r_squared:.3f}."
    )

    context = ""
    if "temperature" in variable_name.lower():
        if is_significant and trend_direction == "increasing":
            context = (
                f"For {location_name}, this warming trajectory aligns with regional energy balance adjustments. "
                "Near-surface warming is modulated by sensible heat fluxes, decreased vegetative evapotranspiration, and long-term greenhouse gas forcing."
            )
        else:
            context = f"Temperature observations in {location_name} reflect balanced regional energy fluxes across the analyzed window."
    elif "precipitation" in variable_name.lower():
        context = (
            f"Precipitation patterns in {location_name} are governed by regional synoptic monsoons and moisture advection. "
            "Under the Clausius-Clapeyron relation, a warmer atmosphere holds ~7% more water vapor per 1°C, "
            "frequently intensifying extreme convective rainbursts even when long-term total volume shows no monotonic trend."
        )
    elif "humidity" in variable_name.lower():
        context = (
            f"Relative humidity trends in {location_name} capture saturation deficit. "
            "In warming urban or continental areas, relative humidity can decline even when specific humidity increases, because warming elevates saturation vapor pressure."
        )
    elif "wind" in variable_name.lower():
        context = (
            f"Near-surface wind speeds in {location_name} describe aerodynamic boundary-layer flow and synoptic pressure gradients. "
            "Literature documents multi-decadal terrestrial stilling followed in some regions by cyclical ocean-atmosphere recovery."
        )
    else:
        context = f"Observations at {location_name} capture key surface boundary layer interactions across the analyzed timeframe."

    full_explanation = f"{significance_narrative}\n\n{rate_text}\n\n{context}"
    
    limitations = (
        "Methodology & Limitations:\n"
        "1. Grid-scale representation: NASA POWER / MERRA-2 data represents approximately a 0.5° x 0.625° (~50 km) grid cell average.\n"
        "2. Statistical detection vs. attribution: Trend significance demonstrates mathematical detection, not single-factor cause (e.g., local land-use change vs. global greenhouse forcing).\n"
        "3. Serial correlation: Autocorrelation tests check for lag-1 persistence."
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
    Executes full statistical pipeline: OLS, Mann-Kendall, Sen's slope, Seasonal MK,
    Autocorrelation check, Pettitt change-point test, and executive headline.
    """
    ols_res = compute_linear_regression(df, frequency)
    mk_res = compute_mann_kendall(df)
    smk_res = compute_seasonal_mann_kendall(df, frequency)
    sens_slope = compute_sens_slope(df, frequency)
    
    clean_vals = df["value"].dropna().values
    clean_dates = df.loc[df["value"].notna(), "date"]
    
    # 1. Autocorrelation Check & Adjusted MK
    autocorr_res = compute_autocorrelation(clean_vals, mk_res)
    
    # 2. Pettitt Change-Point Test
    pettitt_res = compute_pettitt_test(clean_dates, clean_vals)
    
    is_sig, trend_dir, status_col = assess_trend_and_significance(ols_res, mk_res, sens_slope)
    
    var_name = variable_info.get("name", "Environmental Variable")
    unit_str = variable_info.get("unit_monthly", variable_info.get("unit", "")) if frequency == "monthly" else variable_info.get("unit", "")

    rate_per_decade = round(sens_slope * 10.0, 4)
    total_years = max(1.0, (pd.to_datetime(end_date) - pd.to_datetime(start_date)).days / 365.25)
    total_change = round(sens_slope * total_years, 3)

    headline = build_executive_headline(
        variable_name=var_name,
        location_name=location_name,
        start_year=start_date[:4],
        end_year=end_date[:4],
        trend_dir=trend_dir,
        is_sig=is_sig,
        slope_per_decade=rate_per_decade,
        unit=unit_str,
        p_val=mk_res.p_value
    )

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
        autocorrelation=autocorr_res,
        pettitt=pettitt_res,
        sens_slope_per_year=sens_slope,
        rate_per_decade=rate_per_decade,
        total_change=total_change,
        is_significant=is_sig,
        trend_direction=trend_dir,
        status_color=status_col,
        headline=headline,
        scientific_explanation=explanation,
        methodology_limitations=limitations,
        source=source,
        is_demonstration=is_demonstration
    )
