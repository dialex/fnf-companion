import React, { useEffect, useRef } from 'react';
import { t } from '../translations';

const NotificationBanner = ({ message, type = 'success', onDismiss }) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Auto-dismiss after 3 seconds
    timeoutRef.current = setTimeout(() => {
      onDismiss();
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onDismiss]);

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onDismiss();
  };

  const alertClass = type === 'success' ? 'alert-success' : 'alert-info';

  return (
    <div
      className={`alert ${alertClass} alert-dismissible fade show mb-3`}
      role="alert"
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1050,
        minWidth: '300px',
        maxWidth: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="content">{message}</div>
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={handleClose}
        style={{ transform: 'scale(0.5)' }}
      />
    </div>
  );
};

export default NotificationBanner;
