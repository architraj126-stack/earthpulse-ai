import io
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
import pandas as pd
import numpy as np

from app.schemas.models import (
    VariableInfo,
    DataResponse,
    AnalyzeRequest,
    AnalyzeResponse,
    CompareRequest,
    CompareResponse,
    AskQuestionRequest,
    AskQuestionResponse,
    StatisticalSummary,
    AtlasCell,
    AtlasResponse
)
from app.services.nasa_service import (
    VARIABLES_REGISTRY,
    fetch_nasa_power_data
)
from app.services.data_processor import clean_and_process_timeseries
from app.analysis.statistical_engine import run_full_statistical_analysis
from app.services.ai_service import ask_earthpulse_ai, kb_index
from app.services.report_service import generate_pdf_report
from app.database.db import save_analysis, get_recent_analyses

router = APIRouter(prefix="/api", tags=["EarthPulse API"])
ATLAS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "atlas"

def load_atlas_file(variable: str) -> AtlasResponse:
    target_path = ATLAS_DIR / f"{variable}.json"
    if not target_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Atlas data for variable '{variable}' not found. Please run build_atlas.py."
        )
    try:
        with open(target_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return AtlasResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load atlas data: {str(e)}")

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "EarthPulse AI Backend",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "SQLite Connected",
        "knowledge_base_documents": len(kb_index.documents)
    }

@router.get("/variables", response_model=List[VariableInfo])
def get_variables():
    """Returns the list of supported NASA Earth Science environmental variables."""
    return list(VARIABLES_REGISTRY.values())

@router.get("/data", response_model=DataResponse)
def get_data(
    latitude: float = Query(12.9716, ge=-90.0, le=90.0),
    longitude: float = Query(77.5946, ge=-180.0, le=180.0),
    variable: str = Query("T2M"),
    start_date: str = Query("2000-01-01"),
    end_date: str = Query("2023-12-31"),
    frequency: str = Query("monthly"),
    location_name: str = Query("Bengaluru, Karnataka")
):
    """Retrieves and cleans NASA POWER data for a specific location and timeframe."""
    var_info = VARIABLES_REGISTRY.get(variable)
    if not var_info:
        raise HTTPException(status_code=400, detail=f"Variable '{variable}' not found.")

    try:
        df, is_demo, source_str, meta = fetch_nasa_power_data(
            latitude=latitude,
            longitude=longitude,
            parameter=variable,
            start_date=start_date,
            end_date=end_date,
            frequency=frequency
        )

        location_dict = {
            "name": location_name,
            "latitude": latitude,
            "longitude": longitude
        }

        data_resp = clean_and_process_timeseries(
            df=df,
            variable=variable,
            variable_info=var_info,
            location=location_dict,
            start_date=start_date,
            end_date=end_date,
            frequency=frequency,
            source=source_str,
            is_demonstration=is_demo
        )
        return data_resp

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process NASA data: {str(e)}")

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_timeseries(req: AnalyzeRequest):
    """
    Executes full statistical analysis: OLS linear regression, Mann-Kendall test,
    Sen's slope estimator, Seasonal Mann-Kendall, and AI explanation generation.
    """
    var_info = VARIABLES_REGISTRY.get(req.variable)
    if not var_info:
        raise HTTPException(status_code=400, detail=f"Unknown variable '{req.variable}'.")

    try:
        df, is_demo, source_str, meta = fetch_nasa_power_data(
            latitude=req.latitude,
            longitude=req.longitude,
            parameter=req.variable,
            start_date=req.start_date,
            end_date=req.end_date,
            frequency=req.frequency
        )

        location_dict = {
            "name": req.location_name,
            "latitude": req.latitude,
            "longitude": req.longitude
        }

        # 1. Clean and process
        data_resp = clean_and_process_timeseries(
            df=df,
            variable=req.variable,
            variable_info=var_info,
            location=location_dict,
            start_date=req.start_date,
            end_date=req.end_date,
            frequency=req.frequency,
            source=source_str,
            is_demonstration=is_demo
        )

        # 2. Run statistical engine
        summary = run_full_statistical_analysis(
            df=df,
            variable_info=var_info,
            location_name=req.location_name,
            latitude=req.latitude,
            longitude=req.longitude,
            start_date=req.start_date,
            end_date=req.end_date,
            frequency=req.frequency,
            source=source_str,
            is_demonstration=is_demo
        )

        # 3. Add trendline values to timeseries
        ols = summary.linear_regression
        start_time = df["date"].min()
        for pt in data_resp.time_series:
            pt_dt = pd.to_datetime(pt.date)
            years_elapsed = (pt_dt - start_time).total_seconds() / (365.25 * 86400.0)
            pt.trend_value = round(ols.intercept + (ols.slope_per_year * years_elapsed), 2)

        # 4. Save to SQLite History
        try:
            save_analysis(
                variable=req.variable,
                variable_name=var_info["name"],
                location_name=req.location_name,
                latitude=req.latitude,
                longitude=req.longitude,
                start_date=req.start_date,
                end_date=req.end_date,
                temporal_resolution=req.frequency,
                linear_slope=summary.linear_regression.slope_per_year,
                sen_slope=summary.sens_slope_per_year,
                p_value=summary.mann_kendall.p_value,
                r_squared=summary.linear_regression.r_squared,
                trend_direction=summary.trend_direction,
                is_significant=summary.is_significant,
                observation_count=summary.observation_count,
                summary=summary.scientific_explanation[:400]
            )
        except Exception:
            pass

        return AnalyzeResponse(summary=summary, data=data_resp)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@router.post("/compare", response_model=CompareResponse)
