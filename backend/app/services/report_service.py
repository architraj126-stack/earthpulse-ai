import io
from datetime import datetime
from typing import Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf_report(summary: Dict[str, Any]) -> io.BytesIO:
    """
    Generates a professional, publication-quality scientific analysis PDF report.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Styles
    navy = colors.HexColor("#071426")
    cyan = colors.HexColor("#0088AA")
    dark_slate = colors.HexColor("#1A2B3C")
    card_bg = colors.HexColor("#F4F7FB")
    text_dark = colors.HexColor("#223344")
    green = colors.HexColor("#1B7837")
    red = colors.HexColor("#B2182B")
    grey = colors.HexColor("#666666")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=navy,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=cyan,
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        "Heading2Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=navy,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "BodyCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=text_dark
    )

    callout_style = ParagraphStyle(
        "CalloutText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=13,
        textColor=dark_slate
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=text_dark
    )

    elements = []

    # Title Banner
    elements.append(Paragraph("EARTHPULSE AI", title_style))
    elements.append(Paragraph("SCIENTIFIC ENVIRONMENTAL TREND & SIGNIFICANCE REPORT", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=cyan, spaceAfter=15))

    # Metadata Block
    loc_name = summary.get("location_name", "N/A")
    lat = summary.get("latitude", 0.0)
    lon = summary.get("longitude", 0.0)
    var_name = summary.get("variable_name", "N/A")
    param = summary.get("variable", "N/A")
    unit = summary.get("unit", "")
    start_date = summary.get("start_date", "N/A")
    end_date = summary.get("end_date", "N/A")
    freq = summary.get("frequency", "monthly").title()
    source = summary.get("source", "NASA POWER")
    is_demo = summary.get("is_demonstration", False)
    obs_count = summary.get("observation_count", 0)
    missing_pct = summary.get("missing_percentage", 0.0)

    meta_data = [
        [
            Paragraph("<b>Target Region:</b>", table_cell_style),
            Paragraph(f"{loc_name} ({lat:.4f}°N, {lon:.4f}°E)", table_cell_style),
            Paragraph("<b>Analysis Window:</b>", table_cell_style),
            Paragraph(f"{start_date} to {end_date} ({freq})", table_cell_style)
        ],
        [
            Paragraph("<b>Environmental Variable:</b>", table_cell_style),
            Paragraph(f"{var_name} [<code>{param}</code>]", table_cell_style),
            Paragraph("<b>Measurement Unit:</b>", table_cell_style),
            Paragraph(f"{unit}", table_cell_style)
        ],
        [
            Paragraph("<b>NASA Data Source:</b>", table_cell_style),
            Paragraph(f"{source}", table_cell_style),
            Paragraph("<b>Data Quality:</b>", table_cell_style),
            Paragraph(f"{obs_count} observations ({missing_pct}% missing)", table_cell_style)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[1.4 * inch, 2.3 * inch, 1.4 * inch, 2.3 * inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), card_bg),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#D0D8E2")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 14))

    # Executive Summary Card
    is_sig = summary.get("is_significant", False)
    trend_dir = summary.get("trend_direction", "stable").upper()
    sens_slope = summary.get("sens_slope_per_year", 0.0)
    p_val = summary.get("mann_kendall", {}).get("p_value", 1.0)
    
    badge_bg = green if (is_sig and sens_slope > 0) else (red if (is_sig and sens_slope < 0) else grey)
    badge_text = "SIGNIFICANT INCREASE" if (is_sig and sens_slope > 0) else ("SIGNIFICANT DECREASE" if (is_sig and sens_slope < 0) else "NO SIGNIFICANT TREND")

    summary_card = [
        [
            Paragraph(f"<b>TREND EVALUATION:</b> <font color='{badge_bg.hexval()}'><b>{badge_text}</b></font>", table_cell_style),
            Paragraph(f"<b>ANNUAL RATE OF CHANGE:</b> <b>{sens_slope:+.4f} {unit}/year</b> ({sens_slope * 10:+.3f} {unit}/decade)", table_cell_style)
        ]
    ]
    summary_table = Table(summary_card, colWidths=[3.7 * inch, 3.7 * inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EBF3FA")),
        ('BOX', (0, 0), (-1, -1), 1.0, cyan),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 12))

    # Statistical Findings Table
    elements.append(Paragraph("Statistical Engine Findings", h2_style))
    ols = summary.get("linear_regression", {})
    mk_dict = summary.get("mann_kendall", {})
    smk = summary.get("seasonal_mann_kendall")

    stat_rows = [
        [
            Paragraph("<b>Statistical Metric</b>", table_header_style),
            Paragraph("<b>Value</b>", table_header_style),
            Paragraph("<b>Interpretation / Standard Benchmark</b>", table_header_style)
        ],
        [
            Paragraph("Mann-Kendall P-Value", table_cell_style),
            Paragraph(f"<b>{mk_dict.get('p_value', 'N/A')}</b>", table_cell_style),
            Paragraph(f"α = 0.05 threshold. {'Statistically Significant (< 0.05)' if is_sig else 'Insufficient evidence of monotonic trend'}", table_cell_style)
        ],
        [
            Paragraph("Sen's Slope Estimator", table_cell_style),
            Paragraph(f"<b>{sens_slope:+.4f} {unit}/yr</b>", table_cell_style),
            Paragraph("Median pairwise slope. Non-parametric robust rate of change.", table_cell_style)
        ],
        [
            Paragraph("OLS Linear Slope", table_cell_style),
            Paragraph(f"{ols.get('slope_per_year', 'N/A'):+.4f} {unit}/yr", table_cell_style),
            Paragraph(f"R² = {ols.get('r_squared', 0.0):.3f}; Std Err = {ols.get('std_err', 0.0):.4f}", table_cell_style)
        ],
        [
            Paragraph("95% Confidence Interval (Slope)", table_cell_style),
            Paragraph(f"[{ols.get('ci_95_lower', 0.0):+.4f}, {ols.get('ci_95_upper', 0.0):+.4f}]", table_cell_style),
            Paragraph("Range containing true population slope at 95% probability.", table_cell_style)
        ],
        [
            Paragraph("Kendall's Rank Correlation (Tau)", table_cell_style),
            Paragraph(f"{mk_dict.get('tau', 'N/A')}", table_cell_style),
            Paragraph("Degree of monotonic concordance (bounded between -1.0 and +1.0).", table_cell_style)
        ],
        [
            Paragraph("Mann-Kendall Z-Statistic", table_cell_style),
            Paragraph(f"{mk_dict.get('z', 'N/A')}", table_cell_style),
            Paragraph(f"Standardized score (|Z| > 1.96 denotes p < 0.05 significance).", table_cell_style)
        ]
    ]

    if smk:
        stat_rows.append([
            Paragraph("Seasonal Mann-Kendall (m=12)", table_cell_style),
            Paragraph(f"p={smk.get('p_value', 'N/A')}, Z={smk.get('z', 'N/A')}", table_cell_style),
            Paragraph(f"De-seasoned trend across recurring calendar months.", table_cell_style)
        ])

    stat_table = Table(stat_rows, colWidths=[2.2 * inch, 1.8 * inch, 3.4 * inch])
    stat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), navy),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(stat_table)
    elements.append(Spacer(1, 14))

    # Scientific Interpretation Section
    elements.append(Paragraph("Scientific Interpretation & Earth Systems Context", h2_style))
    sci_text = summary.get("scientific_explanation", "").replace("**", "")
    for paragraph in sci_text.split("\n\n"):
        if paragraph.strip():
            elements.append(Paragraph(paragraph.strip(), body_style))
            elements.append(Spacer(1, 4))

    elements.append(Spacer(1, 8))

    # Methodology & Limitations
    elements.append(Paragraph("Methodology & Limitations", h2_style))
    method_text = summary.get("methodology_limitations", "")
    for line in method_text.split("\n"):
        if line.strip():
            elements.append(Paragraph(line.strip(), callout_style))
            elements.append(Spacer(1, 2))

    elements.append(Spacer(1, 14))
    elements.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#CBD5E1"), spaceAfter=8))
    
    # Footer
    footer_text = (
        f"Generated by EarthPulse AI Research Engine on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}. "
        "NASA POWER dataset provided by NASA Langley Research Center. "
        "Statistical tests formulated in compliance with WMO and IPCC AR6 guidelines."
    )
    elements.append(Paragraph(footer_text, ParagraphStyle("Footer", parent=styles["Normal"], fontSize=7.5, leading=10, textColor=grey)))

    doc.build(elements)
    buffer.seek(0)
    return buffer
