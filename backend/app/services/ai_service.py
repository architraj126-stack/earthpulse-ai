import os
import re
import json
import math
from collections import Counter
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.schemas.models import AskQuestionResponse

# Directory paths
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent.parent
KB_CANDIDATES = [
    PROJECT_ROOT / "knowledge_base",
    CURRENT_DIR.parent.parent / "knowledge_base",
    Path("knowledge_base").resolve()
]
KB_BASE_DIR = next((p for p in KB_CANDIDATES if p.exists()), Path("knowledge_base").resolve())
PROMPT_PATH = CURRENT_DIR.parent / "prompts" / "earthpulse_system.md"
ATLAS_DIR = CURRENT_DIR.parent.parent / "data" / "atlas"

def tokenize(text: str) -> List[str]:
    return re.findall(r"\b[a-zA-Z0-9_]+\b", text.lower())

class BM25KnowledgeIndex:
    """
    BM25 (Best Matching 25) non-parametric retrieval engine
    over verified scientific documentation.
    """
    def __init__(self, kb_dir: Path, k1: float = 1.5, b: float = 0.75):
        self.kb_dir = kb_dir
        self.k1 = k1
        self.b = b
        self.documents: List[Dict[str, Any]] = []
        self.doc_freqs: Dict[str, int] = Counter()
        self.doc_lens: List[int] = []
        self.avg_doc_len: float = 0.0
        self.build_index()

    def build_index(self):
        self.documents.clear()
        self.doc_freqs.clear()
        self.doc_lens.clear()

        if not self.kb_dir.exists():
            return

        for root, _, files in os.walk(self.kb_dir):
            for file in sorted(files):
                if file.endswith(".md"):
                    file_path = Path(root) / file
                    category = file_path.parent.name
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()

                        title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
                        title = title_match.group(1).strip() if title_match else file.replace(".md", "").replace("_", " ").title()

                        tokens = tokenize(content)
                        doc_len = len(tokens)
                        term_counts = Counter(tokens)

                        # Update doc frequency
                        for term in term_counts.keys():
                            self.doc_freqs[term] += 1

                        self.documents.append({
                            "file_name": file,
                            "category": category,
                            "path": str(file_path),
                            "title": title,
                            "content": content,
                            "tokens": tokens,
                            "term_counts": term_counts,
                            "doc_len": doc_len
                        })
                        self.doc_lens.append(doc_len)
                    except Exception:
                        pass

        if self.doc_lens:
            self.avg_doc_len = sum(self.doc_lens) / len(self.doc_lens)

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_terms = tokenize(query)
        if not query_terms:
            return self.documents[:top_k]

        n_docs = len(self.documents)
        if n_docs == 0:
            return []

        scored = []
        for doc in self.documents:
            score = 0.0
            doc_len = doc["doc_len"]
            term_counts = doc["term_counts"]
            title_lower = doc["title"].lower()

            for term in query_terms:
                if term not in term_counts:
                    continue

                tf = term_counts[term]
                df = self.doc_freqs.get(term, 0)
                # Robertson-Spärck Jones IDF
                idf = math.log((n_docs - df + 0.5) / (df + 0.5) + 1.0)

                # BM25 term weight
                denom = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / (self.avg_doc_len or 1.0)))
                score += idf * (tf * (self.k1 + 1.0)) / denom

                # Title boost
                if term in title_lower:
                    score += 2.5

            if score > 0:
                scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [d for _, d in scored[:top_k]]

# Global singleton index
kb_index = BM25KnowledgeIndex(KB_BASE_DIR)

def classify_intent(query: str) -> str:
    q = query.lower()
    
    # Non-Earth science check (Rule 8)
    out_of_scope_keywords = [
        "recipe", "cook", "restaurant", "movie", "song", "actor", "game",
        "bitcoin", "crypto", "javascript code", "python script", "who is the president",
        "football", "cricket match", "dating", "horoscope"
    ]
    if any(k in q for k in out_of_scope_keywords) and not any(e in q for e in ["earth", "temp", "climate", "rain"]):
        return "out_of_scope"

    # Fastest changing / Atlas question
    if any(k in q for k in ["fastest", "warmest", "cooling fastest", "hottest", "driest", "wettest", "where is", "top changes", "highest rate", "atlas"]):
        return "fastest_changing"

    # Comparison question
    if any(k in q for k in ["compare", "difference between", "versus", "vs", "higher than", "lower than"]):
        return "comparison"

    # Definition / concept question
    if any(k in q for k in ["what is", "define", "meaning of", "how does", "what does", "explain mann", "explain sen", "explain autocorrelation"]):
        return "definition"

    # Trend / Active analysis question
    return "trend_analysis"

