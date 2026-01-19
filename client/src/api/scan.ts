import { getAuth } from "firebase/auth";

export interface ScanResult {
  id: string;
  status: "fraud" | "suspicious" | "safe";
  riskScore: number;
  confidence: "Very High" | "High" | "Medium" | "Low";
  reasons: string[];
  recommendation?: any[];
}

interface ScanRequest {
  content?: string;
  type: "message" | "link" | "document" | "email" | "job" | "company";
  userId?: string;
  file?: File;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Performs a fraud scan by calling the backend API.
 * Supports both JSON (text) and FormData (file) uploads.
 */
export async function performScan(data: ScanRequest): Promise<ScanResult> {
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    let body: any;
    let headers: Record<string, string> = {};

    if (token) headers["Authorization"] = `Bearer ${token}`;

    // 1. Determine if we use FormData or JSON
    if (data.file) {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("type", data.type);
      if (data.userId) formData.append("userId", data.userId);
      if (data.content) formData.append("content", data.content);
      body = formData;
      // Note: Multer/Browser handles the Multi-part boundary automatically, 
      // DON'T set Content-Type manually for FormData.
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    // 2. Make Request
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: "POST",
      headers,
      body,
    });

    // 3. Handle Errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("🔥 Backend Scan Error Detailed:", errorData);
      
      const errorMessage = errorData.details 
        ? `${errorData.error}: ${errorData.details}`
        : errorData.error || `Scan failed with status: ${response.status}`;
        
      throw new Error(errorMessage);
    }

    // 4. Return Typed Result
    const result: ScanResult = await response.json();
    return result;

  } catch (error: any) {
    // Log for debugging but re-throw for UI handling
    console.error("Scan API Error:", error);
    throw new Error(error.message || "Unable to connect to the scanning service.");
  }
}
