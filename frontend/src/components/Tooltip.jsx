import React, { useState } from 'react';

const Tooltip = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Escape') setIsVisible(false); }}
      style={{ position: 'relative', display: 'inline-block', marginLeft: '6px', cursor: 'help' }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="icon icon-tabler icon-tabler-info-circle" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        strokeWidth="2" 
        stroke="currentColor" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
        <path d="M12 9h.01" />
        <path d="M11 12h1v4h1" />
      </svg>
      
      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          padding: '8px 12px',
          borderRadius: 'var(--radius)',
          fontSize: '12px',
          width: 'max-content',
          maxWidth: '250px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          textAlign: 'left',
          fontWeight: 'normal',
          whiteSpace: 'normal',
          lineHeight: '1.4'
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
