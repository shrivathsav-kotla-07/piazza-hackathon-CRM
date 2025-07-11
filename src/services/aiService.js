// AI Service - Handles AI chat responses and interactions
export class AIService {
  // Generate AI response based on user message and lead data
  static generateResponse(message, lead) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('follow-up') || lowerMessage.includes('suggest')) {
      return `Email ${lead.name} at ${lead.email} to schedule a follow-up call.`;
    } 
    
    if (lowerMessage.includes('detail') || lowerMessage.includes('info')) {
      return `Name: ${lead.name}, Email: ${lead.email}, Phone: ${lead.phone || 'N/A'}, Status: ${lead.status}`;
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('reach')) {
      return `You can contact ${lead.name} via email at ${lead.email}${lead.phone ? ` or phone at ${lead.phone}` : ''}.`;
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
      return `Current status: ${lead.status}. You can update this status using the edit button.`;
    }
    
    return "I can help you with lead details, follow-up suggestions, or status updates. Try asking about 'follow-up', 'lead details', or 'contact information'.";
  }

  // Get initial AI greeting for a lead
  static getInitialGreeting(lead) {
    return `Hello! I'm here to help you with ${lead.name}. You can ask me about lead details, follow-up suggestions, or how to contact this lead.`;
  }

  // Process user message and return structured response
  static processMessage(message, lead) {
    const response = this.generateResponse(message, lead);
    
    return {
      type: 'ai',
      content: response,
      timestamp: new Date().toISOString()
    };
  }

  // Extract intent from user message
  static extractIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('follow-up') || lowerMessage.includes('suggest')) {
      return 'follow_up';
    }
    
    if (lowerMessage.includes('detail') || lowerMessage.includes('info')) {
      return 'get_details';
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('reach')) {
      return 'contact_info';
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
      return 'status_info';
    }
    
    return 'general_help';
  }
} 