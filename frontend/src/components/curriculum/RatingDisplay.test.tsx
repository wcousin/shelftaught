import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RatingDisplay from './RatingDisplay';

describe('RatingDisplay', () => {
  it('renders rating with correct number of stars', () => {
    render(<RatingDisplay rating={4.5} maxRating={5} />);
    
    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(4); // 4 full stars
    
    const halfStar = screen.getByText('☆');
    expect(halfStar).toBeInTheDocument();
  });

  it('displays rating number when showNumber is true', () => {
    render(<RatingDisplay rating={3.7} maxRating={5} showNumber={true} />);
    
    expect(screen.getByText('3.7')).toBeInTheDocument();
  });

  it('does not display rating number when showNumber is false', () => {
    render(<RatingDisplay rating={3.7} maxRating={5} showNumber={false} />);
    
    expect(screen.queryByText('3.7')).not.toBeInTheDocument();
  });

  it('handles zero rating correctly', () => {
    render(<RatingDisplay rating={0} maxRating={5} />);
    
    const emptyStars = screen.getAllByText('☆');
    expect(emptyStars).toHaveLength(5);
  });

  it('handles maximum rating correctly', () => {
    render(<RatingDisplay rating={5} maxRating={5} />);
    
    const fullStars = screen.getAllByText('★');
    expect(fullStars).toHaveLength(5);
  });

  it('applies custom size class', () => {
    const { container } = render(<RatingDisplay rating={4} maxRating={5} size="large" />);
    
    expect(container.firstChild).toHaveClass('text-lg');
  });

  it('applies default size when no size specified', () => {
    const { container } = render(<RatingDisplay rating={4} maxRating={5} />);
    
    expect(container.firstChild).toHaveClass('text-base');
  });
});