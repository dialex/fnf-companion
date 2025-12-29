import React from 'react';
import { i18nManager } from '../managers/i18nManager';

const ConfirmationDialog = ({
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}) => {
  const t = i18nManager.t.bind(i18nManager);
  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body content">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onCancel}
            >
              {cancelText || t('dialog.no')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
            >
              {confirmText || t('dialog.yes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
