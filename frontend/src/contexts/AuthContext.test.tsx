import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the API service
vi.mock('../services/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn()
}));

// Test component to access context
const TestComponent = () => {
  const { user, login, logout, register, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register({ 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john@example.com', 
        password: 'password' 
      })}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides initial state with no user', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
  });

  it('handles successful login', async () => {
    const { login: mockLogin } = await import('../services/api');
    vi.mocked(mockLogin).mockResolvedValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user'
        },
        token: 'mock-token'
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    loginButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
    
    expect(localStorage.getItem('token')).toBe('mock-token');
  });

  it('handles login failure', async () => {
    const { login: mockLogin } = await import('../services/api');
    vi.mocked(mockLogin).mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    loginButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
    
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('handles successful registration', async () => {
    const { register: mockRegister } = await import('../services/api');
    vi.mocked(mockRegister).mockResolvedValue({
      data: {
        user: {
          id: '1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user'
        },
        token: 'mock-token'
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    registerButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('john@example.com');
    });
    
    expect(localStorage.getItem('token')).toBe('mock-token');
  });

  it('handles logout', async () => {
    // Set up initial logged in state
    localStorage.setItem('token', 'existing-token');
    
    const { getCurrentUser } = await import('../services/api');
    vi.mocked(getCurrentUser).mockResolvedValue({
      data: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial user load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    logoutButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
    
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('loads user from token on mount', async () => {
    localStorage.setItem('token', 'existing-token');
    
    const { getCurrentUser } = await import('../services/api');
    vi.mocked(getCurrentUser).mockResolvedValue({
      data: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('handles invalid token on mount', async () => {
    localStorage.setItem('token', 'invalid-token');
    
    const { getCurrentUser } = await import('../services/api');
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Invalid token'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
    
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('shows loading state during authentication', async () => {
    const { login: mockLogin } = await import('../services/api');
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    loginButton.click();
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });
});