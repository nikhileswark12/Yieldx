// Custom implementation inspired by React Bits API
import React, { useState, useEffect } from 'react';

const CountUp = ({ to, className, onComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(to);
      if (onComplete) onComplete();
      return;
    }

    let start = 0;
    const duration = 800; // 800ms
    const stepTime = Math.abs(Math.floor(duration / (to || 1)));
    
    if (stepTime === 0 || !isFinite(stepTime)) {
      setCount(to);
      if (onComplete) onComplete();
      return;
    }
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= to) {
        clearInterval(timer);
        setCount(to);
        if (onComplete) onComplete();
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [to]);

  return <span className={className}>{count}</span>;
};

export default CountUp;
