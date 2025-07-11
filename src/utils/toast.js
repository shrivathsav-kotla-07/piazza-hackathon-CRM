// Toast Utility - Manages toast notifications
export class ToastManager {
  // Show a toast notification
  static show(message, type = 'success', duration = 3000) {
    return {
      message,
      type,
      timestamp: Date.now(),
      duration
    };
  }

  // Hide a toast notification
  static hide() {
    return null;
  }

  // Auto-hide toast after duration
  static autoHide(toast, callback) {
    if (!toast) return;
    
    setTimeout(() => {
      callback(null);
    }, toast.duration);
  }

  // Get toast CSS class based on type
  static getToastClass(type) {
    const baseClass = 'toast';
    return `${baseClass} ${type === 'success' ? 'toast-success' : 'toast-error'}`;
  }

  // Validate toast message
  static validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return false;
    }
    
    if (message.trim().length === 0) {
      return false;
    }
    
    return true;
  }

  // Get toast icon based on type
  static getToastIcon(type) {
    return type === 'success' ? 'CheckCircle' : 'AlertCircle';
  }
} 