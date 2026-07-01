import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <div className={`toast-icon ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
