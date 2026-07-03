// Custom implementation inspired by React Bits API
import React, { useEffect, useState } from 'react';

const AnimatedList = ({ children, className, as: Component = 'div' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <>
      <style>
        {`
          .animated-list-container {
            opacity: 0;
            transition: opacity 0.5s ease;
          }
          .animated-list-container.is-visible {
            opacity: 1;
          }
          .animated-list-item {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
            transition-delay: var(--delay, 0s);
          }
          .animated-list-item.is-visible {
            opacity: 1;
            transform: translateY(0);
          }
        `}
      </style>
      <Component className={`${className || ''} animated-list-container ${visible ? 'is-visible' : ''}`}>
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;
          
          const childClassName = child.props.className || '';
          
          return React.cloneElement(child, { 
            className: `${childClassName} animated-list-item ${visible ? 'is-visible' : ''}`,
            style: {
              ...(child.props.style || {}),
              '--delay': `${index * 0.1}s`
            }
          });
        })}
      </Component>
    </>
  );
};

export default AnimatedList;
