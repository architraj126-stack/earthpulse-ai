from pydantic import BaseModel, Field
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
    data_quality: DataQuality
    time_series: List[DataPoint]
    yearly_averages: List[YearlyDataPoint]
    monthly_variation: List[MonthlyVariationPoint]

class AnalyzeRequest(BaseModel):
    latitude: float = 12.9716
    longitude: float = 77.5946
    location_name: str = "Bengaluru, Karnataka"
    variable: str = "T2M"
    start_date: str = "2000-01-01"
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
    sens_slope_per_year: float
    is_significant: bool
    trend_direction: str
    status_color: str
    scientific_explanation: str
    methodology_limitations: str
    source: str
    is_demonstration: bool

class AnalyzeResponse(BaseModel):
    summary: StatisticalSummary
    data: DataResponse

class CompareRequest(BaseModel):
    location_a: LocationInput
    location_b: LocationInput
    variable: str = "T2M"
    start_date: str = "2000-01-01"
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
    narrative: str
    is_demonstration: bool

class AskQuestionRequest(BaseModel):
    question: str
    current_analysis: Optional[Dict[str, Any]] = None

class AskQuestionResponse(BaseModel):
    question: str
    answer: str
    statistical_observation: str
    scientific_context: str
    sources_and_citations: List[Dict[str, str]]
    related_variables: List[str]
