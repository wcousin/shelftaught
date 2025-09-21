import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import { AuthContext } from '../../contexts/AuthContext';

const mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    renderWithProviders(<RegisterForm />);
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('renders register button', () => {
    renderWithProviders(<RegisterForm />);
    
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    renderWithProviders(<RegisterForm />);
    
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    await user.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    await user.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, '123');
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    await user.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    await user.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('calls register function with correct data on valid submission', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockResolvedValue({ success: true });
    const authContext = { ...mockAuthContext, register: mockRegister };
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <RegisterForm />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    await user.click(registerButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    });
  });

  it('displays error message on registration failure', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockRejectedValue(new Error('Email already exists'));
    const authContext = { ...mockAuthContext, register: mockRegister };
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <RegisterForm />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    await user.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('disables form during loading', () => {
    const authContext = { ...mockAuthContext, loading: true };
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <RegisterForm />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByRole('button', { name: /register/i })).toBeDisabled();
  });
});