import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders homepage', () => {
    render(<App />);
    const heading = screen.getByText(/Find the Perfect Homeschool Curriculum/i);
    expect(heading).toBeInTheDocument();
  });
});
