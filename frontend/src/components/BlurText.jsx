// Custom implementation inspired by React Bits API
import React, { useState, useEffect } from 'react';

const BlurText = ({ text, className, style }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <>
      <style>
        {`
          .blur-text {
            filter: blur(10px);
            opacity: 0;
            transition: filter 0.8s ease, opacity 0.8s ease;
          }
          .blur-text.is-visible {
            filter: blur(0);
            opacity: 1;
          }
        `}
      </style>
      <div className={`blur-text ${visible ? 'is-visible' : ''} ${className || ''}`} style={style}>
        {text}
      </div>
    </>
  );
};

export default BlurText;
