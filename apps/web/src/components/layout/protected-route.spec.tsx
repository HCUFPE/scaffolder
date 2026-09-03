import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './protected-route';

const mockUseAuth = vi.fn();

vi.mock('../../context/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
  it('renders loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Conteúdo Protegido</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Verificando sessão segura...')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/login" element={<div>Tela de Login</div>} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Meu Perfil Protegido</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Tela de Login')).toBeInTheDocument();
    expect(screen.queryByText('Meu Perfil Protegido')).not.toBeInTheDocument();
  });

  it('renders protected content when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: 'usr_1', name: 'Ada', email: 'ada@example.com', role: 'USER' },
    });

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <ProtectedRoute>
          <div>Meu Perfil Protegido</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Meu Perfil Protegido')).toBeInTheDocument();
  });

  it('blocks access when required role does not match', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: 'usr_1', name: 'Ada', email: 'ada@example.com', role: 'USER' },
    });

    render(
      <MemoryRouter initialEntries={['/users']}>
        <ProtectedRoute requiredRole="ADMIN">
          <div>Painel de Usuários</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Acesso Restrito')).toBeInTheDocument();
    expect(screen.queryByText('Painel de Usuários')).not.toBeInTheDocument();
  });
});
