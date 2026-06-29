import React, { useState } from 'react';
import ChatPanel from './ChatPanel';
import CardIcon from '../icons/CardIcon';

const FloatingChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="chat-fab-root" aria-live="polite">
      {open && (
        <>
          <button
            type="button"
            className="chat-fab-backdrop"
            aria-label="Close assistant"
            onClick={() => setOpen(false)}
          />
          <div className="chat-fab-window" role="dialog" aria-label="CardSense Assistant">
            <div className="chat-fab-header">
              <div className="chat-fab-header-title">
                <CardIcon size={22} color="#5E17EB" />
                <span>Assistant</span>
              </div>
              <button
                type="button"
                className="chat-fab-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <ChatPanel compact />
          </div>
        </>
      )}

      <button
        type="button"
        className={`chat-fab-button ${open ? 'chat-fab-button--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        aria-expanded={open}
      >
        {open ? (
          <span className="chat-fab-button-icon">×</span>
        ) : (
          <CardIcon size={28} color="#FFFFFF" />
        )}
      </button>
    </div>
  );
};

export default FloatingChatWidget;
