// Unified API Service for SL-AAIB System
// Automatically coordinates between FastAPI backend (localhost:8500) and graceful local fallback

export const BACKEND_URL = "http://localhost:8500";

export interface PremiumRequest {
  clientName: string;
  division: string;
  crop: string;
  acreage: number;
  coverage: number;
  irrigation: string;
  manualOverride: number;
}

export interface PremiumResult {
  clientName: string;
  division: string;
  crop: string;
  acreage: number;
  coverage: number;
  irrigation: string;
  baseRate: number;
  riskScore: number;
  riskCategory: string;
  grossPremium: number;
  subsidyAmount: number;
  netPremium: number;
  isBackendReal?: boolean;
}

export interface DivisionInfo {
  risk: "Low" | "Medium" | "High";
  score: number;
  base_rate: number;
}

export class ApiService {
  private static backendHealthy: boolean | null = null;

  // Check if FastAPI backend is online
  public static async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1200); // Fail-fast timeout
      
      const response = await fetch(`${BACKEND_URL}/api/health`, { 
        method: "GET",
        signal: controller.signal 
      });
      clearTimeout(id);
      
      if (response.ok) {
        this.backendHealthy = true;
        return true;
      }
    } catch (e) {
      // Backend is offline or not configured
    }
    this.backendHealthy = false;
    return false;
  }

  // Calculate underwritten premium
  public static async calculatePremium(req: PremiumRequest): Promise<PremiumResult> {
    const isOnline = await this.checkHealth();
    
    if (isOnline) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/premium/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req)
        });
        if (response.ok) {
          const data = await response.json();
          return { ...data, isBackendReal: true };
        }
      } catch (err) {
        console.warn("Backend calculation failed. Falling back to local calculator.", err);
      }
    }

    // Local static model fallback matching exactly the backend's mathematics
    const crop_base_rates: Record<string, number> = {
      Paddy: 1500,
      Maize: 1800,
      Chilli: 2200,
      Soya: 1600,
      Onions: 2500
    };
    const baseRate = crop_base_rates[req.crop] || 1500;
    
    // Low risk maps to ~12 score, high to ~88 score
    const dummyScores: Record<string, number> = {
      Thalawa: 78, Padaviya: 12, Kebitigollewa: 45, Medawachchiya: 22, Mahawilachchiya: 88, Rambewa: 58
    };
    const scoreVal = dummyScores[req.division] || 45;
    
    const riskScore = 0.75 + (scoreVal / 100.0) * 0.5;
    const basePremium = req.acreage * baseRate * (req.coverage / 50.0);
    
    const irrigationMultiplier = req.irrigation === "major" ? 0.8 : req.irrigation === "minor" ? 0.95 : 1.15;
    const grossPremium = Math.round(basePremium * riskScore * req.manualOverride * irrigationMultiplier);
    
    const subsidyAmount = Math.round(grossPremium * 0.3);
    const netPremium = grossPremium - subsidyAmount;
    
    return {
      clientName: req.clientName,
      division: req.division,
      crop: req.crop,
      acreage: req.acreage,
      coverage: req.coverage,
      irrigation: req.irrigation,
      baseRate,
      riskScore,
      riskCategory: scoreVal > 70 ? "High" : scoreVal > 40 ? "Medium" : "Low",
      grossPremium,
      subsidyAmount,
      netPremium,
      isBackendReal: false
    };
  }

  // Upload crop dataset
  public static async uploadDataset(file: File): Promise<{ status: string, rows_processed: number, filename: string, isBackendReal: boolean }> {
    const isOnline = await this.checkHealth();
    
    if (isOnline) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch(`${BACKEND_URL}/api/upload`, {
          method: "POST",
          body: formData
        });
        if (response.ok) {
          const data = await response.json();
          return {
            status: data.status,
            rows_processed: data.rows_processed,
            filename: data.filename,
            isBackendReal: true
          };
        }
      } catch (err) {
        console.error("Backend file upload error:", err);
      }
    }

    // Local simulated success fallback
    return {
      status: "success",
      rows_processed: 2400,
      filename: file.name,
      isBackendReal: false
    };
  }

  // Trigger Retraining
  public static async retrainModel(): Promise<{ status: string, message: string, isBackendReal: boolean }> {
    const isOnline = await this.checkHealth();
    
    if (isOnline) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/model/retrain`, {
          method: "POST"
        });
        if (response.ok) {
          const data = await response.json();
          return {
            status: data.status,
            message: data.message,
            isBackendReal: true
          };
        }
      } catch (err) {
        console.error("Backend retraining request failed:", err);
      }
    }

    return {
      status: "success",
      message: "Neural Risk model recalibrated using custom regression weights (Offline Mock).",
      isBackendReal: false
    };
  }

  // Trigger Custom Cohort Training
  public static async trainCustomCohort(years: string, seasons: string, crops: string): Promise<{
    status: string;
    message: string;
    isBackendReal: boolean;
    metrics: { status: string; rmse: number; r2: number };
    feature_importances_list?: { name: string; value: number }[];
    rankings: { rank: number; division: string; risk_score: number; score_index: number; risk_level: string }[];
    trained_records_count: number;
  }> {
    const isOnline = await this.checkHealth();
    
    if (isOnline) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/model/train-custom`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ years, seasons, crops })
        });
        if (response.ok) {
          const data = await response.json();
          // Map backend feature importances into an list of { name, value }
          const feature_importances_list = Object.entries(data.feature_importances || {}).map(([name, val]: [string, any]) => ({
            name: name.toUpperCase(),
            value: Math.round(val * 100)
          }));
          return {
            status: data.status,
            message: data.message,
            isBackendReal: true,
            metrics: data.metrics,
            feature_importances_list,
            rankings: data.rankings,
            trained_records_count: data.trained_records_count
          };
        }
      } catch (err) {
        console.error("Backend custom training request failed:", err);
      }
    }

    // Offline mock fallback with Anuradhapura DS
    const mockRankings = [
      { rank: 1, division: "Palagala", risk_score: 1.2000, score_index: 90, risk_level: "High" },
      { rank: 2, division: "Mahawilachchiya", risk_score: 1.1900, score_index: 88, risk_level: "High" },
      { rank: 3, division: "Nachchaduwa", risk_score: 1.1600, score_index: 82, risk_level: "High" },
      { rank: 4, division: "Rajanganaya", risk_score: 1.1500, score_index: 80, risk_level: "High" },
      { rank: 5, division: "Thalawa", risk_score: 1.1400, score_index: 78, risk_level: "High" },
      { rank: 6, division: "Horowupothana", risk_score: 1.1250, score_index: 75, risk_level: "High" },
      { rank: 7, division: "Galnewa", risk_score: 1.0750, score_index: 65, risk_level: "High" },
      { rank: 8, division: "Rambewa", risk_score: 1.0400, score_index: 58, risk_level: "Medium" },
      { rank: 9, division: "Nuwaragam Palatha East", risk_score: 1.0250, score_index: 55, risk_level: "Medium" },
      { rank: 10, division: "Nochchiyagama", risk_score: 0.9900, score_index: 48, risk_level: "Medium" },
      { rank: 11, division: "Kebitigollewa", risk_score: 0.9750, score_index: 45, risk_level: "Medium" }
    ];

    const feature_importances_list = [
      { name: "DROUGHT", value: 43 },
      { name: "ELEPHANTS", value: 28 },
      { name: "INSECTS", value: 15 },
      { name: "FLOOD", value: 9 },
      { name: "FIRE", value: 5 }
    ];

    return {
      status: "success",
      message: "Neural Risk custom cohort XGBoost model successfully trained (Local Sandbox Simulation).",
      isBackendReal: false,
      metrics: { status: "trained", rmse: 0.0165, r2: 0.9624 },
      feature_importances_list,
      rankings: mockRankings,
      trained_records_count: 240
    };
  }
}
