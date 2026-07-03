import React from 'react';

const SoilStrip = ({ type = 'divider', progress = 100, loading = false }) => {
  const isDivider = type === 'divider';
  const isProgress = type === 'progress';

  // Base styles
  const stripStyle = {
    height: '3px',
    borderRadius: '2px',
    display: 'flex',
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'var(--color-border)',
    opacity: loading ? 0.7 : 1,
    animation: loading ? 'shimmer 1.5s infinite linear' : 'none',
    backgroundSize: '200% 100%',
    backgroundImage: loading ? 'linear-gradient(90deg, var(--color-border) 25%, var(--color-text-muted) 50%, var(--color-border) 75%)' : 'none'
  };

  const segments = [
    { color: 'var(--color-secondary)', width: '30%' },
    { color: 'var(--color-primary)', width: '40%' },
    { color: 'var(--color-accent)', width: '15%' },
    { color: 'var(--color-text)', width: '15%' }
  ];

  if (loading) {
    return <div style={stripStyle} />;
  }

  return (
    <div style={{ ...stripStyle, backgroundImage: 'none' }}>
      {segments.map((seg, index) => {
        let width = seg.width;
        if (isProgress) {
          // If progress is e.g. 33%, only show up to that width total
          // This is a simplified progress mapping.
          // Better approach for progress:
          width = `${(progress / 100) * parseFloat(seg.width)}%`;
        }
        return (
          <div 
            key={index} 
            style={{ 
              backgroundColor: isProgress ? 'var(--color-primary)' : seg.color, 
              width: isDivider ? seg.width : width,
              height: '100%',
              transition: 'width 0.3s ease'
            }} 
          />
        );
      })}
    </div>
  );
};

export default SoilStrip;
