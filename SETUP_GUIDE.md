# EarthPulse AI — Installation & Setup Guide

This guide details how to install dependencies, run both the backend and frontend servers, and conduct a live hackathon demonstration of EarthPulse AI.

---

## 1. System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux
- **Python**: Version 3.10, 3.11, 3.12, or 3.13
- **Node.js**: Version 18.0.0 or later (includes npm)

---

## 2. Installation Steps

### Step 1: Install Backend Python Dependencies
From the project root directory:
```bash
pip install -r backend/requirements.txt
```
*Packages installed: `fastapi`, `uvicorn`, `pandas`, `numpy`, `scipy`, `pymannkendall`, `requests`, `pydantic`, `reportlab`, `pillow`.*

### Step 2: Install Frontend Node Dependencies
From the project root directory:
```bash
cd frontend
npm install
cd ..
```
*Packages installed: `react`, `react-dom`, `react-router-dom`, `recharts`, `leaflet`, `react-leaflet`, `axios`, `lucide-react`, `tailwindcss`, `vite`.*

---

## 3. Running the Application

To run the complete platform, start both the FastAPI backend server and the React Vite frontend server.

### Terminal 1: Start the Backend Server
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Backend API will be active at: **`http://127.0.0.1:8000`**
- Interactive Swagger API Documentation: **`http://127.0.0.1:8000/docs`**

### Terminal 2: Start the Frontend Dev Server
```bash
cd frontend
npm run dev
```
- Frontend application will be live at: **`http://localhost:5173`**
- The frontend Vite server automatically proxies API requests (`/api/*`) to `http://127.0.0.1:8000`.

---

## 4. Production Build (Optional)

To create an optimized production build of the frontend:
```bash
cd frontend
npm run build
npm run preview
```

---

## 5. Live Hackathon Demonstration Script

Follow these steps to demonstrate the platform to judges and audiences:

1. **Open the Landing Page**:
   - Navigate to `http://localhost:5173`.
   - Point out the EarthPulse AI mission: "Discover What Is Changing on Our Planet."
   - Showcase the 4 foundational questions: What is changing? Where is it changing? How much is it changing? Is the trend statistically significant?
   - Show the live engine status badge ("NASA Engine Online").

2. **Launch the Analytics Dashboard**:
   - Click **"Launch Dashboard"** or navigate to `http://localhost:5173/dashboard`.
   - Show the default target: **Bengaluru, Karnataka (Lat: 12.9716, Lon: 77.5946)** with variable `T2M` (Temperature at 2 Metres) from 2000 to 2023.

3. **Examine Statistical Trend Results**:
   - Point to the **Status Banner** (Green for significant warming, Red for significant decrease, Grey for no trend).
   - Review **Sen's Slope**: robust annual rate of change (e.g. +0.026 °C/year = +0.26 °C/decade).
   - Review **Mann-Kendall P-Value**: p < 0.05 confirming statistical significance at 95% confidence level.
   - Show the **Interactive Time Series Chart**: highlight the actual NASA observations (cyan points) and calculated linear trendline (green dashed line).
   - Point out the **Annual Aggregates** and **Monthly Seasonal Climatology** charts.

4. **Interactive Location Selection**:
   - Switch to the **Location Explorer** tab.
   - Search for another city (e.g. "Chennai", "Tokyo", "London", "Nairobi") or click anywhere on the OpenStreetMap interactive canvas.
   - Click **"Apply Location & Run Analysis"** to see instant recalculation.

5. **Test the Grounded AI Data Detective ("Ask EarthPulse AI")**:
   - Click on the quick query: *"Is temperature increasing in Bengaluru?"* or *"What does the p-value mean?"*.
   - Show how the AI provides a multi-part answer:
     - Direct explanation
     - Statistical Observation (citing exact slope and p-value)
     - Physical Mechanism (Urban Heat Island, Sensible Heat Flux, Clausius-Clapeyron)
     - Verified Citations (linking to papers and NASA documentation in the knowledge base).

6. **Demonstrate Regional Comparison**:
   - Navigate to **Regional Comparison** (`/compare`).
   - Run the benchmark preset: **Bengaluru vs. Chennai**.
   - Show the dual-line combined chart and the comparative rate difference.

7. **Export Reports**:
   - Click **"Download PDF"** on the dashboard.
   - Open the resulting ReportLab PDF report containing full executive summary, statistical findings table, scientific interpretation, methodology, and citations.
   - Click **"Export CSV"** to demonstrate raw data accessibility.
