// API Configuration
export const API_CONFIG = {
  CHATBOT_API_URL:
    process.env.NEXT_PUBLIC_CHATBOT_API_URL ||
    "http://124.109.47.238:8079/query_response",
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
  response: string;
  related_documents?: Array<{
    documentId: string;
    documentName: string;
    downloadUrl: string;
  }>;
  error?: string;
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

      // Map API response to match our types
      const relatedDocs = (data.related_documents || data.documents || []).map(
        (doc: any) => ({
          documentId: doc.document_id || doc.id,
          documentName: doc.document_name || doc.name,
          downloadUrl: doc.download_url || doc.url,
        })
      );

      return {
        response: data.response || data.answer || "No response received",
        related_documents: relatedDocs,
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
}

// Export singleton instance
export const chatbotService = new ChatbotService();
