import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../context/theme-context';
import { LoginPage } from './login-page';

const mockLogin = vi.fn();

vi.mock('../context/auth-context', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    login: mockLogin,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('renders native login form with username and password fields', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByText('AppStart')).toBeInTheDocument();
    expect(screen.getByText('Entrar na Conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/admin@appstart.local/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Sua senha secreta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar no Sistema/i })).toBeInTheDocument();
  });

  it('submits credentials and calls direct login', async () => {
    mockLogin.mockResolvedValueOnce({
      id: 'usr-1',
      name: 'Admin User',
      email: 'admin@appstart.local',
      role: 'ADMIN',
    });

    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/login?returnTo=%2Fprofile']}>
          <LoginPage />
        </MemoryRouter>
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText(/admin@appstart.local/i), {
      target: { value: 'admin@appstart.local' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Sua senha secreta/i), {
      target: { value: 'ChangeMe123456!' },
    });

    const submitBtn = screen.getByRole('button', { name: /Entrar no Sistema/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'admin@appstart.local',
        password: 'ChangeMe123456!',
      });
    });
  });

  it('displays error feedback when credentials are rejected', async () => {
    mockLogin.mockRejectedValueOnce(new Error('E-mail ou senha incorretos.'));

    render(
      <ThemeProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText(/admin@appstart.local/i), {
      target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Sua senha secreta/i), {
      target: { value: 'wrongpass' },
    });

    const submitBtn = screen.getByRole('button', { name: /Entrar no Sistema/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha incorretos.')).toBeInTheDocument();
    });
  });
});
