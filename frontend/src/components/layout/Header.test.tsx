import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';
import { AuthContext } from '../../contexts/AuthContext';

const mockAuthContextLoggedOut = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

const mockAuthContextLoggedIn = {
  user: {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user' as const
  },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

const mockAuthContextAdmin = {
  user: {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const
  },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

const renderWithProviders = (component: React.ReactElement, authContext = mockAuthContextLoggedOut) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  it('renders logo and site name', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByText('Shelf Taught')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shelf taught/i })).toHaveAttribute('href', '/');
  });

  it('renders navigation links', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByRole('link', { name: /browse/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /compare/i })).toBeInTheDocument();
  });

  it('shows login and register links when not authenticated', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    renderWithProviders(<Header />, mockAuthContextLoggedIn);
    
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
  });

  it('shows admin link for admin users', () => {
    renderWithProviders(<Header />, mockAuthContextAdmin);
    
    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
  });

  it('does not show admin link for regular users', () => {
    renderWithProviders(<Header />, mockAuthContextLoggedIn);
    
    expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger is clicked', () => {
    renderWithProviders(<Header />);
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(hamburgerButton);
    
    // Check if mobile menu is visible
    expect(screen.getByRole('navigation')).toHaveClass('block');
  });

  it('calls logout when logout button is clicked', () => {
    const mockLogout = vi.fn();
    const authContext = { ...mockAuthContextLoggedIn, logout: mockLogout };
    
    renderWithProviders(<Header />, authContext);
    
    const userMenuButton = screen.getByText('John');
    fireEvent.click(userMenuButton);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders search bar component', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByPlaceholderText(/search curricula/i)).toBeInTheDocument();
  });
});