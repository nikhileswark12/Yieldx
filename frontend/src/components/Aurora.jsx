// Custom implementation inspired by React Bits API
import React from 'react';

const Aurora = ({ className }) => {
  return (
    <>
      <style>
        {`
          .aurora-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
            background: linear-gradient(45deg, rgba(102, 187, 106, 0.2), rgba(46, 125, 50, 0.2));
            background-size: 200% 200%;
            animation: aurora-anim 10s infinite alternate;
          }
          @keyframes aurora-anim {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
        `}
      </style>
      <div className={`aurora-bg ${className || ''}`} />
    </>
  );
};

export default Aurora;
