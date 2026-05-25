# SL-AAIB Data-Driven Agricultural Premium Prediction System (Backend API)
Developed by **Dolamulla Ranasinghe** / **Oshan Lahiru** (BSc Data Science, University of Plymouth)

This is the fully functioning Python 3.11 FastAPI background service and Machine Learning engine for the **Agricultural and Agrarian Insurance Board (AAIB)** pilot project in Anuradhapura, Sri Lanka.

It completely replaces obsolete fixed uniform percentage rate sheets with dynamically modeled premiums backed by an **XGBoost Regressor**, scaling risk indices dynamically within the standardized **0.75 to 1.25** bounds.

---

## 🛠️ Tech Stack & Architecture
- **Backend Application Layer**: FastAPI (Uvicorn ASGI server on Python 3.11+)
- **Machine Learning Engine**: XGBoost Regressor, pandas, scikit-learn, numpy
- **Core Formula**: `Monthly Premium = Base Rate x Risk Score x Insured Acres`
- **Port Assignment**: Port `8500` (Local CORS configuration enables React browser routing)

---

## 💻 Running the System inside Visual Studio / VS Code

### Step 1: Open the Backend Workspace
1. Launch **Visual Studio Code** or **Visual Studio**.
2. Click **Open Folder...** and select the `/backend` directory.

### Step 2: Set Up Virtual Environment (venv)
Open the integrated Terminal in Visual Studio and initialize the environment:
```bash
# Initialize Python 3 virtual environment
python -m venv venv

# Activate on Windows PowerShell/CMD
.\venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

### Step 3: Install Required Scientific Libraries
Run the installer script to import required packages (XGBoost, Scikit-learn, Pandas, FastAPI):
```bash
pip install -r requirements.txt
```

### Step 4: Run the API Server
Start the Uvicorn ASGI runner on local port `8500`:
```bash
uvicorn main:app --host 127.0.0.1 --port 8500 --reload
```

---

## 📄 Key Endpoints Description

### 1. Interactive Documentation & Swagger Sandbox
- **URL**: `http://127.0.0.1:8500/docs`
- Fully functional OpenAPI test sandbox to trigger requests directly.

### 2. Crop Damage Ingest & Clean Pipeline (`POST /api/upload`)
- Accepts uploaded `.csv` or `.xlsx` sheets containing division columns, performs automated feature engineering (evaluating drought ratios, elephant raid conflicts, pest intrusion variables).
- Triggers model retraining dynamically on success.

### 3. Machine Learning Retrain Model (`POST /api/model/retrain`)
- Re-aggregates risk variables and re-centers mathematical scoring indexes.

### 4. Fetch Division Scores (`GET /api/divisions`)
- Returns localized high, medium, and low-risk indices.

---

## 🌍 Connecting the React Frontend
The React Single Page App in the parent workspace is fully ready. If the FastAPI backend is running on `http://localhost:8500`, the frontend automatically synchronizes with actual live computations from your machine learning engine rather than static fallbacks!
