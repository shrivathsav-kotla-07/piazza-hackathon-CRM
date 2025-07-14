// AI Service - Handles AI chat responses and interactions
export class AIService {
  // Get initial AI greeting for a lead
  static getInitialGreeting(lead) {
    return `Hello! I'm here to help you with ${lead.name}.`;
  }

  // New method to ask the AI a question via the FastAPI backend
  static async askChat(userInput, leadData = null) { // Added leadData parameter
    try {
      const body = { user_input: userInput };
      if (leadData) {
        body.lead_data = leadData; // Include lead data if provided
      }

      const response = await fetch('/ask', { // Use relative URL for Vite proxy
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData); // Log full error response
        throw new Error(errorData.detail || 'Failed to get AI response.');
      }

      const data = await response.json();
      console.log('Backend success response:', data); // Log successful response
      return data;
    } catch (error) {
      console.error('Error in AIService.askChat:', error); // More specific error logging
      throw error;
    }
  }

  // Existing method to extract data from document using FastAPI backend
  static async extractDataFromDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/extract', { // Use relative URL for Vite proxy
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract data from document.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error extracting data from document:', error);
      throw error;
    }
  }
}