def compare_regions(req: CompareRequest):
    """
    Compares environmental trends between two distinct geographic locations.
    """
    var_info = VARIABLES_REGISTRY.get(req.variable)
    if not var_info:
        raise HTTPException(status_code=400, detail=f"Variable '{req.variable}' not found.")

    try:
        # Fetch Location A
        df_a, is_demo_a, source_a, _ = fetch_nasa_power_data(
            latitude=req.location_a.latitude,
            longitude=req.location_a.longitude,
            parameter=req.variable,
            start_date=req.start_date,
            end_date=req.end_date,
            frequency=req.frequency
        )
        summary_a = run_full_statistical_analysis(
            df=df_a,
            variable_info=var_info,
            location_name=req.location_a.name,
            latitude=req.location_a.latitude,
            longitude=req.location_a.longitude,
            start_date=req.start_date,
            end_date=req.end_date,
            frequency=req.frequency,
            source=source_a,
            is_demonstration=is_demo_a
        )

        # Fetch Location B
        df_b, is_demo_b, source_b, _ = fetch_nasa_power_data(
            latitude=req.location_b.latitude,
            longitude=req.location_b.longitude,
            parameter=req.variable,
            start_date=req.start_date,
            end_date=req.end_date,
            frequency=req.frequency
        )
        summary_b = run_full_statistical_analysis(
            df=df_b,
            variable_info=var_info,
            location_name=req.location_b.name,
            latitude=req.location_b.latitude,
            longitude=req.location_b.longitude,
            start_date=req.start_date,
            end_date=req.end_date,
            frequency=req.frequency,
            source=source_b,
            is_demonstration=is_demo_b
        )

        # Merge for combined timeseries
        df_a["date_str"] = df_a["date"].dt.strftime("%Y-%m-%d")
        df_b["date_str"] = df_b["date"].dt.strftime("%Y-%m-%d")
        
        merged = pd.merge(
            df_a[["date_str", "value"]].rename(columns={"value": "val_a"}),
            df_b[["date_str", "value"]].rename(columns={"value": "val_b"}),
            on="date_str",
            how="outer"
        ).sort_values("date_str")

        comparison_pts = []
        for _, r in merged.iterrows():
            comparison_pts.append({
                "date": r["date_str"],
                req.location_a.name: None if pd.isna(r["val_a"]) else round(float(r["val_a"]), 2),
                req.location_b.name: None if pd.isna(r["val_b"]) else round(float(r["val_b"]), 2)
            })

        slope_diff = round(summary_a.sens_slope_per_year - summary_b.sens_slope_per_year, 4)
        higher_loc = None
        if summary_a.sens_slope_per_year > summary_b.sens_slope_per_year:
            higher_loc = req.location_a.name
        elif summary_b.sens_slope_per_year > summary_a.sens_slope_per_year:
            higher_loc = req.location_b.name

        diverging = bool((summary_a.sens_slope_per_year * summary_b.sens_slope_per_year) < 0 and (summary_a.is_significant or summary_b.is_significant))

        unit_str = var_info.get("unit_monthly", var_info.get("unit", "")) if req.frequency == "monthly" else var_info.get("unit", "")

        narrative = (
            f"Comparing **{req.location_a.name}** and **{req.location_b.name}** for **{var_info['name']}** "
            f"across {req.start_date[:4]}–{req.end_date[:4]}:\n\n"
            f"- **{req.location_a.name}**: Sen's slope = **{summary_a.sens_slope_per_year:+.4f} {unit_str}/year** "
            f"({'Statistically Significant, p=' + str(summary_a.mann_kendall.p_value) if summary_a.is_significant else 'No significant trend'})\n"
            f"- **{req.location_b.name}**: Sen's slope = **{summary_b.sens_slope_per_year:+.4f} {unit_str}/year** "
            f"({'Statistically Significant, p=' + str(summary_b.mann_kendall.p_value) if summary_b.is_significant else 'No significant trend'})\n\n"
        )
        if diverging:
            narrative += f"⚠️ **Diverging Trends Alert**: The two selected regions are changing in opposite directions!\n\n"
        if higher_loc:
            narrative += f"**{higher_loc}** exhibits a higher rate of annual increase by **{abs(slope_diff):.4f} {unit_str}/year**."
        else:
            narrative += "Both regions demonstrate nearly identical rates of annual change."

        return CompareResponse(
            variable=req.variable,
            variable_name=var_info["name"],
            unit=unit_str,
            location_a=summary_a,
            location_b=summary_b,
            comparison_time_series=comparison_pts,
            slope_difference_per_year=slope_diff,
            higher_warming_location=higher_loc,
            diverging_trends=diverging,
            narrative=narrative,
            is_demonstration=bool(is_demo_a or is_demo_b)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regional comparison failed: {str(e)}")

@router.get("/report")
def get_pdf_report(
    latitude: float = Query(12.9716),
    longitude: float = Query(77.5946),
    location_name: str = Query("Bengaluru, Karnataka"),
    variable: str = Query("T2M"),
    start_date: str = Query("2000-01-01"),
    end_date: str = Query("2023-12-31"),
    frequency: str = Query("monthly")
):
    """Generates and downloads a complete ReportLab PDF scientific report."""
    var_info = VARIABLES_REGISTRY.get(variable)
    if not var_info:
        raise HTTPException(status_code=400, detail="Invalid variable.")

    try:
        df, is_demo, source_str, _ = fetch_nasa_power_data(
            latitude=latitude,
            longitude=longitude,
            parameter=variable,
            start_date=start_date,
            end_date=end_date,
            frequency=frequency
        )

        summary = run_full_statistical_analysis(
            df=df,
            variable_info=var_info,
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
            frequency=frequency,
            source=source_str,
            is_demonstration=is_demo
        )

        pdf_buffer = generate_pdf_report(summary.model_dump())
        safe_loc = "".join(c for c in location_name if c.isalnum() or c in (' ', '_', '-')).rstrip()
        filename = f"EarthPulse_Report_{variable}_{safe_loc}.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF report generation failed: {str(e)}")

