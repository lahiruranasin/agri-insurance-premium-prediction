# agri-insurance-premium-prediction
A machine learning–based agricultural insurance premium prediction system designed to calculate fair and data-driven premiums by analyzing farming risks, crop data, and environmental factors to better protect farmers.
# Data-Driven Agricultural Insurance Premium Prediction System

A machine learning-based agricultural insurance premium prediction system designed to calculate fair and data-driven premiums by analyzing farming risks, crop data, and environmental factors. Built for the Agricultural and Agrarian Insurance Board (AAIB) of Sri Lanka.

## 🚀 Tech Stack
* **Frontend:** React.js, Vite, Recharts, Tailwind CSS (or your CSS framework)
* **Backend:** FastAPI, Python 3.11, Pydantic, Uvicorn
* **Database:** MongoDB Atlas (NoSQL)
* **Machine Learning:** Scikit-learn, XGBoost, Pandas
* **Authentication:** Firebase Auth

## ⚙️ Installation & Setup

1. **Clone the repository:**
   `git clone https://github.com/lahiruranasin/agri-insurance-premium-prediction.git`

2. **Backend Setup (FastAPI & ML Engine):**
   * Navigate to the backend directory: `cd backend`
   * Create a virtual environment: `python -m venv venv`
   * Activate the environment: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
   * Install dependencies: `pip install -r requirements.txt`
   * Copy `.env.example` to `.env` and add your MongoDB URI and Firebase Admin credentials.
   * Start the server: `uvicorn main:app --reload`

3. **Frontend Setup (React):**
   * Navigate to the frontend directory: `cd frontend`
   * Install dependencies: `npm install`
   * Copy `.env.example` to `.env.local` and add your Firebase Web API keys.
   * Start the development server: `npm run dev`

4. **Access the Application:**
   * Dashboard: `http://localhost:5173`
   * API Documentation (Swagger UI): `http://localhost:8000/docs`
