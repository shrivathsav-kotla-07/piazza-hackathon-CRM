import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const Toast = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="toast">
      <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
        {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default Toast; 