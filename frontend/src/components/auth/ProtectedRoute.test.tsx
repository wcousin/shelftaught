import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
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

const mockAuthContextLoading = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: true
};

const TestComponent = () => <div>Protected Content</div>;

const renderWithProviders = (component: React.ReactElement, authContext = mockAuthContextLoggedOut) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      mockAuthContextLoggedIn
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      mockAuthContextLoggedOut
    );
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('renders children when user has required role', () => {
    renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <TestComponent />
      </ProtectedRoute>,
      mockAuthContextAdmin
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects when user does not have required role', () => {
    renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <TestComponent />
      </ProtectedRoute>,
      mockAuthContextLoggedIn
    );
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('shows loading spinner when authentication is loading', () => {
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      mockAuthContextLoading
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows access when no specific role is required and user is authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      mockAuthContextLoggedIn
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows admin access to user-level protected routes', () => {
    renderWithProviders(
      <ProtectedRoute requiredRole="user">
        <TestComponent />
      </ProtectedRoute>,
      mockAuthContextAdmin
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});