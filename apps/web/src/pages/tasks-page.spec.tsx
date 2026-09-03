import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { TasksPage } from './tasks-page';

vi.mock('../context/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'usr-1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'USER' },
    isAuthenticated: true,
    isAdmin: false,
  }),
}));

vi.mock('../lib/api-client', () => ({
  tasksControllerFindAll: vi.fn().mockResolvedValue({
    data: {
      data: [
        {
          id: 'task-1',
          title: 'Configurar CI/CD',
          description: 'Definir pipeline no GitHub Actions',
          status: 'PENDING',
          priority: 'HIGH',
          dueDate: '2026-12-31T00:00:00.000Z',
          ownerId: 'usr-1',
          createdAt: '2026-08-31T10:00:00.000Z',
          updatedAt: '2026-08-31T10:00:00.000Z',
        },
      ],
      meta: {
        page: 1,
        pageSize: 8,
        total: 1,
        totalPages: 1,
      },
    },
    status: 200,
    headers: new Headers(),
  }),
  tasksControllerCreate: vi.fn(),
  tasksControllerUpdate: vi.fn(),
  tasksControllerRemove: vi.fn(),
}));

describe('TasksPage', () => {
  it('renders tasks page with loaded tasks', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TasksPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Módulo de Referência: Tarefas')).toBeInTheDocument();
    expect(await screen.findByText('Configurar CI/CD')).toBeInTheDocument();
    expect(screen.getByText('Definir pipeline no GitHub Actions')).toBeInTheDocument();
    expect(screen.getAllByText('Alta').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pendente').length).toBeGreaterThanOrEqual(1);
  });
});
