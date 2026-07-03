import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Tooltip from '../components/Tooltip';
import '@testing-library/jest-dom';

describe('Tooltip Component', () => {
  it('renders icon correctly', () => {
    const { container } = render(<Tooltip text="Test Tooltip" />);
    expect(container.querySelector('.tooltip-container')).toBeInTheDocument();
  });

  it('shows tooltip on mouse enter and hides on mouse leave', async () => {
    const { container } = render(<Tooltip text="Test Info" />);
    
    // Initially not visible
    expect(screen.queryByText('Test Info')).not.toBeInTheDocument();
    
    // Trigger mouse enter
    fireEvent.mouseEnter(container.firstChild);
    
    // Now visible
    await waitFor(() => {
      expect(screen.getByText('Test Info')).toBeInTheDocument();
    });
    
    // Trigger mouse leave
    fireEvent.mouseLeave(container.firstChild);
    
    // Wait for it to disappear
    await waitFor(() => {
      expect(screen.queryByText('Test Info')).not.toBeInTheDocument();
    });
  });

  it('is keyboard accessible (focus and escape)', async () => {
    const { container } = render(<Tooltip text="Keyboard Info" />);
    
    // Focus the trigger
    const trigger = container.firstChild;
    fireEvent.focus(trigger);
    
    // Should be visible
    await waitFor(() => {
      expect(screen.getByText('Keyboard Info')).toBeInTheDocument();
    });
    
    // Press escape
    fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' });
    
    // Should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Keyboard Info')).not.toBeInTheDocument();
    });
  });
});
