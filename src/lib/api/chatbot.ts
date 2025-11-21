// API Configuration
export const API_CONFIG = {
  CHATBOT_API_URL: process.env.NEXT_PUBLIC_CHATBOT_API_URL || "/api/chatbot",
  CHATBOT_API_TIMEOUT: parseInt(
    process.env.NEXT_PUBLIC_CHATBOT_API_TIMEOUT || "10000"
  ),
  CONNECTION_TEST_TIMEOUT: parseInt(
    process.env.NEXT_PUBLIC_CHATBOT_CONNECTION_TEST_TIMEOUT || "5000"
  ),
};

export interface ChatbotRequest {
  user_query: string;
}

export interface ChatbotResponse {
  user_id: string;
  response: string;
  lead_flag: boolean;
  doc_urls: string[] | null;
  error?: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

class ChatbotService {
  private apiUrl: string;
  private config: typeof API_CONFIG;

  constructor() {
    this.apiUrl = API_CONFIG.CHATBOT_API_URL;
    this.config = API_CONFIG;
  }

  /**
   * Test connection to chatbot API
   */
  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_query: "test connection",
        }),
        signal: AbortSignal.timeout(
          this.config.CONNECTION_TEST_TIMEOUT || 5000
        ),
      });

      return testResponse.ok;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  /**
   * Send query to chatbot and get response
   */
  async sendQuery(query: string): Promise<ChatbotResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_query: query,
        }),
        signal: AbortSignal.timeout(this.config.CHATBOT_API_TIMEOUT || 10000),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        user_id: data.user_id || "",
        response: data.response || "No response received",
        lead_flag: data.lead_flag || false,
        doc_urls: data.doc_urls || null,
      };
    } catch (error) {
      console.error("Chatbot query failed:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout. Please try again.");
        }
        throw new Error(`Failed to get response: ${error.message}`);
      }

      throw new Error("An unexpected error occurred");
    }
  }

  /**
   * Submit lead form data
   */
  async submitLead(
    leadData: LeadFormData
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit lead: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Lead submission failed:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService();
