import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../context/theme-context';
import { AuthLayout } from './auth-layout';

const mockLogout = vi.fn();
const mockManageAccount = vi.fn();

vi.mock('../../context/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'usr-1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'ADMIN' },
    isAuthenticated: true,
    isAdmin: true,
    logout: mockLogout,
    manageAccount: mockManageAccount,
  }),
}));

describe('AuthLayout', () => {
  it('renders categorized sidebar and opens user dropdown in header', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MemoryRouter>
            <AuthLayout />
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    );

    // Sidebar branding and category headings
    expect(screen.getByText('AppStart')).toBeInTheDocument();
    expect(screen.getAllByText('Visão Geral').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Módulos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Tarefas (CRUD)')).toBeInTheDocument();
    expect(screen.getByText('Usuários')).toBeInTheDocument();

    // User dropdown button in header
    const userButton = screen.getByLabelText('Menu do usuário');
    expect(userButton).toBeInTheDocument();

    // Open dropdown
    fireEvent.click(userButton);
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('Central de Segurança').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Encerrar Sessão (Sair)')).toBeInTheDocument();
  });
});