@router.get("/export/csv")
def export_csv(
    latitude: float = Query(12.9716),
    longitude: float = Query(77.5946),
    variable: str = Query("T2M"),
    start_date: str = Query("2000-01-01"),
    end_date: str = Query("2023-12-31"),
    frequency: str = Query("monthly"),
    location_name: str = Query("Bengaluru, Karnataka")
):
    """Exports raw time-series observations as a clean CSV file."""
    var_info = VARIABLES_REGISTRY.get(variable)
    if not var_info:
        raise HTTPException(status_code=400, detail="Invalid variable.")

    df, is_demo, source_str, _ = fetch_nasa_power_data(
        latitude=latitude,
        longitude=longitude,
        parameter=variable,
        start_date=start_date,
        end_date=end_date,
        frequency=frequency
    )

    csv_buffer = io.StringIO()
    if is_demo:
        csv_buffer.write("# WARNING: SAMPLE DATA - not NASA observations (demonstration mode)\n")
    # Add metadata header comments
    csv_buffer.write(f"# Platform: EarthPulse AI\n")
    csv_buffer.write(f"# Variable: {var_info['name']} ({variable})\n")
    csv_buffer.write(f"# Location: {location_name} (Lat: {latitude}, Lon: {longitude})\n")
    csv_buffer.write(f"# Unit: {var_info.get('unit', '')}\n")
    csv_buffer.write(f"# Data Source: {source_str}\n")
    csv_buffer.write(f"# Generated: {datetime.utcnow().isoformat()}\n")
    
    export_df = df.copy()
    export_df["date"] = export_df["date"].dt.strftime("%Y-%m-%d")
    export_df.rename(columns={"value": f"{variable}_{var_info['unit']}"}).to_csv(csv_buffer, index=False)
    
    csv_buffer.seek(0)
    safe_loc = "".join(c for c in location_name if c.isalnum() or c in (' ', '_', '-')).rstrip()
    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=earthpulse_{variable}_{safe_loc}.csv"}
    )

