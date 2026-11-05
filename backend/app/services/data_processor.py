import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from app.schemas.models import (
    DataPoint, YearlyDataPoint, MonthlyVariationPoint, DataQuality, DataResponse
)

MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

def clean_and_process_timeseries(
    df: pd.DataFrame,
    variable: str,
    variable_info: Dict[str, Any],
    location: Dict[str, Any],
    start_date: str,
    end_date: str,
    frequency: str,
    source: str,
    is_demonstration: bool
) -> DataResponse:
    """
    Cleans raw observations, removes duplicate timestamps, calculates missing stats,
    computes annual averages, and extracts monthly climatological profiles.
    """
    df = df.copy()
    
    # 1. Date conversion & duplicate drop
    df["date"] = pd.to_datetime(df["date"])
    df = df.drop_duplicates(subset=["date"]).sort_values("date").reset_index(drop=True)
    
    # 2. Numerical conversion
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    
    # 3. Data quality checks
    total_obs = len(df)
    missing_count = int(df["value"].isna().sum())
    valid_count = total_obs - missing_count
    missing_pct = round((missing_count / total_obs * 100.0) if total_obs > 0 else 0.0, 2)
    
    date_cov_str = f"{df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}" if total_obs > 0 else "N/A"
    
    data_quality = DataQuality(
        total_observations=total_obs,
        valid_observations=valid_count,
        missing_count=missing_count,
        missing_percentage=missing_pct,
        date_range_covered=date_cov_str
    )
    
    # 4. Standard time series data points
    time_series: List[DataPoint] = []
    for _, row in df.iterrows():
        val = None if pd.isna(row["value"]) else round(float(row["value"]), 2)
        time_series.append(DataPoint(
            date=row["date"].strftime("%Y-%m-%d"),
            value=val
        ))

    # 5. Yearly averages
    df["year"] = df["date"].dt.year
    yearly_records = []
    for year, group in df.groupby("year"):
        valid_vals = group["value"].dropna()
        if len(valid_vals) > 0:
            yearly_records.append(YearlyDataPoint(
                year=int(year),
                mean_value=round(float(valid_vals.mean()), 2),
                min_value=round(float(valid_vals.min()), 2),
                max_value=round(float(valid_vals.max()), 2),
                count=int(len(valid_vals))
            ))

    # 6. Monthly seasonal variation profile
    df["month"] = df["date"].dt.month
    monthly_records = []
    for m in range(1, 13):
        m_group = df[df["month"] == m]["value"].dropna()
        if len(m_group) > 0:
            monthly_records.append(MonthlyVariationPoint(
                month=m,
                month_name=MONTH_NAMES[m - 1],
                mean_value=round(float(m_group.mean()), 2),
                std_dev=round(float(m_group.std()) if len(m_group) > 1 else 0.0, 2)
            ))
        else:
            monthly_records.append(MonthlyVariationPoint(
                month=m,
                month_name=MONTH_NAMES[m - 1],
                mean_value=0.0,
                std_dev=0.0
            ))

    unit_str = variable_info.get("unit_monthly", variable_info.get("unit", "")) if frequency == "monthly" else variable_info.get("unit", "")

    return DataResponse(
        variable=variable,
        variable_name=variable_info.get("name", variable),
        unit=unit_str,
        location=location,
        date_range={"start": start_date, "end": end_date},
        frequency=frequency,
        source=source,
        is_demonstration=is_demonstration,
        data_quality=data_quality,
        time_series=time_series,
        yearly_averages=yearly_records,
        monthly_variation=monthly_records
    )
