from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Dict, Any

class VariableInfo(BaseModel):
    parameter: str
    name: str
    short_name: str
    unit: str
    definition: str
    source: str
    temporal_resolutions: List[str]
    scientific_context: str
    category: str

class LocationInput(BaseModel):
    name: str = "Bengaluru, Karnataka"
    latitude: float = 12.9716
    longitude: float = 77.5946

class DataPoint(BaseModel):
    date: str
    value: Optional[float]
    trend_value: Optional[float] = None
    anomaly_value: Optional[float] = None
    ci_lower: Optional[float] = None
    ci_upper: Optional[float] = None

class YearlyDataPoint(BaseModel):
    year: int
    mean_value: float
    min_value: float
    max_value: float
    count: int

class MonthlyVariationPoint(BaseModel):
    month: int
    month_name: str
    mean_value: float
    std_dev: float

class DataQuality(BaseModel):
    total_observations: int
    valid_observations: int
    missing_count: int
    missing_percentage: float
    date_range_covered: str

class DataResponse(BaseModel):
    variable: str
    variable_name: str
    unit: str
    location: Dict[str, Any]
    date_range: Dict[str, str]
    frequency: str
    source: str
    is_demonstration: bool
    is_ocean: Optional[bool] = False
    ocean_advisory: Optional[str] = ''
    data_quality: DataQuality
    time_series: List[DataPoint]
    yearly_averages: List[YearlyDataPoint]
    monthly_variation: List[MonthlyVariationPoint]

class AnalyzeRequest(BaseModel):
    latitude: float = 12.9716
    longitude: float = 77.5946
    location_name: str = "Bengaluru, Karnataka"
    variable: str = "T2M"
    start_date: str = "1990-01-01"
    end_date: str = "2023-12-31"
    frequency: str = "monthly"

class LinearRegressionResult(BaseModel):
    slope_per_year: float
    intercept: float
    r_squared: float
    p_value: float
    std_err: float
    ci_95_lower: float
    ci_95_upper: float

class MannKendallResult(BaseModel):
    trend: str
    p_value: float
    z: float
    tau: float
    s: float
    var_s: float
    h: bool

class SeasonalMannKendallResult(BaseModel):
    trend: str
    p_value: float
    z: float
    tau: float
    s: float

class AutocorrelationResult(BaseModel):
    lag1: float
    lag1_autocorrelation: Optional[float] = None
    is_significant: bool
    critical_value: float
    adjusted_mk_p_value: Optional[float] = None
    adjusted_mk_trend: Optional[str] = None
    explanation: str = ""

    @model_validator(mode="before")
    @classmethod
    def populate_lag1(cls, values: Any) -> Any:
        if isinstance(values, dict):
            v = values.get("lag1")
            if v is None:
                v = values.get("lag1_autocorrelation", 0.0)
            values["lag1"] = v
            values["lag1_autocorrelation"] = v
        return values

class PettittResult(BaseModel):
    change_point_index: Optional[int] = None
    change_point_date: Optional[str] = None
    change_point_year: Optional[int] = None
    k_statistic: Optional[float] = None
    p_value: Optional[float] = None
    is_significant: bool = False

class StatisticalSummary(BaseModel):
    variable: str
    variable_name: str
    unit: str
    location_name: str
    latitude: float
    longitude: float
    start_date: str
    end_date: str
    frequency: str
    observation_count: int
    valid_count: int
    missing_percentage: float
    linear_regression: LinearRegressionResult
    mann_kendall: MannKendallResult
    seasonal_mann_kendall: Optional[SeasonalMannKendallResult] = None
    autocorrelation: Optional[AutocorrelationResult] = None
    pettitt: Optional[PettittResult] = None
    sens_slope_per_year: float
    rate_per_decade: float
    total_change: float
    is_significant: bool
    trend_direction: str
    status_color: str
    headline: str
    scientific_explanation: str
    methodology_limitations: str
    source: str
    is_demonstration: bool
    is_ocean: Optional[bool] = False
    ocean_advisory: Optional[str] = ''

class AnalyzeResponse(BaseModel):
    summary: StatisticalSummary
    data: DataResponse

class CompareRequest(BaseModel):
    location_a: LocationInput
    location_b: LocationInput
    variable: str = "T2M"
    start_date: str = "1990-01-01"
    end_date: str = "2023-12-31"
    frequency: str = "monthly"

class CompareResponse(BaseModel):
    variable: str
    variable_name: str
    unit: str
    location_a: StatisticalSummary
    location_b: StatisticalSummary
    comparison_time_series: List[Dict[str, Any]]
    slope_difference_per_year: float
    higher_warming_location: Optional[str]
    diverging_trends: bool
    narrative: str
    is_demonstration: bool

class AskQuestionRequest(BaseModel):
    question: str
    current_analysis: Optional[Dict[str, Any]] = None
    chat_history: Optional[List[Dict[str, str]]] = None

class AskQuestionResponse(BaseModel):
    question: str
    answer: str
    what_data_shows: str
    what_it_means: str
    sources_text: str
    sources_and_citations: List[Dict[str, str]]
    related_variables: List[str]
    intent: Optional[str] = None

class AtlasCell(BaseModel):
    latitude: float
    longitude: float
    variable: Optional[str] = None
    location_name: Optional[str] = None
    mean_climatology: Optional[float] = None
    mean_value: Optional[float] = None
    sen_slope_per_decade: Optional[float] = None
    sens_slope_per_decade: Optional[float] = None
    p_value: float
    is_significant: bool
    trend_direction: str

    @model_validator(mode="before")
    @classmethod
    def unify_slope(cls, values: Any) -> Any:
        if isinstance(values, dict):
            slope = values.get("sens_slope_per_decade")
            if slope is None:
                slope = values.get("sen_slope_per_decade", 0.0)
            values["sens_slope_per_decade"] = slope
            values["sen_slope_per_decade"] = slope
        return values

class AtlasResponse(BaseModel):
    variable: str
    variable_name: str
    unit: str
    period: Optional[str] = "1990-2023"
    start_year: Optional[int] = 1990
    end_year: Optional[int] = 2023
    source: Optional[str] = "NASA POWER MERRA-2 Climatological Reanalysis"
    grid_resolution_deg: float = 5.0
    total_cells: Optional[int] = None
    cell_count: Optional[int] = None
    cells: List[AtlasCell]