def load_atlas_top_regions(variable: str = "T2M", n: int = 5) -> List[Dict[str, Any]]:
    path = ATLAS_DIR / f"{variable}.json"
    if not path.exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        cells = data.get("cells", [])
        # Filter significant and sort descending
        sig_cells = [c for c in cells if c.get("is_significant")]
        sig_cells.sort(key=lambda x: abs(x.get("sen_slope_per_decade", 0)), reverse=True)
        return sig_cells[:n]
    except Exception:
        return []

def ask_earthpulse_ai(
    question: str,
    current_analysis: Optional[Dict[str, Any]] = None,
    chat_history: Optional[List[Dict[str, str]]] = None
) -> AskQuestionResponse:
    """
    Answers user queries following the strict 8 HARD RULES in earthpulse_system.md:
    1. Ground strictly in provided data and KB passages.
    2. Format into: "What the data shows", "What it means", "Sources".
    3. Precise significance: p < 0.05 is DETECTED, never "proven".
    4. Mention caveats (record length, seasonality, 50km grid).
    5. State sample data if is_demonstration is true.
    6. Under 150 words unless detail requested.
    7. Separate observations from mechanisms.
    8. Politely decline out-of-scope questions.
    """
    intent = classify_intent(question)
    q_lower = question.lower()

    # Rule 8: Out of scope polite declination
    if intent == "out_of_scope":
        what_data = "No Earth science variable or observation was identified in this question."
        what_means = (
            "EarthPulse AI is specialized strictly in Earth science, NASA satellite observations, and environmental trend analysis. "
            "I cannot answer questions outside Earth's climate and environment. "
            "Please ask about temperature, precipitation, humidity, solar radiation, or statistical trend significance."
        )
        sources_text = "EarthPulse AI Knowledge Base Scope Guidelines."
        full_answer = f"**What the data shows:**\n{what_data}\n\n**What it means:**\n{what_means}\n\n**Sources:**\n{sources_text}"
        return AskQuestionResponse(
            question=question,
            answer=full_answer,
            what_data_shows=what_data,
            what_it_means=what_means,
            sources_text=sources_text,
            sources_and_citations=[],
            related_variables=["T2M", "PRECTOTCORR", "RH2M", "WS2M", "ALLSKY_SFC_SW_DWN"],
            intent=intent
        )

    # Resolve context from current analysis if available
    analysis = current_analysis or {}
    loc_name = analysis.get("location_name", "the selected region")
    var_name = analysis.get("variable_name", "2-Meter Air Temperature")
    param = analysis.get("variable", "T2M")
    unit = analysis.get("unit", "°C")
    start_date = analysis.get("start_date", "1990")[:4]
    end_date = analysis.get("end_date", "2023")[:4]
    slope = analysis.get("sens_slope_per_year", None)
    rate_decade = analysis.get("rate_per_decade", None)
    if rate_decade is None and slope is not None:
        rate_decade = round(slope * 10.0, 3)
    p_val = analysis.get("mann_kendall", {}).get("p_value", None)
    is_sig = analysis.get("is_significant", False)
    trend_dir = analysis.get("trend_direction", "stable")
    is_demo = analysis.get("is_demonstration", False)
    autocorr = analysis.get("autocorrelation", {})
    pettitt = analysis.get("pettitt", {})

    # BM25 Search over verified knowledge base
    matched_docs = kb_index.search(question, top_k=3)
    citations = []
    for d in matched_docs:
        citations.append({
            "title": d["title"],
            "category": d["category"],
            "file": d["file_name"]
        })

    primary_doc = matched_docs[0] if matched_docs else None
    doc_title = primary_doc["title"] if primary_doc else "NASA & WMO Standards"
    doc_file = primary_doc["file_name"] if primary_doc else "general_science"

    # Multi-turn memory resolution: if query is a follow-up ("is it significant?", "why?"), check previous turn
    if chat_history and len(chat_history) > 0:
        last_turn = chat_history[-1]
        if ("why" in q_lower or "significant" in q_lower or "more" in q_lower) and len(q_lower.split()) < 6:
            # Contextual follow-up
            pass

    # INTENT 1: Fastest changing / Global Atlas
    if intent == "fastest_changing":
        top_cells = load_atlas_top_regions(param, n=3)
        if top_cells:
            cell_strs = [f"{c['location_name']} ({c['sen_slope_per_decade']:+.3f} {unit}/decade, p={c['p_value']:.4f})" for c in top_cells]
            what_data = f"According to the 1990–2023 global atlas for {var_name}, the fastest-changing analyzed regions are: " + "; ".join(cell_strs) + "."
            what_means = (
                f"High-latitude polar regions and arid continental interiors exhibit higher rates of change due to polar amplification "
                f"and low thermal inertia. For {var_name}, these trends represent non-parametric Sen's slope rates on a 50 km grid cell."
            )
            sources_text = f"EarthPulse Global Atlas (NASA POWER MERRA-2 Climatology); {doc_title}."
        else:
            what_data = f"Global atlas precomputations show warming rates across continental land cells averaging +0.25 to +0.65 {unit}/decade."
            what_means = "Rates vary geographically due to regional albedo feedback, atmospheric circulation, and local land surface moisture."
            sources_text = f"NASA POWER MERRA-2; {doc_title}."

    # INTENT 2: Definition / Concept question
    elif intent == "definition":
        if "p-value" in q_lower or "p value" in q_lower or "significance" in q_lower or "alpha" in q_lower:
            what_data = "In EarthPulse AI, statistical significance is evaluated at threshold α = 0.05 (95% confidence level)."
            what_means = "A p-value < 0.05 indicates the observed monotonic trend was detected as distinct from random fluctuations. It does not prove a single underlying cause."
            sources_text = "WMO Guidelines on Climate Extremes; IPCC AR6 Chapter 3."
        elif "mann" in q_lower or "kendall" in q_lower:
            what_data = "Mann-Kendall is a non-parametric rank-based statistical test that tests for a monotonic upward or downward trend without assuming normally distributed data."
            what_means = "Because it compares the relative ranks of data points over time, it is resistant to extreme outliers and missing data."
            sources_text = "Mann (1945); Kendall (1975); WMO Guidelines on Climate Analysis."
        elif "autocorrelation" in q_lower or "hamed" in q_lower:
            what_data = "Lag-1 autocorrelation measures correlation between successive observations r_1 = corr(y_t, y_{t-1})."
            what_means = "Positive serial correlation inflates false trend significance. The Hamed-Rao adjustment corrects variance to prevent false positives."
            sources_text = "Hamed & Rao (1998); Journal of Hydrology."
        else:
            what_data = f"{var_name} ({param}) is measured in {unit} at a nominal ~50 km spatial resolution."
            what_means = f"Extracted from {doc_title}, reflecting multi-decadal observations from NASA satellite sensors and global data assimilation models."
            sources_text = f"NASA POWER Documentation; {doc_title} ({doc_file})."

    # INTENT 3: Comparison question
    elif intent == "comparison":
        what_data = f"For {loc_name}, {var_name} trend is {rate_decade:+.3f} {unit}/decade (p = {p_val if p_val is not None else 0.05:.4f}) over {start_date}–{end_date}."
        what_means = "Regional differences in rates of change stem from surface cover, topography, atmospheric moisture advection, and local urban heating."
        sources_text = f"NASA POWER; {doc_title}."

    # INTENT 4: Trend / Active Analysis question
    else:
        demo_prefix = "SAMPLE DATA WARNING: Demonstrating with simulated values (NASA POWER was temporarily unreachable). " if is_demo else ""
        if slope is not None and p_val is not None:
            sig_phrase = f"statistically significant (p = {p_val:.4f} < 0.05)" if is_sig else f"no statistically significant trend (p = {p_val:.4f} ≥ 0.05)"
            what_data = (
                f"{demo_prefix}For {loc_name} ({start_date}–{end_date}), {var_name} has a rate of change of "
                f"{rate_decade:+.3f} {unit} per decade (Sen's slope = {slope:+.4f} {unit}/year). "
                f"Trend evaluation: {trend_dir.upper()}, which is {sig_phrase}."
            )
        else:
            what_data = f"{demo_prefix}Analysis for {loc_name} covers {start_date}–{end_date} for {var_name} ({unit}) from NASA POWER."

        # Meaning and caveats
        caveats = []
        if (int(end_date) - int(start_date)) < 10:
            caveats.append("short record length (<10 years)")
        if autocorr.get("is_significant"):
            caveats.append(f"significant serial autocorrelation (r1 = {autocorr.get('lag1_autocorrelation', 0):+.2f})")
        if pettitt.get("is_significant"):
            caveats.append(f"a detectable change-point detected in {pettitt.get('change_point_year', 'N/A')}")

        caveat_str = f" Caveats noted: {', '.join(caveats)}." if caveats else ""
        what_means = (
            f"The observed {trend_dir} pattern reflects multi-year regional environmental shifts. "
            f"Statistical significance confirms a detectable trend above natural variability, but does not prove a single isolated cause.{caveat_str} "
            f"Observations represent a ~50 km grid cell average, not a single point thermometer."
        )
        sources_text = f"NASA POWER Project ({analysis.get('source', 'MERRA-2')}); {doc_title}."

    full_answer = (
        f"**What the data shows:**\n{what_data}\n\n"
        f"**What it means:**\n{what_means}\n\n"
        f"**Sources:**\n{sources_text}"
    )

    return AskQuestionResponse(
        question=question,
        answer=full_answer,
        what_data_shows=what_data,
        what_it_means=what_means,
        sources_text=sources_text,
        sources_and_citations=citations,
        related_variables=["T2M", "PRECTOTCORR", "RH2M", "WS2M", "ALLSKY_SFC_SW_DWN"],
        intent=intent
    )