@router.get("/atlas", response_model=AtlasResponse)
def get_atlas(variable: str = Query("T2M")):
    """Returns global precomputed Sen's slope and significance grid for a variable."""
    return load_atlas_file(variable)

@router.get("/atlas/top", response_model=List[AtlasCell])
def get_top_atlas_cells(
    variable: str = Query("T2M"),
    n: int = Query(10, ge=1, le=50)
):
    """Returns top fastest-changing significant cells for a variable."""
    atlas = load_atlas_file(variable)
    sig_cells = [c for c in atlas.cells if c.is_significant]
    sig_cells.sort(key=lambda x: abs(x.sens_slope_per_decade), reverse=True)
    return sig_cells[:n]

@router.get("/history")
def get_history(limit: int = Query(15, ge=1, le=50)):
    """Retrieves previous user analysis runs from SQLite."""
    return get_recent_analyses(limit)

@router.post("/ai/ask", response_model=AskQuestionResponse)
def ask_question(req: AskQuestionRequest):
    """Answers user scientific and data questions using the verified knowledge base and current statistical results."""
    return ask_earthpulse_ai(
        question=req.question,
        current_analysis=req.current_analysis,
        chat_history=req.chat_history
    )

@router.get("/knowledge")
def list_knowledge_docs():
    """Returns the organized catalogue of verified scientific documents in the knowledge base."""
    docs = []
    for d in kb_index.documents:
        docs.append({
            "title": d["title"],
            "category": d["category"],
            "file_name": d["file_name"]
        })
    return docs

@router.get("/knowledge/{category}/{doc_name}")
def get_knowledge_doc(category: str, doc_name: str):
    """Retrieves full text of a specific scientific knowledge base document."""
    for d in kb_index.documents:
        if d["category"].lower() == category.lower() and d["file_name"].lower() == doc_name.lower():
            return {
                "title": d["title"],
                "category": d["category"],
                "file_name": d["file_name"],
                "content": d["content"]
            }
    raise HTTPException(status_code=404, detail="Knowledge base document not found.")
