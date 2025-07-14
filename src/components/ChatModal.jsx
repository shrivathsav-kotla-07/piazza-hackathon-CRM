import React from 'react';
import { X, Send } from 'lucide-react';

const ChatModal = ({ 
  isVisible, 
  selectedLead, 
  chatMessages, 
  inputMessage, 
  onInputChange, 
  onSubmit, 
  onClose 
}) => {
  if (!isVisible) return null; // Only check for isVisible

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {selectedLead ? `Chat with AI about ${selectedLead.name}` : 'General Chat with AI'}
          </h3>
          <button
            onClick={onClose}
            className="modal-close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="chat-messages">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.type}`}
              >
                <div
                  className={`chat-bubble ${message.type}`}
                >
                  {message.content}
                </div>
                {message.type === 'ai' && message.content.includes('Error:') && (
                  <div className="text-red-500 text-xs mt-1">
                    Please try again or rephrase your query.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <div className="chat-input">
            <input
              type="text"
              value={inputMessage}
              onChange={onInputChange}
              onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
              placeholder="Ask about follow-up or lead details..."
              className="form-input flex-1"
            />
            <button
              onClick={onSubmit}
              className="btn btn-primary"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
